'use client';

import { useState, useEffect, useMemo } from 'react';
import type { PublicSnapshot } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, ServerCrash } from 'lucide-react';
import { DashboardHeader } from './dashboard-header';
import { SnapshotCard } from './snapshot-card';
import { useToast } from '@/hooks/use-toast';

type ApiState = 'loading' | 'success' | 'error';

// Mock data for simulation
const mockSnapshots: PublicSnapshot[] = [
  {
    symbol: 'EURUSD',
    tf: 'M5',
    winrate: 82.5,
    sample: 210,
    lastSignal: 'BUY',
    expiry: 3,
    isMarketOpen: true,
    onlyOnBarClose: true,
    ageSec: 15,
  },
  {
    symbol: 'GBPJPY',
    tf: 'H1',
    winrate: 75.0,
    sample: 150,
    lastSignal: 'SELL',
    expiry: 5,
    isMarketOpen: true,
    onlyOnBarClose: false,
    ageSec: 120,
  },
  {
    symbol: 'USDJPY',
    tf: 'M15',
    winrate: 68.2,
    sample: 320,
    lastSignal: 'BUY',
    expiry: 2,
    isMarketOpen: true,
    onlyOnBarClose: true,
    ageSec: 45,
  },
  {
    symbol: 'AUDCAD',
    tf: 'M1',
    winrate: 91.0,
    sample: 95,
    lastSignal: 'SELL',
    expiry: 5,
    isMarketOpen: true,
    onlyOnBarClose: false,
    ageSec: 5,
  },
    {
    symbol: 'XAUUSD',
    tf: 'M30',
    winrate: 55.5,
    sample: 180,
    lastSignal: 'NONE',
    expiry: 4,
    isMarketOpen: true,
    onlyOnBarClose: true,
    ageSec: 300,
  },
    {
    symbol: 'USDCAD',
    tf: 'H4',
    winrate: 45.0,
    sample: 112,
    lastSignal: 'SELL',
    expiry: 3,
    isMarketOpen: false,
    onlyOnBarClose: true,
    ageSec: 550,
  },
];


export default function DashboardPage() {
  const [snapshots, setSnapshots] = useState<PublicSnapshot[]>([]);
  const [apiState, setApiState] = useState<ApiState>('loading');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [tfFilter, setTfFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const useMockData = true; // Set to true to use mock data

    const fetchData = async () => {
      if (useMockData) {
        // Increment ageSec for simulation effect
        setSnapshots(prev => prev.map(s => ({...s, ageSec: s.ageSec + (refreshInterval / 1000)})));
        if (apiState !== 'success') setApiState('success');
        return;
      }
      try {
        const response = await fetch('/api/snapshots');
        if (!response.ok) {
          throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        setSnapshots(data.items);
        if (apiState !== 'success') setApiState('success');
      } catch (error) {
        console.error('Falha ao buscar snapshots:', error);
        setApiState('error');
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description: 'Não foi possível buscar os dados do servidor.',
        });
      }
    };
    
    if (useMockData && snapshots.length === 0) {
        setSnapshots(mockSnapshots);
    }

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, toast, apiState, snapshots.length]);

  const uniqueSymbols = useMemo(
    () => ['all', ...Array.from(new Set(snapshots.map((s) => s.symbol)))],
    [snapshots]
  );
  const uniqueTfs = useMemo(
    () => ['all', ...Array.from(new Set(snapshots.map((s) => s.tf)))],
    [snapshots]
  );

  const filteredSnapshots = useMemo(() => {
    return snapshots
      .filter(
        (s) =>
          (symbolFilter === 'all' || s.symbol === symbolFilter) &&
          (tfFilter === 'all' || s.tf === tfFilter)
      )
      .sort((a, b) => b.winrate - a.winrate);
  }, [snapshots, symbolFilter, tfFilter]);
  
  const renderContent = () => {
    switch (apiState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center text-muted-foreground">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Aguardando snapshots do MT4...</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center text-destructive">
            <ServerCrash className="h-12 w-12" />
            <h2 className="text-xl font-semibold">Falha na Conexão com a API</h2>
            <p>Não foi possível obter os dados. Por favor, verifique o status do servidor.</p>
          </div>
        );
      case 'success':
        if (snapshots.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center text-muted-foreground">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg">Aguardando snapshots do MT4...</p>
                <p className="text-sm">Nenhum dado recebido ainda. Certifique-se de que seu indicador MT4 está em execução.</p>
              </div>
            );
        }
        return (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredSnapshots.map((snapshot) => (
                <SnapshotCard
                  key={`${snapshot.symbol}-${snapshot.tf}`}
                  snapshot={snapshot}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        );
    }
  };


  return (
    <>
      <DashboardHeader
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        symbolFilter={symbolFilter}
        setSymbolFilter={setSymbolFilter}
        tfFilter={tfFilter}
        setTfFilter={setTfFilter}
        uniqueSymbols={uniqueSymbols}
        uniqueTfs={uniqueTfs}
      />
      <div className="flex-1 mt-6">{renderContent()}</div>
    </>
  );
}
