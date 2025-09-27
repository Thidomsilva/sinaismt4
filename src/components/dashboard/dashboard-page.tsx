'use client';

import { useState, useEffect, useMemo } from 'react';
import type { PublicSnapshot } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, ServerCrash } from 'lucide-react';
import { DashboardHeader } from './dashboard-header';
import { SnapshotCard } from './snapshot-card';
import { useToast } from '@/hooks/use-toast';

type ApiState = 'loading' | 'success' | 'error';

export default function DashboardPage() {
  const [snapshots, setSnapshots] = useState<PublicSnapshot[]>([]);
  const [apiState, setApiState] = useState<ApiState>('loading');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [tfFilter, setTfFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/snapshots');
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        setSnapshots(data.items);
        if (apiState !== 'success') setApiState('success');
      } catch (error) {
        console.error('Failed to fetch snapshots:', error);
        setApiState('error');
        toast({
          variant: 'destructive',
          title: 'Connection Error',
          description: 'Could not fetch data from the server.',
        });
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, toast, apiState]);

  const uniqueSymbols = useMemo(
    () => ['all', ...Array.from(new Set(snapshots.map((s) => s.symbol)))],
    [snapshots]
  );
  const uniqueTfs = useMemo(
    () => ['all', ...Array.from(new Set(snapshots.map((s) => s.tf)))],
    [snapshots]
  );

  const filteredSnapshots = useMemo(() => {
    return snapshots.filter(
      (s) =>
        (symbolFilter === 'all' || s.symbol === symbolFilter) &&
        (tfFilter === 'all' || s.tf === tfFilter)
    );
  }, [snapshots, symbolFilter, tfFilter]);
  
  const renderContent = () => {
    switch (apiState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground h-64">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Aguardando snapshots do MT4...</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center text-destructive h-64">
            <ServerCrash className="h-12 w-12" />
            <h2 className="text-xl font-semibold">API Connection Failed</h2>
            <p>Could not retrieve data. Please check the server status.</p>
          </div>
        );
      case 'success':
        if (snapshots.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground h-64">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg">Aguardando snapshots do MT4...</p>
                <p className="text-sm">No data received yet. Ensure your MT4 indicator is running.</p>
              </div>
            );
        }
        return (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
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
      {renderContent()}
    </>
  );
}
