export interface EbarimtLookupResult {
  found: boolean;
  name?: string;
}

type LookupOptions = {
  signal?: AbortSignal;
};

function getLookupUrl(regno: string): string {
  const trimmed = regno.trim();
  // Optional Mongolia-hosted proxy (set on Vercel when available)
  const externalProxy = process.env.NEXT_PUBLIC_EBARIMT_PROXY_URL?.trim();
  if (externalProxy) {
    const base = externalProxy.replace(/\/$/, '');
    return `${base}?regno=${encodeURIComponent(trimmed)}`;
  }
  return `/api/ebarimt?regno=${encodeURIComponent(trimmed)}`;
}

export async function lookupEbarimt(
  regno: string,
  options?: LookupOptions
): Promise<EbarimtLookupResult> {
  const trimmed = regno.trim();
  if (!trimmed) return { found: false };

  try {
    const res = await fetch(getLookupUrl(trimmed), {
      cache: 'no-store',
      signal: options?.signal,
    });
    const data = await res.json();
    if (data.found && data.name) {
      return { found: true, name: String(data.name).trim() };
    }
    return { found: false };
  } catch (err) {
    if (options?.signal?.aborted) {
      return { found: false };
    }
    return { found: false };
  }
}
