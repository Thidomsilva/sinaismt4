import type { Signal } from './types';

const TF_TO_MIN: Record<string, number> = {
  M1: 1,
  M5: 5,
  M15: 15,
  M30: 30,
  H1: 60,
  H4: 240,
  D1: 1440,
  W1: 10080,
  MN: 43200,
};

export function formatHHMM(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Calcula rótulos “VELA ATUAL/PRÓXIMA” + horário da entrada e expiração. */
export function computeEntryLabels(sig: Signal) {
  const mins = TF_TO_MIN[sig.tf] ?? 1;
  const start = new Date(sig.timestamp * 1000); // início da vela do sinal (UTC)
  const now = new Date();

  // próxima abertura de vela:
  const nextOpen = new Date(start.getTime() + mins * 60 * 1000);

  // regra: se onlyOnBarClose = true ⇒ entrar na PRÓXIMA vela
  // senão, se ainda estamos dentro da vela atual ⇒ “VELA ATUAL”
  const enterOnNext = sig.onlyOnBarClose || now >= nextOpen;
  const entryTime = enterOnNext ? nextOpen : start;
  const entryLabel = enterOnNext ? 'PRÓXIMA VELA' : 'VELA ATUAL';

  // horário de expiração = entry + expiryCandles * TF
  const expiryTime = new Date(
    entryTime.getTime() + sig.expiryCandles * mins * 60 * 1000
  );

  return {
    entryLabel,
    entryHHMM: formatHHMM(entryTime),
    expiryCandlesText: `Expira em ${sig.expiryCandles} candles`,
    expiryHHMM: formatHHMM(expiryTime), // se quiser mostrar também
  };
}
