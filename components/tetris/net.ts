/* ============================================================
   TETRIS NET — one fixed two-player lobby over WebRTC (PeerJS)
   First device in claims the lobby id and hosts. The second
   finds the id taken and connects to it. A third is turned away.
   ============================================================ */

import type { DataConnection, Peer } from 'peerjs';

const LOBBY_ID = 'tommyk-uk-t-lobby-1';
const PEER_TIMEOUT = 7000;
const JOIN_TIMEOUT = 6000;

export type NetStatus = 'connecting' | 'waiting' | 'connected' | 'full' | 'offline';
export type PlayerStatus = 'lobby' | 'playing' | 'over';

export interface StateMsg {
  t: 'state';
  name: string;
  st: PlayerStatus;
  score: number;
  lines: number;
  level: number;
  board?: string; // 200 chars, visible rows, '.' = empty
  hold?: string;
  next?: string;
}
export type Msg = StateMsg | { t: 'start' } | { t: 'full' };

interface Handlers {
  onStatus(s: NetStatus): void;
  onMessage(m: Msg): void;
}

export class Net {
  status: NetStatus = 'connecting';
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastSeen = 0;
  private dead = false;

  constructor(private h: Handlers) {
    void this.host();
  }

  send(m: Msg) {
    if (this.conn?.open) this.conn.send(m);
  }

  /** Call regularly: drops a peer that has gone silent (locked phone, lost Wi-Fi) */
  check() {
    const c = this.conn;
    if (c && Date.now() - this.lastSeen > PEER_TIMEOUT) {
      c.close();
      this.lost(c, false);
    }
  }

  destroy() {
    this.dead = true;
    if (this.timer) clearTimeout(this.timer);
    this.peer?.destroy();
  }

  private set(s: NetStatus) {
    if (this.dead || this.status === s) return;
    this.status = s;
    this.h.onStatus(s);
  }

  private later(ms: number, fn: () => void) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => !this.dead && fn(), ms);
  }

  private async open(id?: string) {
    const { Peer: PeerCtor } = await import('peerjs');
    if (this.dead) return null;
    this.peer?.destroy();
    this.peer = id ? new PeerCtor(id) : new PeerCtor();
    return this.peer;
  }

  private async host() {
    this.set('connecting');
    const peer = await this.open(LOBBY_ID);
    if (!peer) return;

    peer.on('open', () => !this.conn && this.set('waiting'));
    peer.on('connection', (c) => {
      if (this.conn) {
        c.on('open', () => {
          c.send({ t: 'full' });
          setTimeout(() => c.close(), 300);
        });
        return;
      }
      this.adopt(c, true);
    });
    peer.on('disconnected', () => !this.dead && !peer.destroyed && peer.reconnect());
    peer.on('error', (e) => {
      if (this.peer !== peer || this.conn) return;
      if (e.type === 'unavailable-id') void this.join();
      else {
        this.set('offline');
        this.later(3000, () => void this.host());
      }
    });
  }

  private async join() {
    const peer = await this.open();
    if (!peer) return;

    peer.on('open', () => {
      this.adopt(peer.connect(LOBBY_ID, { reliable: true, serialization: 'json' }), false);
      // The lobby id can be held by a host that has silently gone away
      this.later(JOIN_TIMEOUT, () => !this.conn && void this.host());
    });
    peer.on('error', (e) => {
      if (this.peer !== peer || this.conn) return;
      const gone = e.type === 'peer-unavailable';
      if (!gone) this.set('offline');
      this.later(gone ? 800 : 3000, () => void this.host());
    });
  }

  private adopt(c: DataConnection, isHost: boolean) {
    c.on('open', () => {
      if (this.timer) clearTimeout(this.timer);
      this.conn = c;
      this.lastSeen = Date.now();
      this.set('connected');
    });
    c.on('data', (d) => {
      const m = d as Msg;
      if (!m || typeof m !== 'object') return;
      this.lastSeen = Date.now();
      if (m.t === 'full') {
        this.conn = null;
        this.set('full');
        this.later(5000, () => void this.host());
        return;
      }
      this.h.onMessage(m);
    });
    c.on('close', () => this.lost(c, isHost));
    c.on('error', () => this.lost(c, isHost));
  }

  private lost(c: DataConnection, isHost: boolean) {
    if (this.conn !== c) return;
    this.conn = null;
    if (isHost && this.peer && !this.peer.destroyed) this.set('waiting');
    else void this.host();
  }
}
