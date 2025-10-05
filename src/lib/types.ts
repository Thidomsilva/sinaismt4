export type Signal = {
  id: string;
  symbol: string; // "EURUSD"
  tf: string; // "M1" | "M5" | "M15" | ...
  direction: 'BUY' | 'SELL' | 'NONE';
  assertiveness: number; // 0..100
  sample: number;
  expiryCandles: number;
  onlyOnBarClose: boolean;
  marketStatus: 'OPEN' | 'CLOSED';
  timestamp: number; // epoch seconds (UTC) da vela do sinal
  receivedAt?: number; // epoch ms (front)
};


export type Snapshot = {
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
};

export type SnapshotData = Snapshot & {
  receivedAt: number;
};

export type SnapshotCache = Map<string, SnapshotData>;

export type PublicSnapshot = {
  symbol: string;
  tf: string;
  winrate: number;
  sample: number;
  lastSignal: 'BUY' | 'SELL' | 'NONE';
  expiry: number;
  isMarketOpen: boolean;
  onlyOnBarClose: boolean;
  receivedAt: number;
  ageSec: number;
  serverTime: number;
};
