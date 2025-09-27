export interface Snapshot {
  symbol: string;
  tf: string;
  winrate: number;
  sample: number;
  lastSignal: 'BUY' | 'SELL' | 'NONE';
  expiry: number;
  serverTime: number;
  isMarketOpen: boolean;
  spread?: number;
  notes?: string;
  onlyOnBarClose: boolean;
}

export interface SnapshotData extends Snapshot {
  receivedAt: number;
}

export type SnapshotCache = Map<string, SnapshotData>;

export interface PublicSnapshot
  extends Omit<Snapshot, 'serverTime' | 'spread' | 'notes'> {
  ageSec: number;
  lastSignal: 'BUY' | 'SELL' | 'NONE';
}
