'use client';
import { useEffect, useState } from 'react';
import type { Signal } from '@/lib/types';
import { startMockStream } from '@/data/mock';
// import { onSnapshot, query, collection, orderBy, limit } from "firebase/firestore";
// import { db } from "./firebase";

export function useSignals(
  source: 'mock' | 'firestore' = 'mock',
  refreshInterval: number
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [rows, setRows] = useState<Signal[]>([]);

  useEffect(() => {
    let isMounted = true;
    setError(undefined);

    if (source === 'mock') {
      const stop = startMockStream((data) => {
        if (isMounted) {
          setRows(data);
          if (loading) {
            setLoading(false);
          }
        }
      }, refreshInterval);

      return () => {
        isMounted = false;
        stop();
      };
    }

    // Firestore (ativar quando o back estiver pronto)
    // setLoading(true);
    // const q = query(
    //   collection(db, "signals_live"),
    //   orderBy("receivedAt", "desc"),
    //   limit(100)
    // );
    // const unsub = onSnapshot(q, (snap)=>{
    //   if(isMounted) {
    //     const data: Signal[] = [];
    //     snap.forEach(d => data.push({ id:d.id, ...(d.data() as any) }));
    //     setRows(data);
    //     setLoading(false);
    //   }
    // }, (e)=>{
    //   if(isMounted) {
    //     setError(e.message);
    //     setLoading(false);
    //   }
    // });
    // return () => {
    //   isMounted = false;
    //   unsub();
    // };
  }, [source, refreshInterval]);

  return { loading, error, rows };
}
