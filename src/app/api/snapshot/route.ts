import { addSnapshot } from '@/lib/cache';
import type { Snapshot } from '@/lib/types';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const snapshotSchema = z.object({
  symbol: z.string().min(1),
  tf: z.string().min(1),
  winrate: z.number().min(0).max(100),
  sample: z.number().min(1),
  lastSignal: z.enum(['BUY', 'SELL', 'NONE']),
  expiry: z.number(),
  serverTime: z.number(),
  isMarketOpen: z.boolean(),
  spread: z.number().optional(),
  notes: z.string().optional(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = snapshotSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse(JSON.stringify(parsed.error.flatten()), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    addSnapshot(parsed.data as Snapshot);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if(error instanceof Error) {
        errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify({ error: 'Failed to parse JSON body', details: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
