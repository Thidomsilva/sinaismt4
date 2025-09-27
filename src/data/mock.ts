import type { Signal } from '@/lib/types';
import { v4 as uuid } from 'uuid';

const symbols = ['EURUSD', 'GBPJPY', 'AUDCAD', 'XAUUSD', 'USDCHF', 'USDCAD'];
const tfs = ['M1', 'M5', 'M15', 'M30', 'H1'] as const;
const dirs = ['BUY', 'SELL', 'NONE'] as const;

export function startMockStream(
  onData: (rows: Signal[]) => void,
  intervalMs: number
) {
  const bag: Signal[] = [];
  let intervalId: NodeJS.Timeout;

  function pushOne() {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const tf = tfs[Math.floor(Math.random() * tfs.length)];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const assertiveness =
      dir === 'NONE'
        ? Math.floor(40 + Math.random() * 20)
        : Math.floor(70 + Math.random() * 25);
    
    const tfToMinMap: Record<string, number> = { M1: 1, M5: 5, M15: 15, M30: 30, H1: 60 };
    const minsPerTf = tfToMinMap[tf] || 1;
    
    const now = Date.now();
    // vela do sinal (início da vela atual):
    const ts = Math.floor(
      (Math.floor(now / 60000 / minsPerTf) * minsPerTf) * 60
    ); // epoch secs alinhado ao TF

    const sig: Signal = {
      id: `${symbol}-${tf}`, // Use a consistent ID for smoother animation
      symbol,
      tf,
      direction: dir,
      assertiveness,
      sample: Math.floor(50 + Math.random() * 200),
      expiryCandles: dir === 'NONE' ? 0 : 1 + Math.floor(Math.random() * 5),
      onlyOnBarClose: Math.random() > 0.5,
      marketStatus: 'OPEN',
      timestamp: ts,
      receivedAt: now,
    };

    // Update or add signal to the bag
    const existingIndex = bag.findIndex(s => s.id === sig.id);
    if (existingIndex !== -1) {
        bag[existingIndex] = sig;
    } else {
        bag.unshift(sig);
    }
    
    // Keep list relatively short
    if (bag.length > 20) {
      bag.splice(20);
    }

    onData([...bag]);
  }
  
  // Clear previous interval if it exists
  const setupInterval = (ms: number) => {
      if (intervalId) {
          clearInterval(intervalId);
      }
      pushOne(); // initial push
      intervalId = setInterval(pushOne, ms);
  }

  setupInterval(intervalMs);

  return () => clearInterval(intervalId);
}
