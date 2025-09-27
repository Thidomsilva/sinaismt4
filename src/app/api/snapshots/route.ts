import { getSnapshots } from '@/lib/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = getSnapshots();
  return NextResponse.json(data);
}
