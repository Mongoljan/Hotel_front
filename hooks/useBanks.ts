import { useEffect, useState } from 'react';

export interface Bank {
  id: number;
  name: string;
  short_code: string;
  logo: string | null;
  is_active: boolean;
}

let cache: Bank[] | null = null;

/**
 * Fetches the catalogue of banks from `/api/banks/`. Result is memoised in
 * module scope so subsequent mounts don't re-hit the network.
 */
export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/banks/', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          cache = data.filter((b: Bank) => b.is_active);
          if (!cancelled) setBanks(cache);
        }
      } catch (err) {
        console.error('Failed to load banks:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { banks, loading };
}
