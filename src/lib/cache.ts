import type { Snapshot, SnapshotData, SnapshotCache, PublicSnapshot } from './types';

const TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

let cache: SnapshotCache = new Map();

function cleanExpiredSnapshots() {
  const now = Date.now();
  for (const [key, snapshot] of cache.entries()) {
    if (now - snapshot.receivedAt > TTL) {
      cache.delete(key);
    }
  }
}

export function addSnapshot(snapshot: Snapshot) {
  const key = `${snapshot.symbol}:${snapshot.tf}`;
  const data: SnapshotData = {
    ...snapshot,
    receivedAt: Date.now(),
  };
  cache.set(key, data);
}

export function getSnapshots(): { updatedAt: string; items: PublicSnapshot[] } {
  cleanExpiredSnapshots();
  const now = Date.now();

  const items: PublicSnapshot[] = Array.from(cache.values()).map(
    (snapshot) => {
      const { notes, spread, serverTime, ...rest } = snapshot;
      return {
        ...rest,
        ageSec: Math.floor((now - snapshot.receivedAt) / 1000),
      };
    }
  );

  return {
    updatedAt: new Date().toISOString(),
    items: items.sort((a,b) => a.symbol.localeCompare(b.symbol) || a.tf.localeCompare(b.tf)),
  };
}

export function getCacheSize(): number {
  cleanExpiredSnapshots();
  return cache.size;
}
