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
} from 'lucide-react';
import { WinrateGauge } from './winrate-gauge';
import { cn } from '@/lib/utils';

interface SnapshotCardProps {
  snapshot: PublicSnapshot;
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SignalBadge = ({
  signal,
}: {
  signal: PublicSnapshot['lastSignal'];
}) => {
  switch (signal) {
    case 'BUY':
      return (
        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
          <ArrowUpCircle className="mr-1 h-3 w-3" /> BUY
        </Badge>
      );
    case 'SELL':
      return (
        <Badge variant="destructive">
          <ArrowDownCircle className="mr-1 h-3 w-3" /> SELL
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <MinusCircle className="mr-1 h-3 w-3" /> NONE
        </Badge>
      );
  }
};

export function SnapshotCard({ snapshot }: SnapshotCardProps) {
  const isStale = snapshot.ageSec > 60;
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -5, scale: 1.02 }}>
      <Card className="flex h-full flex-col overflow-hidden shadow-lg transition-shadow hover:shadow-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl tracking-tighter">
            {snapshot.symbol}
            <span className="ml-2 font-mono text-xl text-muted-foreground">
              {snapshot.tf}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
          <WinrateGauge value={snapshot.winrate} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center text-sm">
            <span className="text-muted-foreground">Sample</span>
            <span className="font-semibold">{snapshot.sample}</span>
            <span className="text-muted-foreground">Expiry</span>
            <span className="font-semibold">{snapshot.expiry} candles</span>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2 bg-card/50 p-3">
          <SignalBadge signal={snapshot.lastSignal} />
          {snapshot.isMarketOpen ? (
            <Badge className="justify-center border-primary/50 bg-transparent text-primary hover:bg-primary/10">
              MARKET OPEN
            </Badge>
          ) : (
            <Badge variant="secondary" className="justify-center">
              MARKET CLOSED
            </Badge>
          )}
          <Badge
            variant={isStale ? 'destructive' : 'secondary'}
            className={cn(
              'col-span-2 flex items-center justify-center gap-1',
              isStale && 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/20'
            )}
          >
            <Clock className="h-3 w-3" />
            <span>Updated {snapshot.ageSec}s ago</span>
          </Badge>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
