'use client';

import type { PublicSnapshot } from '@/lib/types';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  Clock,
  CandlestickChart,
  CalendarClock,
} from 'lucide-react';
import { WinrateGauge } from './winrate-gauge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SnapshotCardProps {
  snapshot: PublicSnapshot;
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

const SignalBadge = ({
  signal,
}: {
  signal: PublicSnapshot['lastSignal'];
}) => {
  switch (signal) {
    case 'BUY':
      return (
        <Badge
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
        >
          <ArrowUpCircle className="h-4 w-4" /> COMPRA
        </Badge>
      );
    case 'SELL':
      return (
        <Badge variant="destructive" className="gap-1.5">
          <ArrowDownCircle className="h-4 w-4" /> VENDA
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1.5">
          <MinusCircle className="h-4 w-4" /> NENHUM
        </Badge>
      );
  }
};

const tfToSec = (tf: string): number => {
  const map: { [key: string]: number } = {
    M1: 60,
    M5: 300,
    M15: 900,
    M30: 1800,
    H1: 3600,
    H4: 14400,
    D1: 86400,
  };
  return map[tf] ?? 60;
};

const fmtHHmm = (dateLike: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = new Date(dateLike);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const computeEntryTime = (nowEpochSec: number, tf: string, onlyOnBarClose: boolean): Date => {
  const tfSec = tfToSec(tf);
  const openCur = Math.floor(nowEpochSec / tfSec) * tfSec;
  const openNext = openCur + tfSec;
  const entryTs = onlyOnBarClose ? openNext : openCur; // epoch (s)
  return new Date(entryTs * 1000);
};

export function SnapshotCard({ snapshot }: SnapshotCardProps) {
  const isStale = snapshot.ageSec > 60;
  
  const [entryTime, setEntryTime] = useState<string>('');

  useEffect(() => {
    const updateEntryTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const date = computeEntryTime(now, snapshot.tf, snapshot.onlyOnBarClose);
      setEntryTime(fmtHHmm(date));
    };

    updateEntryTime();
    
    // We want to update it every second to catch the candle change
    const interval = setInterval(updateEntryTime, 1000); 

    return () => clearInterval(interval);
  }, [snapshot.tf, snapshot.onlyOnBarClose]);

  const entryTypeLabel = snapshot.onlyOnBarClose ? 'PRÓXIMA VELA' : 'VELA ATUAL';

  return (
    <motion.div variants={cardVariants} whileHover={{ y: -5, scale: 1.02 }}>
      <Card className="flex h-full flex-col overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="font-headline text-2xl tracking-tighter">
            {snapshot.symbol}
          </CardTitle>
          <Badge variant="outline" className="font-mono text-sm font-semibold">
            {snapshot.tf}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 py-4">
          <WinrateGauge value={snapshot.winrate} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amostra</p>
            <p className="font-bold text-lg text-foreground">{snapshot.sample}</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 bg-secondary/30 p-4">
          <div className="flex justify-between gap-2">
            <SignalBadge signal={snapshot.lastSignal} />
            {snapshot.isMarketOpen ? (
              <Badge
                variant="outline"
                className="justify-center border-primary/70 bg-transparent text-primary hover:bg-transparent"
              >
                MERCADO ABERTO
              </Badge>
            ) : (
              <Badge variant="secondary" className="justify-center">
                MERCADO FECHADO
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className='flex items-center gap-1.5'>
              <CalendarClock className='h-4 w-4'/>
              <span>
                Entrada na <strong className='font-semibold text-foreground/90'>{entryTypeLabel}</strong> ({entryTime})
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <CandlestickChart className='h-4 w-4'/>
              <span>Expira em {snapshot.expiry} candles</span>
            </div>
          </div>
           <div className="flex justify-end gap-2 text-sm pt-1">
              <div
                className={cn(
                  'flex items-center gap-1.5 text-muted-foreground',
                  isStale && 'text-yellow-400 font-medium'
                )}
              >
                <Clock className="h-4 w-4" />
                <span>{snapshot.ageSec}s atrás</span>
              </div>
           </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
