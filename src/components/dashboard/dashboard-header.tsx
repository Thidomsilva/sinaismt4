import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card>
      <CardContent className="flex flex-col md:flex-row items-center gap-4 p-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight font-headline">
            Live Assertiveness
          </h1>
          <p className="text-muted-foreground">
            Real-time snapshot of signal performance.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Filter by:
          </span>
          <Select value={symbolFilter} onValueChange={setSymbolFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Pair" />
            </SelectTrigger>
            <SelectContent>
              {uniqueSymbols.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol === 'all' ? 'All Pairs' : symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tfFilter} onValueChange={setTfFilter}>
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {uniqueTfs.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf === 'all' ? 'All TFs' : tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Refresh:
          </span>
          <Select
            value={String(refreshInterval)}
            onValueChange={(val) => setRefreshInterval(Number(val))}
          >
            <SelectTrigger className="w-full md:w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2000">2s</SelectItem>
              <SelectItem value="5000">5s</SelectItem>
              <SelectItem value="10000">10s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
