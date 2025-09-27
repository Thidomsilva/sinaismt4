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
} from 'lucide-react';
import { WinrateGauge } from './winrate-gauge';
import { cn } from '@/lib/utils';

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
        <Badge className="bg-green-500 text-white hover:bg-green-500/90 gap-1.5">
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

export function SnapshotCard({ snapshot }: SnapshotCardProps) {
  const isStale = snapshot.ageSec > 60;
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -5, scale: 1.02 }}>
      <Card className="flex h-full flex-col overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="font-headline text-2xl tracking-tighter">
            {snapshot.symbol}
          </CardTitle>
          <Badge variant="outline" className="font-mono text-sm">
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
        <CardFooter className="flex-col items-stretch gap-2 bg-secondary/30 p-3">
          <div className="flex justify-between gap-2">
            <SignalBadge signal={snapshot.lastSignal} />
            {snapshot.isMarketOpen ? (
              <Badge className="justify-center border-primary/50 bg-transparent text-primary hover:bg-primary/10">
                MERCADO ABERTO
              </Badge>
            ) : (
              <Badge variant="secondary" className="justify-center">
                MERCADO FECHADO
              </Badge>
            )}
          </div>
           <div className="flex justify-between gap-2 text-sm pt-1">
             <div className='flex items-center gap-1.5 text-muted-foreground'>
                <CandlestickChart className='h-4 w-4'/>
                <span>Expira em {snapshot.expiry} candles</span>
             </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-muted-foreground',
                  isStale && 'text-yellow-400'
                )}
              >
                <Clock className="h-3 w-3" />
                <span>{snapshot.ageSec}s atrás</span>
              </div>
           </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
