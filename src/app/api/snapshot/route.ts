import { addSnapshot } from '@/lib/cache';
import type { Snapshot } from '@/lib/types';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// O esquema original - mantido para referência, mas não será usado temporariamente.
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
  onlyOnBarClose: z.boolean().default(true),
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

    // Log bruto do corpo da requisição para depuração
    console.log('Dados brutos recebidos do MT4:', JSON.stringify(body, null, 2));

    // Tenta fazer o parse para ter certeza de que é um snapshot válido,
    // mas não rejeita se falhar, apenas registra o erro.
    const parsed = snapshotSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Falha na validação do Zod (dados não serão salvos, mas a requisição foi recebida):', parsed.error.flatten());
      // Mesmo com erro, vamos retornar sucesso para não confundir o MT4,
      // mas não adicionamos ao cache. O log é o importante aqui.
      return new NextResponse(JSON.stringify({ success: true, message: 'Received, but validation failed. Check server logs.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Se a validação for bem-sucedida, adiciona ao cache.
    addSnapshot(parsed.data as Snapshot);
    console.log('Snapshot validado e adicionado ao cache:', parsed.data.symbol, parsed.data.tf);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if(error instanceof Error) {
        errorMessage = error.message;
    }
    // Loga o erro de parsing do JSON
    console.error('Erro CRÍTICO ao processar a requisição POST (provavelmente JSON malformado):', errorMessage);
    const requestText = await req.text().catch(() => 'Could not read request text');
    console.error('Corpo da requisição que causou o erro:', requestText);
    
    return new NextResponse(JSON.stringify({ error: 'Failed to process request', details: errorMessage }), {
      status: 400, // Retornar 400 para indicar que o cliente enviou algo errado
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
