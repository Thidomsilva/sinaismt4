'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

interface DashboardHeaderProps {
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  symbolFilter: string;
  setSymbolFilter: (symbol: string) => void;
  tfFilter: string;
  setTfFilter: (tf: string) => void;
  uniqueSymbols: string[];
  uniqueTfs: string[];
}

function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setTime(new Date());
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="font-mono text-lg font-semibold text-foreground/80 w-24 text-center">
      {time ? time.toLocaleTimeString('pt-BR') : '00:00:00'}
    </div>
  );
}

export function DashboardHeader({
  refreshInterval,
  setRefreshInterval,
  symbolFilter,
  setSymbolFilter,
  tfFilter,
  setTfFilter,
  uniqueSymbols,
  uniqueTfs,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
       <div className="flex items-center justify-between md:justify-end gap-4">
        <Clock />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Atualizar:
          </span>
          <Select
            value={String(refreshInterval)}
            onValueChange={(val) => setRefreshInterval(Number(val))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2000">2s</SelectItem>
              <SelectItem value="5000">5s</SelectItem>
              <SelectItem value="10000">10s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select value={symbolFilter} onValueChange={setSymbolFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Par" />
          </SelectTrigger>
          <SelectContent>
            {uniqueSymbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol === 'all' ? 'Todos os Pares' : symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tfFilter} onValueChange={setTfFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            {uniqueTfs.map((tf) => (
              <SelectItem key={tf} value={tf}>
                {tf === 'all' ? 'Todos os TFs' : tf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
