'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';

export function Nav() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/config', label: 'Configurações' },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Sinais Ao Vivo</span>
        </Link>
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'transition-colors hover:text-foreground',
              pathname === href ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Activity className="h-6 w-6 text-primary" />
              <span className="sr-only">Sinais Ao Vivo</span>
            </Link>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'hover:text-foreground',
                  pathname === href ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
