/* ============================================================
   TETRIS ENGINE — pure rules, no drawing, no input
   Guideline: 7-bag, SRS kicks, hold, lock delay, T-spins, B2B, combo
   ============================================================ */

export const COLS = 10;
export const ROWS = 24; // 4 hidden rows above 20 visible
export const HIDDEN = 4;
export const CLEAR_MS = 260;

const LOCK_DELAY = 500;
const MAX_LOCK_RESETS = 15;

export type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type Cell = PieceType | null;
export type Spin = 'none' | 'mini' | 'full';

export type GameEvent =
  | { type: 'move' }
  | { type: 'rotate' }
  | { type: 'hold' }
  | { type: 'lock' }
  | { type: 'hard'; piece: PieceType; cells: [number, number][]; fromY: number; toY: number }
  | { type: 'clear'; lines: number; spin: Spin; b2b: boolean; combo: number }
  | { type: 'spin'; spin: Spin }
  | { type: 'level'; level: number }
  | { type: 'over' };

export interface Piece {
  type: PieceType;
  rot: number;
  x: number;
  y: number;
}

const BASE: Record<PieceType, number[][]> = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
};

const rotateCW = (m: number[][]) => m[0].map((_, x) => m.map((row) => row[x]).reverse());

const toCells = (m: number[][]) => {
  const out: [number, number][] = [];
  m.forEach((row, y) => row.forEach((v, x) => v && out.push([x, y])));
  return out;
};

/** SHAPES[type][rot] = occupied [x, y] offsets inside the piece's box */
export const SHAPES = Object.fromEntries(
  (Object.keys(BASE) as PieceType[]).map((t) => {
    const states: [number, number][][] = [];
    let m = BASE[t];
    for (let i = 0; i < 4; i++) {
      states.push(toCells(m));
      m = rotateCW(m);
    }
    return [t, states];
  }),
) as Record<PieceType, [number, number][][]>;

