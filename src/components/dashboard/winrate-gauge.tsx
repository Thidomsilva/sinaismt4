'use client';

interface WinrateGaugeProps {
  value: number;
}

export function WinrateGauge({ value }: WinrateGaugeProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  const getColor = () => {
    if (safeValue < 50) return 'hsl(var(--destructive))';
    if (safeValue < 75) return 'hsl(210, 40%, 80%)'; // A less alarming color, like a cool gray/blue
    return 'hsl(var(--primary))';
  };

  const color = getColor();

  return (
    <div
      className="relative flex h-36 w-36 items-center justify-center rounded-full transition-all duration-300"
      style={{
        background: `conic-gradient(${color} ${
          safeValue * 3.6
        }deg, hsla(var(--muted), 0.3) 0deg)`,
      }}
    >
      <div className="absolute flex h-[85%] w-[85%] items-center justify-center rounded-full bg-card">
        <span className="font-headline text-4xl font-bold" style={{ color }}>
          {safeValue.toFixed(1)}
          <span className="text-2xl opacity-70">%</span>
        </span>
      </div>
    </div>
  );
}
