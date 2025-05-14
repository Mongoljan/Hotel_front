// app/hooks/useCombinedData.ts
import { useEffect, useState } from 'react';

interface CombinedData {
  property_types: { id: number; name_en: string; name_mn: string }[];
  ratings: { id: number; rating: string }[];
  facilities: { id: number; name_en: string; name_mn: string }[];
  accessibility_features: { id: number; name_en: string; name_mn: string }[];
  province: { id: number; name: string }[];
  city: { id: number; name: string }[];
  soum: { id: number; name: string }[];
  district: { id: number; name: string }[];
  languages: { id: number; languages_name_mn: string; languages_name_en: string }[];
}

// ✅ In-memory singleton cache
let combinedDataCache: CombinedData | null = null;

export function useCombinedData() {
  const [data, setData] = useState<CombinedData | null>(combinedDataCache);
  const [loading, setLoading] = useState(!combinedDataCache);

  useEffect(() => {
    if (combinedDataCache) return; // ✅ Already cached, no refetch

    fetch('https://dev.kacc.mn/api/combined-data/')
      .then((res) => res.json())
      .then((json) => {
        combinedDataCache = json;
        setData(json);
      })
      .catch((err) => console.error('Failed to fetch combined data:', err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
