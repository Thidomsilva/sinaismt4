'use client';

import type { Signal } from '@/lib/types';
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
  Timer,
  AlertCircle,
} from 'lucide-react';
import { WinrateGauge } from './winrate-gauge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { computeEntryLabels, TF_TO_MIN } from '@/lib/entry-text';

interface SnapshotCardProps {
  signal: Signal;
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
};

const SignalBadge = ({
  direction,
}: {
  direction: Signal['direction'];
}) => {
  switch (direction) {
    case 'BUY':
      return (
        <Badge
          variant="default"
          className="border-2 border-blue-500/80 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 gap-1.5"
        >
          <ArrowUpCircle className="h-4 w-4" /> COMPRA
        </Badge>
      );
    case 'SELL':
      return (
        <Badge
          variant="destructive"
          className="border-2 border-red-500/80 bg-red-500/20 text-red-300 hover:bg-red-500/30 gap-1.5"
        >
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

const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
};

export function SnapshotCard({ signal }: SnapshotCardProps) {
  const [timers, setTimers] = useState({
      ageSec: 0,
      candleTimeRemaining: 0,
      expiryTimeRemaining: 0,
  });
  const [entryLabels, setEntryLabels] = useState({
      entryLabel: '',
      entryHHMM: '',
      expiryCandlesText: '',
      expiryHHMM: '',
      entryTime: new Date(),
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const received = signal.receivedAt ?? signal.timestamp * 1000;
      const newAgeSec = Math.floor((now.getTime() - received) / 1000);

      const newEntryLabels = computeEntryLabels(signal, now);
      
      const tfMinutes = TF_TO_MIN[signal.tf] ?? 1;
      const tfSeconds = tfMinutes * 60;
      const candleStartTime = Math.floor(now.getTime() / 1000 / tfSeconds) * tfSeconds;
      const candleEndTime = candleStartTime + tfSeconds;
      const newCandleTimeRemaining = Math.floor(candleEndTime - now.getTime() / 1000);
      
      const expirySeconds = newEntryLabels.entryTime.getTime() / 1000 + (signal.expiryCandles * tfSeconds);
      const newExpiryTimeRemaining = Math.floor(expirySeconds - now.getTime() / 1000);

      setAgeSec(newAgeSec);
      setEntryLabels(newEntryLabels);
      setTimers({
          ageSec: newAgeSec,
          candleTimeRemaining: newCandleTimeRemaining,
          expiryTimeRemaining: newExpiryTimeRemaining,
      })
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [signal]);

  const isStale = timers.ageSec > 60;

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card
        className={cn(
          'flex h-full flex-col overflow-hidden border-2 bg-card/60 backdrop-blur-sm transition-all duration-300',
          signal.direction === 'BUY' && 'hover:border-blue-500/80 hover:shadow-2xl hover:shadow-blue-500/10',
          signal.direction === 'SELL' && 'hover:border-red-500/80 hover:shadow-2xl hover:shadow-red-500/10',
          signal.direction === 'NONE' && 'hover:border-border'
        )}
      >
        <CardHeader className="flex-row items-start justify-between pb-2">
          <CardTitle className="font-headline text-2xl tracking-tighter">
            {signal.symbol}
          </CardTitle>
          <Badge variant="outline" className="font-mono text-sm font-semibold">
            {signal.tf}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 py-4">
          <WinrateGauge value={signal.assertiveness} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amostra</p>
            <p className="font-bold text-lg text-foreground">{signal.sample}</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 bg-card/40 p-4">
          <div className="flex justify-between gap-2">
            <SignalBadge direction={signal.direction} />
            {signal.marketStatus === 'OPEN' ? (
              <Badge
                variant="outline"
                className="border-green-400/50 bg-green-500/10 text-green-300"
              >
                MERCADO ABERTO
              </Badge>
            ) : (
              <Badge variant="secondary">MERCADO FECHADO</Badge>
            )}
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              <span>
                Entrada: <strong className="font-semibold text-foreground/90">{entryLabels.entryLabel}</strong> ({entryLabels.entryHHMM})
              </span>
            </div>
            {signal.direction !== 'NONE' && (
               <div className="flex items-center gap-1.5">
                <Timer className="h-4 w-4" />
                <span>
                    {entryLabels.expiryCandlesText}
                    {' '}
                    <span className='text-muted-foreground/80'>({entryLabels.expiryHHMM})</span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
                <CandlestickChart className="h-4 w-4" />
                <span>
                    Vela atual fecha em:{' '}
                    <strong className="font-semibold text-foreground/90">
                        {formatTime(timers.candleTimeRemaining)}
                    </strong>
                </span>
            </div>
             {signal.direction !== 'NONE' && (
                <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                        Sinal expira em:{' '}
                        <strong className="font-semibold text-foreground/90">
                           {formatTime(timers.expiryTimeRemaining)}
                        </strong>
                    </span>
                </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border/20 pt-3 text-sm">
            <div
              className={cn(
                'flex items-center gap-1.5 text-muted-foreground',
                isStale && 'text-yellow-400/80 font-medium'
              )}
            >
              <Clock className="h-4 w-4" />
              <span>{timers.ageSec}s atrás</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
