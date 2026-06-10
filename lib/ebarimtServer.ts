const FETCH_TIMEOUT_MS = 12_000;

function normalizeRegNo(regno: string): string {
  return regno.trim();
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function lookupViaLegacyApi(regno: string): Promise<string | null> {
  const json = await fetchJson(
    `https://info.ebarimt.mn/rest/merchant/info?regno=${encodeURIComponent(regno)}`
  );
  if (!json?.found || !json?.name) return null;
  return String(json.name).trim() || null;
}

async function lookupViaNewApi(regno: string): Promise<string | null> {
  const tinJson = await fetchJson(
    `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${encodeURIComponent(regno)}`
  );
  const tin = tinJson?.status === 200 ? tinJson.data : null;
  if (!tin) return null;

  const infoJson = await fetchJson(
    `https://api.ebarimt.mn/api/info/check/getInfo?tin=${encodeURIComponent(String(tin))}`
  );
  const data = infoJson?.status === 200 ? (infoJson.data as Record<string, unknown>) : null;
  if (!data?.found || !data?.name) return null;

  return String(data.name).trim() || null;
}

/** Run legacy + new APIs in parallel; first successful name wins. */
export async function resolveEbarimtCompanyName(rawRegno: string): Promise<string | null> {
  const regno = normalizeRegNo(rawRegno);
  if (!regno) return null;

  const results = await Promise.allSettled([
    lookupViaLegacyApi(regno),
    lookupViaNewApi(regno),
  ]);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }

  return null;
}
