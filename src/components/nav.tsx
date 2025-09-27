'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Signals Live</span>
        </Link>
        <Link
          href="/"
          className={cn(
            'transition-colors hover:text-foreground',
            pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/config"
          className={cn(
            'transition-colors hover:text-foreground',
            pathname === '/config' ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Config
        </Link>
      </nav>
      {/* Mobile Nav can be added here if needed */}
    </header>
  );
}
