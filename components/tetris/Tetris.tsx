'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CLEAR_MS, COLS, Game, HIDDEN, ROWS, SHAPES, type PieceType } from './engine';
import { Net, type Msg, type NetStatus, type PlayerStatus, type StateMsg } from './net';

/* ============================================================
   TETRIS — canvas renderer, touch gestures, sound, overlays
   ============================================================ */

type Phase = 'start' | 'name' | 'lobby' | 'countdown' | 'playing' | 'paused' | 'over' | 'watching';

const COLOURS: Record<PieceType, string> = {
  I: '#00f0ff',
  O: '#ffe600',
  T: '#c84dff',
  S: '#39ff14',
  Z: '#ff2d55',
  J: '#3d7bff',
  L: '#ff9500',
};
const TYPES = Object.keys(COLOURS) as PieceType[];
const VISIBLE = ROWS - HIDDEN;
const BEST_KEY = 't.best';
const MUTE_KEY = 't.muted';
const NAME_KEY = 't.name';
const WATCH_BAR = 64;
const ME = '#00f0ff';
const THEM = '#ff2d95';

const NET_LABEL: Record<NetStatus, string> = {
  connecting: 'Connecting…',
  waiting: 'Waiting for player 2…',
  connected: '',
  full: 'Lobby full — solo only',
  offline: 'Offline — solo only',
};

interface PeerInfo { name: string; st: PlayerStatus; score: number; lines: number }

const statusOf = (p: Phase): PlayerStatus =>
  p === 'playing' || p === 'paused' || p === 'countdown' ? 'playing' : p === 'over' || p === 'watching' ? 'over' : 'lobby';

/** The lobby is open to anyone, so nothing a peer sends is trusted as-is */
const sanitise = (m: StateMsg): StateMsg => {
  const str = (v: unknown, re: RegExp) => (typeof v === 'string' && re.test(v) ? v : undefined);
  const num = (v: unknown) => (Number.isFinite(v) ? Math.max(0, Math.floor(v as number)) : 0);
  return {
    t: 'state',
    name: String(m.name ?? '').replace(/[^ -~]/g, '').slice(0, 10) || '???',
    st: m.st === 'playing' || m.st === 'over' ? m.st : 'lobby',
    score: num(m.score),
    lines: num(m.lines),
    level: num(m.level) || 1,
    board: str(m.board, /^[IJLOSTZ.]{200}$/),
    hold: str(m.hold, /^[IJLOSTZ]?$/),
    next: str(m.next, /^[IJLOSTZ]{0,2}$/),
  };
};

/** Visible rows as 200 chars, falling piece included, for the other player to watch */
const encode = (g: Game) => {
  const rows = g.board.slice(HIDDEN).map((r) => r.map((c) => c ?? '.'));
  const p = g.cur;
  if (p) {
    for (const [x, y] of SHAPES[p.type][p.rot]) {
      const ry = p.y + y - HIDDEN;
      if (ry >= 0) rows[ry][p.x + x] = p.type;
    }
  }
  return rows.map((r) => r.join('')).join('');
};

interface Box { x: number; y: number; w: number; h: number }
interface Layout {
  W: number; H: number; dpr: number; cell: number;
  board: Box; hold: Box; mid: Box; next: Box;
}
interface Popup { text: string; t: number; colour: string }
interface Trail { cells: [number, number][]; fromY: number; toY: number; colour: string; t: number }

const inBox = (b: Box, x: number, y: number) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ── Sound: synthesised, no audio files ─────────────────────── */
class Sfx {
  ctx: AudioContext | null = null;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
  }

  tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.08, delay = 0, slideTo?: number) {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  arp(notes: number[], step = 0.06, type: OscillatorType = 'square', vol = 0.08) {
    notes.forEach((n, i) => this.tone(n, step * 2.2, type, vol, i * step));
  }
}

