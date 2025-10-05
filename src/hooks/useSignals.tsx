'use client';
import { useEffect, useState } from 'react';
import type { Signal, PublicSnapshot } from '@/lib/types';
import { startMockStream } from '@/data/mock';

// Transforma o PublicSnapshot (do cache) em Signal (do front-end)
function processSnapshots(items: PublicSnapshot[]): Signal[] {
  return items.map(item => ({
    id: `${item.symbol}-${item.tf}`,
    symbol: item.symbol,
    tf: item.tf,
    direction: item.lastSignal,
    assertiveness: item.winrate,
    sample: item.sample,
    expiryCandles: item.expiry,
    onlyOnBarClose: item.onlyOnBarClose,
    marketStatus: item.isMarketOpen ? 'OPEN' : 'CLOSED',
    timestamp: item.serverTime,
    receivedAt: Date.now() - (item.ageSec * 1000),
  }));
}


export function useSignals(
  source: 'mock' | 'api' = 'api',
  refreshInterval: number
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [rows, setRows] = useState<Signal[]>([]);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    setError(undefined);
    setLoading(true);

    const fetchData = async () => {
      try {
        const response = await fetch('/api/snapshots');
        if (!response.ok) {
          throw new Error(`A requisição falhou: ${response.statusText}`);
        }
        const data = await response.json();
        if (isMounted) {
          setRows(processSnapshots(data.items || []));
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (source === 'api') {
      fetchData(); // Busca inicial
      intervalId = setInterval(fetchData, refreshInterval);
    } else if (source === 'mock') {
      const stopMock = startMockStream((data) => {
        if (isMounted) {
          setRows(data);
          setLoading(false);
        }
      }, refreshInterval);

      return () => {
        isMounted = false;
        stopMock();
      };
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [source, refreshInterval]);

  return { loading, error, rows };
}
