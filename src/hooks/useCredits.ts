"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { useAuth } from "@/hooks/useAuth";

interface CreditState {
  balance: number;
  reading_count: number;
  loading: boolean;
}

const DEFAULT_STATE: CreditState = { balance: 0, reading_count: 0, loading: true };
const EMPTY_STATE: CreditState = { balance: 0, reading_count: 0, loading: false };

// External store — React 19 compliant via useSyncExternalStore
const store = {
  state: { ...DEFAULT_STATE } as CreditState,
  listeners: new Set<() => void>(),
  notify() {
    this.listeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    store.listeners.add(fn);
    return () => {
      store.listeners.delete(fn);
    };
  },
  getSnapshot(): CreditState {
    return store.state;
  },
  getServerSnapshot(): CreditState {
    return DEFAULT_STATE;
  },
  startFetch() {
    store.state = { ...DEFAULT_STATE, loading: true };
    store.notify();
    void fetchCredits();
  },
  reset() {
    store.state = EMPTY_STATE;
    store.notify();
  },
};

async function fetchCredits(): Promise<void> {
  try {
    const [creditsRes, readingsRes] = await Promise.all([
      fetch("/api/user/credits"),
      fetch("/api/user/readings"),
    ]);
    const credits = (await creditsRes.json()) as { balance: number };
    const readings = (await readingsRes.json()) as { readings: Array<{ id: string }> };
    store.state = {
      balance: credits.balance,
      reading_count: readings.readings.length,
      loading: false,
    };
  } catch {
    store.state = EMPTY_STATE;
  }
  store.notify();
}

export function useCredits(): CreditState & { refetch: () => void } {
  const { user, hydrated } = useAuth();
  const userId = user?.id ?? null;
  const fetchedForRef = useRef<string | null>(null);

  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  // Fetch once per userId — effect avoids ref access during render
  useEffect(() => {
    if (!hydrated) return;
    if (userId && fetchedForRef.current !== userId) {
      fetchedForRef.current = userId;
      store.startFetch();
    }
    if (!userId && fetchedForRef.current !== null) {
      fetchedForRef.current = null;
      store.reset();
    }
  }, [hydrated, userId]);

  const refetch = useCallback(() => {
    store.startFetch();
  }, []);

  return { ...state, refetch };
}
