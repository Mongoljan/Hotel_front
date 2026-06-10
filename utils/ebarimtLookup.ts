export interface EbarimtLookupResult {
  found: boolean;
  name?: string;
}

export async function lookupEbarimt(regno: string): Promise<EbarimtLookupResult> {
  const res = await fetch(`/api/ebarimt?regno=${encodeURIComponent(regno)}`);
  const data = await res.json();
  if (data.found && data.name) {
    return { found: true, name: data.name as string };
  }
  return { found: false };
}
