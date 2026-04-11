"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

interface CreditState {
  balance: number;
  reading_count: number;
  loading: boolean;
}

export function useCredits(): CreditState & { refetch: () => void } {
  const { user, hydrated } = useAuth();
  const [state, setState] = useState<CreditState>({
    balance: 0,
    reading_count: 0,
    loading: true,
  });
  const refetchRef = useRef<() => void>(() => undefined);

  const fetchData = useCallback(async () => {
    if (!user) {
      setState({ balance: 0, reading_count: 0, loading: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const [creditsRes, readingsRes] = await Promise.all([
        fetch("/api/user/credits"),
        fetch("/api/user/readings"),
      ]);
      const credits = (await creditsRes.json()) as { balance: number };
      const readings = (await readingsRes.json()) as { readings: Array<{ id: string }> };
      setState({
        balance: credits.balance,
        reading_count: readings.readings.length,
        loading: false,
      });
    } catch {
      setState({ balance: 0, reading_count: 0, loading: false });
    }
  }, [user]);

  useEffect(() => {
    refetchRef.current = () => {
      void fetchData();
    };
  }, [fetchData]);

  useEffect(() => {
    if (!hydrated) return;
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user]);

  return { ...state, refetch: () => refetchRef.current() };
}
