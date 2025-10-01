'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

type StepStatus = 'complete' | 'current' | 'upcoming';

interface StepDefinition {
  key: string;
  label: string;
  description: string;
  status: StepStatus;
  index: number;
}

interface HotelSummary {
  companyName: string;
  propertyName: string;
  groupName?: string | null;
  isApproved: boolean;
}

interface HotelOnboardingContextValue {
  loading: boolean;
  error: string | null;
  proceed: number | null;
  setProceed: (value: number) => void;
  view: 'proceed' | 'register';
  setView: (view: 'proceed' | 'register') => void;
  hotelApproved: boolean;
  steps: StepDefinition[];
  progress: number;
  hotelInfo: HotelSummary | null;
  lastSyncedAt: Date | null;
  refresh: () => Promise<void>;
}

const HotelOnboardingContext = React.createContext<HotelOnboardingContextValue | undefined>(undefined);

function getNumeric(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

const STEP_DEFINITIONS: Array<Omit<StepDefinition, 'status'>> = [
  {
    key: 'application',
    label: 'Хүсэлт илгээсэн',
    description: 'Анхан шатны бүртгэлийн хүсэлт илгээгдсэн эсэхийг шалгана.',
    index: 1
  },
  {
    key: 'review',
    label: 'Хүлээгдэж байгаа',
    description: 'Хүсэлтийг бид шалгаж байна. Хяналтын төлөвийг анхаарна уу.',
    index: 2
  },
  {
    key: 'approval',
    label: 'Баталгаажсан',
    description: 'Баталгаажуулалт хийгдсэний дараа нэмэлт мэдээллээ оруулна уу.',
    index: 3
  },
  {
    key: 'details',
    label: 'Дэлгэрэнгүй мэдээлэл оруулах',
    description: 'Өрөө, үйлчилгээ болон нэмэлт мэдээллээ шинэчилнэ үү.',
    index: 4
  }
];

export function HotelOnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [proceed, setProceedState] = React.useState<number | null>(null);
  const [view, setView] = React.useState<'proceed' | 'register'>('proceed');
  const [hotelApproved, setHotelApproved] = React.useState(false);
  const [hotelInfo, setHotelInfo] = React.useState<HotelSummary | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);

  const updateProceed = React.useCallback((value: number) => {
    setProceedState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('proceed', String(value));
    }
  }, []);

  const deriveSteps = React.useCallback(
    (state: { proceed: number | null; approved: boolean }): StepDefinition[] => {
      const { proceed, approved } = state;

      const currentIndex = (() => {
        if (approved) {
          if (proceed === 2) {
            return 4;
          }
          return 3;
        }

        if (proceed === 2) {
          return 4;
        }

        if (proceed === 1) {
          return 2;
        }

        if (proceed === 0) {
          return 2;
        }

        return 1;
      })();

      return STEP_DEFINITIONS.map((step) => {
        const status: StepStatus = step.index < currentIndex
          ? 'complete'
          : step.index === currentIndex
            ? 'current'
            : 'upcoming';

        return {
          ...step,
          status
        } satisfies StepDefinition;
      });
    },
    []
  );

  const fetchHotelSummary = React.useCallback(async () => {
    if (!user?.hotel) return null;

    const response = await fetch(`https://dev.kacc.mn/api/properties/${user.hotel}`);
    if (!response.ok) throw new Error('Failed to fetch hotel summary');
    const data = await response.json();

    const summary: HotelSummary = {
      companyName: data.CompanyName ?? data.company_name ?? '-',
      propertyName: data.PropertyName ?? data.property_name ?? '-',
      groupName: data.group_name ?? null,
      isApproved: Boolean(data.is_approved)
    };

    return summary;
  }, [user?.hotel]);

  const computeProceedFromData = React.useCallback(async () => {
    if (!user?.hotel || typeof window === 'undefined') return 0;

    const storedPropertyData = localStorage.getItem('propertyData');
    if (storedPropertyData) {
      try {
        const parsed = JSON.parse(storedPropertyData);
        if (Array.isArray(parsed?.general_facilities) && parsed.general_facilities.length) {
          return 1;
        }
      } catch (err) {
        console.warn('Failed to parse propertyData from localStorage', err);
      }
    }

    try {
      const res = await fetch(`https://dev.kacc.mn/api/property-details/?property=${user.hotel}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const details = await res.json();
        if (Array.isArray(details) && details.length) {
          return 2;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch property details for proceed calculation', err);
    }

    return 0;
  }, [user?.hotel]);

  const refresh = React.useCallback(async () => {
    if (!user?.hotel) return;

    setLoading(true);
    setError(null);

    try {
      const [summary, latestProceed] = await Promise.all([
        fetchHotelSummary(),
        computeProceedFromData()
      ]);

      if (summary) {
        setHotelInfo(summary);
        setHotelApproved(summary.isApproved);
      }

      updateProceed(latestProceed);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error(err);
      setError('Шинэчлэлт татах явцад алдаа гарлаа. Сүлжээгээ шалгаад дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  }, [computeProceedFromData, fetchHotelSummary, updateProceed, user?.hotel]);

  React.useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!user?.hotel) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (!cancelled && typeof window !== 'undefined') {
          const storedProceed = getNumeric(localStorage.getItem('proceed'));
          if (storedProceed !== null) {
            setProceedState(storedProceed);
          }
        }

        const [summary, initialProceed] = await Promise.all([
          fetchHotelSummary(),
          computeProceedFromData()
        ]);

        if (cancelled) return;

        if (summary) {
          setHotelInfo(summary);
          setHotelApproved(summary.isApproved);
        }

        updateProceed(initialProceed);
        setLastSyncedAt(new Date());
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('Хяналтын мэдээлэл ачаалах явцад алдаа гарлаа.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [computeProceedFromData, fetchHotelSummary, updateProceed, user?.hotel]);

  React.useEffect(() => {
    if (!user?.hotel) return;

    const interval = window.setInterval(() => {
      refresh().catch((err) => console.error('Failed to refresh hotel state', err));
    }, 20000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refresh, user?.hotel]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (proceed === null) return;
    localStorage.setItem('proceed', String(proceed));
  }, [proceed]);

  const steps = React.useMemo(() => deriveSteps({ proceed, approved: hotelApproved }), [deriveSteps, hotelApproved, proceed]);

  const progress = React.useMemo(() => {
    const completed = steps.filter((step) => step.status === 'complete').length;
    return Math.min(100, Math.round((completed / steps.length) * 100));
  }, [steps]);

  const value = React.useMemo<HotelOnboardingContextValue>(() => ({
    loading,
    error,
    proceed,
    setProceed: updateProceed,
    view,
    setView,
    hotelApproved,
    steps,
    progress,
    hotelInfo,
    lastSyncedAt,
    refresh
  }), [error, hotelApproved, hotelInfo, lastSyncedAt, loading, proceed, progress, refresh, steps, updateProceed, view]);

  return (
    <HotelOnboardingContext.Provider value={value}>
      {children}
    </HotelOnboardingContext.Provider>
  );
}

export function useHotelOnboarding() {
  const context = React.useContext(HotelOnboardingContext);
  if (context === undefined) {
    throw new Error('useHotelOnboarding must be used within a HotelOnboardingProvider');
  }
  return context;
}
