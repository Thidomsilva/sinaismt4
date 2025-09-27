'use client';

import { useState, useMemo } from 'react';
import type { Signal } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, ServerCrash, SearchX } from 'lucide-react';
import { DashboardHeader } from './dashboard-header';
import { SnapshotCard } from './snapshot-card';
import { useSignals } from '@/hooks/useSignals';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [symbolFilter, setSymbolFilter] = useState('all');
  const [tfFilter, setTfFilter] = useState('all');
  const { loading, error, rows } = useSignals('mock', refreshInterval);

  const uniqueSymbols = useMemo(
    () => ['all', ...Array.from(new Set(rows.map((s) => s.symbol)))].sort(),
    [rows]
  );
  const uniqueTfs = useMemo(
    () =>
      ['all', ...Array.from(new Set(rows.map((s) => s.tf)))].sort((a, b) => {
        const aVal = (a.match(/(\d+)/)?.[0] ?? '0') + (a.match(/[A-Z]/)?.[0] ?? '');
        const bVal = (b.match(/(\d+)/)?.[0] ?? '0') + (b.match(/[A-Z]/)?.[0] ?? '');
        return aVal.localeCompare(bVal, undefined, { numeric: true });
      }),
    [rows]
  );

  const filteredSnapshots = useMemo(() => {
    return rows
      .filter(
        (s) =>
          (symbolFilter === 'all' || s.symbol === symbolFilter) &&
          (tfFilter === 'all' || s.tf === tfFilter)
      )
      .sort((a, b) => b.assertiveness - a.assertiveness);
  }, [rows, symbolFilter, tfFilter]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Card className="flex w-full max-w-md flex-col items-center justify-center gap-4 p-8">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Aguardando Sinais...</h2>
            <p className="text-muted-foreground">
              Conectando e esperando os primeiros snapshots do MT4.
            </p>
          </Card>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Card className="flex w-full max-w-md flex-col items-center justify-center gap-4 p-8 text-destructive">
            <ServerCrash className="h-12 w-12" />
            <h2 className="text-xl font-semibold">Falha na Conexão</h2>
            <p>{error}</p>
          </Card>
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Card className="flex w-full max-w-md flex-col items-center justify-center gap-4 p-8">
            <SearchX className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Nenhum Sinal Ativo</h2>
            <p className="text-muted-foreground">
              Não há sinais sendo transmitidos no momento.
            </p>
          </Card>
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
          {filteredSnapshots.map((signal) => (
            <SnapshotCard key={signal.id} signal={signal} />
          ))}
        </motion.div>
      </AnimatePresence>
    );
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
      <div className="flex-1 pt-4">{renderContent()}</div>
    </>
  );
}