/* SRS wall kicks, keyed "from>to". y is positive downwards here. */
const KICKS_JLSTZ: Record<string, [number, number][]> = {
  '0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1>0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3>2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

const KICKS_I: Record<string, [number, number][]> = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

const LINE_SCORE = [0, 100, 300, 500, 800];
const SPIN_SCORE = [400, 800, 1200, 1600];
const MINI_SCORE = [100, 200, 400];

export class Game {
  board: Cell[][] = Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
  cur: Piece | null = null;
  hold: PieceType | null = null;
  canHold = true;
  queue: PieceType[] = [];
  score = 0;
  level = 1;
  lines = 0;
  combo = -1;
  b2b = false;
  over = false;
  clearing: { rows: number[]; t: number } | null = null;
  events: GameEvent[] = [];

  private gravityAcc = 0;
  private lockTimer = 0;
  private lockResets = 0;
  private lowestY = 0;
  private lastWasRotate = false;
  private lastKick = 0;

  constructor() {
    this.spawn();
  }

  /* ── Queries ─────────────────────────────────────────── */

  collides(type: PieceType, rot: number, x: number, y: number) {
    return SHAPES[type][rot].some(([cx, cy]) => {
      const bx = x + cx;
      const by = y + cy;
      return bx < 0 || bx >= COLS || by >= ROWS || (by >= 0 && this.board[by][bx] !== null);
    });
  }

  ghostY() {
    const p = this.cur;
    if (!p) return 0;
    let y = p.y;
    while (!this.collides(p.type, p.rot, p.x, y + 1)) y++;
    return y;
  }

  private grounded() {
    const p = this.cur;
    return !!p && this.collides(p.type, p.rot, p.x, p.y + 1);
  }

  private gravityMs() {
    const l = Math.min(this.level, 20);
    return Math.pow(0.8 - (l - 1) * 0.007, l - 1) * 1000;
  }

  /* ── Piece supply ────────────────────────────────────── */

  private refill() {
    while (this.queue.length < 7) {
      const bag: PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      this.queue.push(...bag);
    }
  }

  private spawn(type?: PieceType) {
    this.refill();
    const t = type ?? this.queue.shift()!;
    this.refill();
    const p: Piece = { type: t, rot: 0, x: t === 'O' ? 4 : 3, y: HIDDEN - 2 };
    this.gravityAcc = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.lastWasRotate = false;
    if (this.collides(p.type, p.rot, p.x, p.y)) {
      this.cur = null;
      this.over = true;
      this.events.push({ type: 'over' });
      return;
    }
    // Guideline: drop one row immediately so the piece is visible
    if (!this.collides(p.type, p.rot, p.x, p.y + 1)) p.y++;
    this.lowestY = p.y;
    this.cur = p;
  }

  /* ── Player actions ──────────────────────────────────── */

  private afterShift() {
    const p = this.cur!;
    if (p.y > this.lowestY) {
      this.lowestY = p.y;
      this.lockResets = 0;
    }
    if (this.lockResets < MAX_LOCK_RESETS) {
      this.lockTimer = 0;
      this.lockResets++;
    }
  }

  move(dx: number) {
    const p = this.cur;
    if (!p || this.clearing || this.over) return false;
    if (this.collides(p.type, p.rot, p.x + dx, p.y)) return false;
    p.x += dx;
    this.lastWasRotate = false;
    this.afterShift();
    this.events.push({ type: 'move' });
    return true;
  }

  rotate(dir: 1 | -1) {
    const p = this.cur;
    if (!p || this.clearing || this.over || p.type === 'O') return false;
    const to = (p.rot + dir + 4) % 4;
    const kicks = (p.type === 'I' ? KICKS_I : KICKS_JLSTZ)[`${p.rot}>${to}`];
    for (let i = 0; i < kicks.length; i++) {
      const [kx, ky] = kicks[i];
      if (!this.collides(p.type, to, p.x + kx, p.y + ky)) {
        p.rot = to;
        p.x += kx;
        p.y += ky;
        this.lastWasRotate = true;
        this.lastKick = i;
        this.afterShift();
        this.events.push({ type: 'rotate' });
        return true;
      }
    }
    return false;
  }

  softDrop() {
    const p = this.cur;
    if (!p || this.clearing || this.over) return false;
    if (this.collides(p.type, p.rot, p.x, p.y + 1)) return false;
    p.y++;
    this.score += 1;
    this.gravityAcc = 0;
    this.lastWasRotate = false;
    this.afterShift();
    return true;
  }

  hardDrop() {
    const p = this.cur;
    if (!p || this.clearing || this.over) return;
    const toY = this.ghostY();
    const dist = toY - p.y;
    if (dist > 0) this.lastWasRotate = false;
    this.events.push({ type: 'hard', piece: p.type, cells: SHAPES[p.type][p.rot].map(([x, y]) => [p.x + x, y]), fromY: p.y, toY });
    this.score += dist * 2;
    p.y = toY;
    this.lock(true);
  }

  holdPiece() {
    const p = this.cur;
    if (!p || !this.canHold || this.clearing || this.over) return false;
    const swap = this.hold;
    this.hold = p.type;
    this.spawn(swap ?? undefined);
    this.canHold = false;
    this.events.push({ type: 'hold' });
    return true;
  }

  /* ── Time ────────────────────────────────────────────── */

  tick(dt: number) {
    if (this.over) return;

    if (this.clearing) {
      this.clearing.t += dt;
      if (this.clearing.t >= CLEAR_MS) {
        const rows = this.clearing.rows;
        this.board = this.board.filter((_, y) => !rows.includes(y));
        while (this.board.length < ROWS) this.board.unshift(Array<Cell>(COLS).fill(null));
        this.clearing = null;
        this.spawn();
      }
      return;
    }

    const p = this.cur;
    if (!p) return;

    if (this.grounded()) {
      this.gravityAcc = 0;
      this.lockTimer += dt;
      if (this.lockTimer >= LOCK_DELAY) this.lock(false);
      return;
    }

    this.lockTimer = 0;
    this.gravityAcc += dt;
    const g = this.gravityMs();
    while (this.gravityAcc >= g && !this.collides(p.type, p.rot, p.x, p.y + 1)) {
      p.y++;
      this.gravityAcc -= g;
      this.lastWasRotate = false;
      if (p.y > this.lowestY) {
        this.lowestY = p.y;
        this.lockResets = 0;
      }
    }
  }

  /* ── Locking and scoring ─────────────────────────────── */

  private detectSpin(p: Piece): Spin {
    if (p.type !== 'T' || !this.lastWasRotate) return 'none';
    const filled = (x: number, y: number) =>
      x < 0 || x >= COLS || y >= ROWS || (y >= 0 && this.board[y][x] !== null);
    // corners in order: top-left, top-right, bottom-right, bottom-left
    const c = [filled(p.x, p.y), filled(p.x + 2, p.y), filled(p.x + 2, p.y + 2), filled(p.x, p.y + 2)];
    if (c.filter(Boolean).length < 3) return 'none';
    const front = c[p.rot] && c[(p.rot + 1) % 4];
    return front || this.lastKick === 4 ? 'full' : 'mini';
  }

  private lock(hard: boolean) {
    const p = this.cur!;
    const spin = this.detectSpin(p);
    const cells = SHAPES[p.type][p.rot].map(([x, y]) => [p.x + x, p.y + y]);
    cells.forEach(([x, y]) => {
      if (y >= 0) this.board[y][x] = p.type;
    });
    this.cur = null;
    this.canHold = true;
    if (!hard) this.events.push({ type: 'lock' });

    // Lock out: the whole piece sits above the visible field
    if (cells.every(([, y]) => y < HIDDEN)) {
      this.over = true;
      this.events.push({ type: 'over' });
      return;
    }

    const rows: number[] = [];
    this.board.forEach((row, y) => row.every((c) => c !== null) && rows.push(y));
    const n = rows.length;

    let pts = spin === 'full' ? SPIN_SCORE[n] : spin === 'mini' ? MINI_SCORE[n] ?? 0 : LINE_SCORE[n];
    const difficult = n === 4 || (spin !== 'none' && n > 0);
    const b2b = difficult && this.b2b;
    if (b2b) pts *= 1.5;

    if (n > 0) {
      this.combo++;
      pts += 50 * this.combo;
      this.b2b = difficult;
    } else {
      this.combo = -1;
    }
    this.score += Math.floor(pts * this.level);

    if (n === 0) {
      if (spin !== 'none') this.events.push({ type: 'spin', spin });
      this.spawn();
      return;
    }

    this.events.push({ type: 'clear', lines: n, spin, b2b, combo: this.combo });
    this.lines += n;
    const level = Math.floor(this.lines / 10) + 1;
    if (level > this.level) {
      this.level = level;
      this.events.push({ type: 'level', level });
    }
    this.clearing = { rows, t: 0 };
  }
}
