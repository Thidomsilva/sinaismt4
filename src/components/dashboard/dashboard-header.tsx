import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
          Assertividade Ao Vivo
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitoramento em tempo real da performance dos sinais.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={symbolFilter} onValueChange={setSymbolFilter}>
            <SelectTrigger className="w-full min-w-[150px] md:w-auto">
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
            <SelectTrigger className="w-full min-w-[120px] md:w-auto">
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Atualizar a cada:
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
              <SelectItem value="4000">4s</SelectItem>
              <SelectItem value="8000">8s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