const buzz = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
};

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const sfxRef = useRef(new Sfx());
  const phaseRef = useRef<Phase>('start');

  const [phase, setPhaseState] = useState<Phase>('start');
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState(0);
  const [result, setResult] = useState({ score: 0, lines: 0, level: 1, record: false });
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [name, setName] = useState('');
  const [draft, setDraft] = useState('');
  const [netStatus, setNetStatus] = useState<NetStatus>('connecting');
  const [peer, setPeer] = useState<PeerInfo | null>(null);
  const [count, setCount] = useState(3);

  const netRef = useRef<Net | null>(null);
  const remoteRef = useRef<StateMsg | null>(null);
  const nameRef = useRef('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resizeRef = useRef<() => void>(() => {});

  /* ── What the other player is told about me ───────────── */
  const myState = useCallback((withBoard: boolean): StateMsg => {
    const g = gameRef.current;
    const st = statusOf(phaseRef.current);
    const live = st !== 'lobby' && g;
    const msg: StateMsg = {
      t: 'state',
      name: nameRef.current,
      st,
      score: live ? g.score : 0,
      lines: live ? g.lines : 0,
      level: live ? g.level : 1,
    };
    if (withBoard && live) {
      msg.board = encode(g);
      msg.hold = g.hold ?? '';
      msg.next = g.queue.slice(0, 2).join('');
    }
    return msg;
  }, []);

  const setPhase = useCallback(
    (p: Phase) => {
      phaseRef.current = p;
      setPhaseState(p);
      netRef.current?.send(myState(p === 'over'));
    },
    [myState],
  );

  const startCountdown = useCallback(
    (fromRemote: boolean) => {
      if (!fromRemote) netRef.current?.send({ t: 'start' });
      timersRef.current.forEach(clearTimeout);
      gameRef.current = null;
      setCount(3);
      setPhase('countdown');
      sfxRef.current.tone(440, 0.12, 'square', 0.08);
      timersRef.current = [1, 2, 3].map((n) =>
        setTimeout(() => {
          if (n < 3) {
            setCount(3 - n);
            sfxRef.current.tone(440, 0.12, 'square', 0.08);
            return;
          }
          sfxRef.current.tone(880, 0.3, 'square', 0.1);
          gameRef.current = new Game();
          setPhase('playing');
        }, n * 1000),
      );
    },
    [setPhase],
  );

  /* ── Lobby connection ─────────────────────────────────── */
  const onMessage = useCallback(
    (m: Msg) => {
      if (m?.t === 'start') {
        if (phaseRef.current === 'lobby') startCountdown(true);
        return;
      }
      if (m?.t !== 'state') return;
      m = sanitise(m);
      const prev = remoteRef.current;
      // lobby pings carry no board: keep the last one so a finished game stays watchable
      remoteRef.current = m.board ? m : { ...m, board: prev?.board, hold: prev?.hold, next: prev?.next };
      if (!prev || prev.st !== m.st || prev.name !== m.name || (m.st === 'over' && prev.score !== m.score)) {
        setPeer({ name: m.name, st: m.st, score: m.score, lines: m.lines });
      }
      if (m.st !== 'playing' && phaseRef.current === 'watching') setPhase('over');
    },
    [setPhase, startCountdown],
  );

  const onStatus = useCallback(
    (s: NetStatus) => {
      setNetStatus(s);
      if (s === 'connected') {
        netRef.current?.send(myState(true));
        return;
      }
      remoteRef.current = null;
      setPeer(null);
      if (phaseRef.current === 'watching') setPhase('over');
    },
    [myState, setPhase],
  );

  const handlersRef = useRef({ onMessage, onStatus });
  handlersRef.current = { onMessage, onStatus };

  const enterLobby = useCallback(() => {
    netRef.current ??= new Net({
      onMessage: (m) => handlersRef.current.onMessage(m),
      onStatus: (s) => handlersRef.current.onStatus(s),
    });
    setPhase('lobby');
  }, [setPhase]);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      netRef.current?.destroy();
      netRef.current = null;
    },
    [],
  );

  // the watch bar takes space from the board, so the layout depends on the phase
  useEffect(() => resizeRef.current(), [phase]);

  /* ── Persisted settings ───────────────────────────────── */
  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
      const m = localStorage.getItem(MUTE_KEY) === '1';
      setMuted(m);
      sfxRef.current.muted = m;
      const n = localStorage.getItem(NAME_KEY) ?? '';
      nameRef.current = n;
      setName(n);
      setDraft(n);
    } catch {}
    setCanFullscreen(!!document.fullscreenEnabled);
  }, []);

  /* ── Keep the screen awake while playing ──────────────── */
  useEffect(() => {
    if (phase !== 'playing' || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {});
    return () => void lock?.release().catch(() => {});
  }, [phase]);

  /* ── Game loop, drawing, input ────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const sfx = sfxRef.current;
    const bg = document.createElement('canvas');
    const sprites = {} as Record<PieceType, HTMLCanvasElement>;
    let L: Layout;
    let pad = 0;
    let font = 'sans-serif';
    let raf = 0;
    let last = performance.now();
    let shake = 0;
    let netAcc = 0;
    const popups: Popup[] = [];
    const trails: Trail[] = [];

    /* ── Layout ─────────────────────────────────────────── */
    const resize = () => {
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      font = getComputedStyle(canvas).fontFamily;

      const gap = 10;
      const hudH = Math.max(64, Math.min(110, H * 0.12));
      const reserve = phaseRef.current === 'watching' ? WATCH_BAR : 0;
      const cell = Math.floor(Math.min((W - 12) / COLS, (H - reserve - hudH - gap - 10) / VISIBLE));
      const bw = cell * COLS;
      const bh = cell * VISIBLE;
      const bx = Math.round((W - bw) / 2);
      const top = Math.max(4, Math.round((H - reserve - hudH - gap - bh) / 2));
      const holdW = Math.round(Math.min(hudH, bw * 0.24));
      const nextW = Math.round(bw * 0.36);

      L = {
        W, H, dpr, cell,
        board: { x: bx, y: top + hudH + gap, w: bw, h: bh },
        hold: { x: bx, y: top, w: holdW, h: hudH },
        next: { x: bx + bw - nextW, y: top, w: nextW, h: hudH },
        mid: { x: bx + holdW, y: top, w: bw - holdW - nextW, h: hudH },
      };
      buildSprites();
      buildBackground();
    };

    /* One glowing block per colour, drawn once, then stamped */
    const buildSprites = () => {
      const { cell, dpr } = L;
      pad = Math.round(cell * 0.4);
      const size = cell + pad * 2;
      for (const t of TYPES) {
        const s = document.createElement('canvas');
        s.width = s.height = Math.round(size * dpr);
        const c = s.getContext('2d')!;
        c.scale(dpr, dpr);
        const r = cell * 0.2;
        c.shadowColor = COLOURS[t];
        c.shadowBlur = pad * 0.85 * dpr;
        c.fillStyle = COLOURS[t];
        roundRect(c, pad + 1.5, pad + 1.5, cell - 3, cell - 3, r);
        c.fill();
        c.shadowBlur = 0;
        const inset = Math.max(3, cell * 0.14);
        c.fillStyle = 'rgba(0,0,0,0.62)';
        roundRect(c, pad + inset, pad + inset, cell - inset * 2, cell - inset * 2, r * 0.6);
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.5)';
        roundRect(c, pad + inset + 2, pad + inset + 2, cell * 0.22, cell * 0.08, 1);
        c.fill();
        sprites[t] = s;
      }
    };

    const panel = (c: CanvasRenderingContext2D, b: Box, colour: string, label?: string) => {
      c.save();
      c.shadowColor = colour;
      c.shadowBlur = 12;
      c.strokeStyle = colour;
      c.lineWidth = 1.5;
      c.fillStyle = 'rgba(4,6,14,0.9)';
      roundRect(c, b.x + 0.75, b.y + 0.75, b.w - 1.5, b.h - 1.5, 8);
      c.fill();
      c.stroke();
      c.restore();
      if (label) {
        c.fillStyle = colour;
        c.font = `700 9px ${font}`;
        c.textAlign = 'center';
        c.textBaseline = 'top';
        c.fillText(label, b.x + b.w / 2, b.y + 7);
      }
    };

    /* Everything that never changes between frames */
    const buildBackground = () => {
      const { W, H, dpr, cell, board, hold, next } = L;
      bg.width = canvas.width;
      bg.height = canvas.height;
      const c = bg.getContext('2d')!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);

      const inset = 3;
      panel(c, { x: hold.x, y: hold.y, w: hold.w - inset, h: hold.h }, '#ff2d95', 'HOLD');
      panel(c, { x: next.x + inset, y: next.y, w: next.w - inset, h: next.h }, '#00f0ff', 'NEXT');
      panel(c, { x: board.x - 3, y: board.y - 3, w: board.w + 6, h: board.h + 6 }, '#00f0ff');

      c.fillStyle = 'rgba(120,160,255,0.16)';
      for (let y = 1; y < VISIBLE; y++) {
        for (let x = 1; x < COLS; x++) c.fillRect(board.x + x * cell - 0.75, board.y + y * cell - 0.75, 1.5, 1.5);
      }
    };

    /* ── Drawing ────────────────────────────────────────── */
    const block = (t: PieceType, px: number, py: number, size = L.cell) => {
      const k = size / L.cell;
      ctx.drawImage(sprites[t], px - pad * k, py - pad * k, size + pad * 2 * k, size + pad * 2 * k);
    };

    const mini = (t: PieceType, b: Box, maxCell: number) => {
      const cells = SHAPES[t][0];
      const xs = cells.map((c) => c[0]);
      const ys = cells.map((c) => c[1]);
      const w = Math.max(...xs) - Math.min(...xs) + 1;
      const h = Math.max(...ys) - Math.min(...ys) + 1;
      const size = Math.floor(Math.min(maxCell, (b.w - 8) / w, (b.h - 8) / h));
      const ox = b.x + (b.w - w * size) / 2 - Math.min(...xs) * size;
      const oy = b.y + (b.h - h * size) / 2 - Math.min(...ys) * size;
      cells.forEach(([x, y]) => block(t, ox + x * size, oy + y * size, size));
    };

    const fitText = (text: string, weight: number, max: number, width: number) => {
      let size = max;
      do {
        ctx.font = `${weight} ${size}px ${font}`;
      } while (ctx.measureText(text).width > width && --size > 8);
    };

    const draw = (dt: number) => {
      const g = gameRef.current;
      const { W, H, dpr, cell, board, hold, mid, next } = L;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (shake > 0) {
        shake = Math.max(0, shake - dt);
        const a = (shake / 300) * cell * 0.3;
        ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a);
      }
      ctx.drawImage(bg, 0, 0, W, H);

      const r = remoteRef.current;
      const watching = phaseRef.current === 'watching' && !!r?.board;
      if (!g && !watching) return;
      const view = watching
        ? { hold: (r.hold || null) as PieceType | null, canHold: true, next: (r.next ?? '').split('') as PieceType[], score: r.score, level: r.level, lines: r.lines }
        : { hold: g!.hold, canHold: g!.canHold, next: g!.queue, score: g!.score, level: g!.level, lines: g!.lines };

      /* HUD */
      ctx.globalCompositeOperation = 'lighter';
      const labelH = 16;
      if (view.hold) {
        ctx.globalAlpha = view.canHold ? 1 : 0.3;
        mini(view.hold, { x: hold.x, y: hold.y + labelH, w: hold.w - 3, h: hold.h - labelH }, cell * 0.55);
        ctx.globalAlpha = 1;
      }
      const bigW = (next.w - 3) * 0.6;
      const nb = { x: next.x + 3, y: next.y + labelH, w: next.w - 3, h: next.h - labelH };
      if (view.next[0]) mini(view.next[0], { x: nb.x, y: nb.y, w: bigW, h: nb.h }, cell * 0.5);
      ctx.globalAlpha = 0.7;
      if (view.next[1]) mini(view.next[1], { x: nb.x + bigW, y: nb.y, w: nb.w - bigW, h: nb.h }, cell * 0.32);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const column = (x: number, w: number, label: string, colour: string, score: number, sub: string, dim = false) => {
        const mx = x + w / 2;
        ctx.globalAlpha = dim ? 0.45 : 1;
        if (label) {
          ctx.fillStyle = colour;
          fitText(label, 700, 9, w - 6);
          ctx.fillText(label, mx, mid.y + mid.h * 0.14);
        }
        ctx.fillStyle = '#fff';
        ctx.shadowColor = colour;
        ctx.shadowBlur = 10;
        fitText(String(score), 900, Math.min(26, mid.h * 0.3), w - 8);
        ctx.fillText(String(score), mx, mid.y + mid.h * (label ? 0.38 : 0.3));
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#6b7a90';
        fitText(sub, 700, 9, w - 6);
        ctx.fillText(sub, mx, mid.y + mid.h * (label ? 0.6 : 0.58));
        ctx.globalAlpha = 1;
      };

      if (watching) {
        column(mid.x, mid.w, r.name, THEM, view.score, `LV ${view.level}  ·  ${view.lines}`);
      } else if (r && r.st !== 'lobby') {
        const half = mid.w / 2;
        column(mid.x, half, nameRef.current, ME, view.score, `${view.lines} L`);
        column(mid.x + half, half, r.name, THEM, r.score, r.st === 'over' ? 'OUT' : `${r.lines} L`, r.st === 'over');
      } else {
        column(mid.x, mid.w, '', ME, view.score, `LV ${view.level}  ·  ${view.lines}`);
      }
      if (!watching) {
        // pause glyph
        const mx = mid.x + mid.w / 2;
        const py = mid.y + mid.h * 0.76;
        ctx.fillStyle = THEM;
        ctx.fillRect(mx - 6, py, 4, 12);
        ctx.fillRect(mx + 2, py, 4, 12);
      }

      /* Field */
      ctx.save();
      ctx.beginPath();
      ctx.rect(board.x, board.y, board.w, board.h);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';

      const cx = (x: number) => board.x + x * cell;
      const cy = (y: number) => board.y + (y - HIDDEN) * cell;
      const fade = g?.clearing ? 1 - g.clearing.t / CLEAR_MS : 1;

      for (let y = HIDDEN; y < ROWS; y++) {
        ctx.globalAlpha = !watching && g!.clearing?.rows.includes(y) ? fade : 1;
        for (let x = 0; x < COLS; x++) {
          const ch = watching ? r.board![(y - HIDDEN) * COLS + x] : g!.board[y][x];
          if (ch && ch !== '.') block(ch as PieceType, cx(x), cy(y));
        }
      }
      ctx.globalAlpha = 1;
      if (watching || !g) {
        ctx.restore();
        return;
      }

      for (let i = trails.length - 1; i >= 0; i--) {
        const tr = trails[i];
        tr.t += dt;
        const k = 1 - tr.t / 200;
        if (k <= 0) {
          trails.splice(i, 1);
          continue;
        }
        for (const [x, ry] of tr.cells) {
          const y0 = cy(tr.fromY + ry);
          const y1 = cy(tr.toY + ry);
          const grad = ctx.createLinearGradient(0, y0, 0, y1);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, tr.colour);
          ctx.globalAlpha = k * 0.45;
          ctx.fillStyle = grad;
          ctx.fillRect(cx(x) + 2, y0, cell - 4, y1 - y0);
        }
        ctx.globalAlpha = 1;
      }

      const p = g.cur;
      if (p) {
        const gy = g.ghostY();
        const cells = SHAPES[p.type][p.rot];
        if (gy !== p.y) {
          ctx.globalAlpha = 0.24;
          cells.forEach(([x, y]) => block(p.type, cx(p.x + x), cy(gy + y)));
          ctx.globalAlpha = 1;
        }
        cells.forEach(([x, y]) => block(p.type, cx(p.x + x), cy(p.y + y)));
      }

      if (g.clearing) {
        const k = g.clearing.t / CLEAR_MS;
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = fade * 0.85;
        const w = board.w * Math.min(1, 0.2 + k * 1.6);
        for (const y of g.clearing.rows) ctx.fillRect(board.x + (board.w - w) / 2, cy(y) + cell * 0.2, w, cell * 0.6);
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      /* Popups */
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = popups.length - 1; i >= 0; i--) {
        const pop = popups[i];
        pop.t += dt;
        const k = pop.t / 1000;
        if (k >= 1) {
          popups.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
        ctx.fillStyle = '#fff';
        ctx.shadowColor = pop.colour;
        ctx.shadowBlur = 18;
        fitText(pop.text, 900, cell * 0.95, board.w - 16);
        ctx.fillText(pop.text, board.x + board.w / 2, board.y + board.h * 0.32 - k * cell * 1.5 - i * cell * 1.2);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    };

    /* ── Engine events → sound, vibration, effects ──────── */
    const flush = () => {
      const g = gameRef.current;
      if (!g || !g.events.length) return;
      for (const e of g.events) {
        switch (e.type) {
          case 'move':
            sfx.tone(520, 0.03, 'square', 0.03);
            break;
          case 'rotate':
            sfx.tone(760, 0.05, 'triangle', 0.08);
            break;
          case 'hold':
            sfx.tone(440, 0.07, 'triangle', 0.08, 0, 660);
            break;
          case 'lock':
            sfx.tone(160, 0.08, 'sine', 0.16, 0, 90);
            buzz(8);
            break;
          case 'hard':
            sfx.tone(220, 0.12, 'sine', 0.22, 0, 55);
            buzz(16);
            if (e.toY > e.fromY) trails.push({ cells: e.cells, fromY: e.fromY, toY: e.toY, colour: COLOURS[e.piece], t: 0 });
            break;
          case 'spin':
            popups.push({ text: e.spin === 'mini' ? 'MINI T-SPIN' : 'T-SPIN', t: 0, colour: COLOURS.T });
            sfx.arp([660, 880], 0.05, 'triangle');
            break;
          case 'clear': {
            const names = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS'];
            const spin = e.spin === 'full' ? 'T-SPIN ' : e.spin === 'mini' ? 'MINI T-SPIN ' : '';
            const big = e.lines === 4 || e.spin !== 'none';
            if (big || e.lines > 1) popups.push({ text: spin + names[e.lines], t: 0, colour: e.spin !== 'none' ? COLOURS.T : COLOURS.I });
            if (e.b2b) popups.push({ text: 'BACK TO BACK', t: 0, colour: '#ff2d95' });
            if (e.combo > 0) popups.push({ text: `COMBO ×${e.combo}`, t: 0, colour: '#ffe600' });
            const scale = [523, 659, 784, 1047, 1319];
            sfx.arp(scale.slice(0, big ? 5 : e.lines + 1), 0.055);
            buzz(big ? [30, 30, 60] : 20 + e.lines * 8);
            if (big) shake = 300;
            break;
          }
          case 'level':
            popups.push({ text: `LEVEL ${e.level}`, t: 0, colour: '#39ff14' });
            sfx.arp([392, 523, 659, 784, 1047], 0.07, 'triangle', 0.1);
            break;
          case 'over': {
            sfx.arp([392, 330, 262, 196, 131], 0.13, 'sawtooth', 0.07);
            buzz([60, 40, 140]);
            let prev = 0;
            try {
              prev = Number(localStorage.getItem(BEST_KEY)) || 0;
              if (g.score > prev) localStorage.setItem(BEST_KEY, String(g.score));
            } catch {}
            setBest(Math.max(prev, g.score));
            setResult({ score: g.score, lines: g.lines, level: g.level, record: g.score > prev && g.score > 0 });
            setPhase('over');
            break;
          }
        }
      }
      g.events.length = 0;
    };

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (phaseRef.current === 'playing') gameRef.current?.tick(dt);
      flush();
      if (L) draw(dt);
      raf = requestAnimationFrame(frame);
    };

    /* ── Touch gestures ─────────────────────────────────── */
    interface Gesture {
      id: number; sx: number; sy: number; ax: number; ay: number; t0: number;
      axis: 'h' | 'v' | null; two: boolean; samples: { y: number; t: number }[];
    }
    let gesture: Gesture | null = null;
    const SLOP = 10;

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e: PointerEvent) => {
      e.preventDefault();
      if (phaseRef.current !== 'playing') return;
      if (gesture) {
        gesture.two = true;
        return;
      }
      const { x, y } = pos(e);
      gesture = { id: e.pointerId, sx: x, sy: y, ax: x, ay: y, t0: e.timeStamp, axis: null, two: false, samples: [{ y, t: e.timeStamp }] };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };

    const moveEvt = (e: PointerEvent) => {
      const g = gameRef.current;
      const s = gesture;
      if (!s || !g || e.pointerId !== s.id || phaseRef.current !== 'playing') return;
      e.preventDefault();
      const { x, y } = pos(e);
      s.samples.push({ y, t: e.timeStamp });
      if (s.samples.length > 8) s.samples.shift();

      if (!s.axis) {
        const dx = x - s.sx;
        const dy = y - s.sy;
        if (Math.hypot(dx, dy) < SLOP) return;
        s.axis = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }

      const stepX = L.cell * 0.85;
      const stepY = L.cell * 0.9;
      if (s.axis === 'h' && y - s.ay > L.cell * 1.8) {
        s.axis = 'v';
        s.ay = y;
      } else if (s.axis === 'v' && Math.abs(x - s.ax) > L.cell * 1.4) {
        s.axis = 'h';
        s.ax = x;
      }

      if (s.axis === 'h') {
        while (x - s.ax >= stepX) {
          g.move(1);
          s.ax += stepX;
          s.ay = y;
        }
        while (s.ax - x >= stepX) {
          g.move(-1);
          s.ax -= stepX;
          s.ay = y;
        }
      } else {
        while (y - s.ay >= stepY) {
          g.softDrop();
          s.ay += stepY;
          s.ax = x;
        }
      }
    };

    const up = (e: PointerEvent) => {
      const g = gameRef.current;
      const s = gesture;
      if (!s || e.pointerId !== s.id) return;
      gesture = null;
      if (!g || phaseRef.current !== 'playing') return;
      const { x, y } = pos(e);

      if (!s.axis) {
        if (e.timeStamp - s.t0 > 350) return;
        if (s.two) g.rotate(-1);
        else if (inBox(L.hold, x, y)) g.holdPiece();
        else if (inBox(L.mid, x, y)) pause();
        else g.rotate(1);
        return;
      }

      if (s.axis === 'v') {
        // velocity over the last ~90 ms of the gesture
        const ref = s.samples.find((p) => e.timeStamp - p.t <= 90) ?? s.samples[0];
        const span = Math.max(1, e.timeStamp - ref.t);
        const vy = (y - ref.y) / span;
        const dy = y - s.sy;
        if (vy > 0.9 && dy > 30) g.hardDrop();
        else if (vy < -0.6 && dy < -40) g.holdPiece();
      }
    };

    const cancel = () => {
      gesture = null;
    };

    const pause = () => {
      if (phaseRef.current === 'playing') setPhase('paused');
    };
    const onHide = () => {
      if (document.hidden) pause();
    };
    const block2 = (e: Event) => e.preventDefault();

    resize();
    resizeRef.current = resize;
    document.fonts?.ready.then(resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', moveEvt);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', cancel);
    canvas.addEventListener('contextmenu', block2);
    document.addEventListener('visibilitychange', onHide);
    // iOS ignores user-scalable=no; block pinch and double-tap zoom here
    document.addEventListener('gesturestart', block2);
    document.addEventListener('touchmove', block2, { passive: false });
    raf = requestAnimationFrame(frame);

    // On a timer, not the frame loop: frames stop in a hidden tab, and silence reads as a dropped player
    const beat = setInterval(() => {
      const net = netRef.current;
      if (!net) return;
      const live = statusOf(phaseRef.current) === 'playing';
      netAcc += 100;
      if (netAcc < (live ? 100 : 2000)) return;
      netAcc = 0;
      net.send(myState(live));
      net.check();
    }, 100);

    return () => {
      clearInterval(beat);
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', moveEvt);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('contextmenu', block2);
      document.removeEventListener('visibilitychange', onHide);
      document.removeEventListener('gesturestart', block2);
      document.removeEventListener('touchmove', block2);
    };
  }, [setPhase, myState]);

  /* ── Overlay actions ──────────────────────────────────── */
  const play = () => {
    sfxRef.current.unlock();
    if (nameRef.current) enterLobby();
    else setPhase('name');
  };

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    const n = draft.trim().toUpperCase().slice(0, 10);
    if (!n) return;
    nameRef.current = n;
    setName(n);
    try {
      localStorage.setItem(NAME_KEY, n);
    } catch {}
    enterLobby();
  };

  const start = () => {
    sfxRef.current.unlock();
    startCountdown(false);
  };

  const resume = () => {
    sfxRef.current.unlock();
    setPhase('playing');
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    sfxRef.current.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    } catch {}
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  };

  const extras = (
    <div className="t-row">
      <button className="t-btn t-btn--ghost" onClick={toggleMute}>
        Sound {muted ? 'off' : 'on'}
      </button>
      {canFullscreen && (
        <button className="t-btn t-btn--ghost" onClick={toggleFullscreen}>
          Fullscreen
        </button>
      )}
    </div>
  );

  const peerLine = !peer ? '' : peer.st === 'playing' ? 'PLAYING' : peer.st === 'over' ? `FINISHED · ${peer.score}` : 'READY';
  const verdict =
    peer?.st !== 'over'
      ? result.record
        ? 'NEW BEST'
        : 'GAME OVER'
      : result.score > peer.score
        ? 'YOU WIN'
        : result.score < peer.score
          ? `${peer.name} WINS`
          : 'DRAW';
  const watchBtn = peer?.st === 'playing' && (
    <button className="t-btn" onClick={() => setPhase('watching')}>
      Watch {peer.name}
    </button>
  );

  return (
    <div className="t-root">
      <canvas ref={canvasRef} className="t-canvas" />

      {phase === 'start' && (
        <div className="t-overlay">
          <h1 className="t-title">T</h1>
          <button className="t-btn" onClick={play}>
            Play
          </button>
          <div className="t-help">
            <b>Drag</b> <span>Move</span>
            <b>Tap</b> <span>Rotate</span>
            <b>Two-finger tap</b> <span>Rotate back</span>
            <b>Drag down</b> <span>Soft drop</span>
            <b>Flick down</b> <span>Hard drop</span>
            <b>Flick up</b> <span>Hold</span>
          </div>
          {best > 0 && (
            <dl className="t-stats">
              <dt>BEST</dt>
              <dd>{best}</dd>
            </dl>
          )}
          {extras}
        </div>
      )}

      {phase === 'name' && (
        <form className="t-overlay" onSubmit={saveName}>
          <h2 className="t-heading">PICK A NAME</h2>
          <input
            className="t-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={10}
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="go"
          />
          <button className="t-btn" type="submit">
            Join lobby
          </button>
        </form>
      )}

      {phase === 'lobby' && (
        <div className="t-overlay">
          <h2 className="t-heading">LOBBY</h2>
          <ul className="t-players">
            <li>
              <b style={{ color: ME }}>{name}</b>
              <span>YOU</span>
            </li>
            {peer ? (
              <li>
                <b style={{ color: THEM }}>{peer.name}</b>
                <span>{peerLine}</span>
              </li>
            ) : (
              <li className="t-players__empty">{NET_LABEL[netStatus] || NET_LABEL.connecting}</li>
            )}
          </ul>
          <button className="t-btn" onClick={start}>
            Start
          </button>
          {watchBtn}
          <div className="t-row">
            <button className="t-btn t-btn--ghost" onClick={() => setPhase('name')}>
              Change name
            </button>
          </div>
          {extras}
        </div>
      )}

      {phase === 'countdown' && (
        <div className="t-overlay t-overlay--clear">
          <div className="t-count" key={count}>
            {count}
          </div>
        </div>
      )}

      {phase === 'paused' && (
        <div className="t-overlay">
          <h2 className="t-heading">PAUSED</h2>
          <button className="t-btn" onClick={resume}>
            Resume
          </button>
          <button className="t-btn t-btn--ghost" onClick={enterLobby}>
            Quit to lobby
          </button>
          {extras}
        </div>
      )}

      {phase === 'over' && (
        <div className="t-overlay">
          <h2 className="t-heading">{verdict}</h2>
          <dl className="t-stats">
            <dt>SCORE</dt>
            <dd>{result.score}</dd>
            <dt>LINES</dt>
            <dd>{result.lines}</dd>
            {peer && peer.st !== 'lobby' && (
              <>
                <dt style={{ color: THEM }}>{peer.name}</dt>
                <dd>{peer.st === 'over' ? peer.score : 'PLAYING'}</dd>
              </>
            )}
            <dt>BEST</dt>
            <dd>{best}</dd>
          </dl>
          {watchBtn}
          <button className={watchBtn ? 't-btn t-btn--ghost' : 't-btn'} onClick={enterLobby}>
            Lobby
          </button>
          {extras}
        </div>
      )}

      {phase === 'watching' && (
        <div className="t-watchbar">
          <span>
            WATCHING <b>{peer?.name}</b>
          </span>
          <button className="t-btn t-btn--ghost" onClick={enterLobby}>
            Lobby
          </button>
        </div>
      )}

      <div className="t-overlay t-rotate">
        <h2 className="t-heading">ROTATE YOUR PHONE</h2>
      </div>
    </div>
  );
}
