'use client';

interface WinrateGaugeProps {
  value: number;
}

export function WinrateGauge({ value }: WinrateGaugeProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  const getColor = () => {
    if (safeValue < 50) return 'hsl(var(--destructive))';
    if (safeValue < 75) return 'hsl(48, 96%, 58%)';
    return 'hsl(var(--primary))';
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          strokeWidth="10"
          className="stroke-muted/10"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="transparent"
          stroke={color}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
          style={{ strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-headline text-4xl font-bold" style={{ color }}>
          {safeValue.toFixed(1)}
          <span className="text-2xl opacity-70">%</span>
        </span>
      </div>
    </div>
  );
}
