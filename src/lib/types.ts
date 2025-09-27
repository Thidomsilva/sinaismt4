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
