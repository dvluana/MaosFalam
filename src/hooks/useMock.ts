"use client";

import { useEffect, useRef, useState } from "react";

interface UseMockResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Em desenvolvimento, sempre retorna o mock.
 * Em produção, chama o realFetcher se existir. Caso contrário, cai no mock.
 * `mockPath` é resolvido dinamicamente a partir de /src/mocks/.
 */
export function useMock<T>(mockPath: string, realFetcher?: () => Promise<T>): UseMockResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    async function load() {
      try {
        const isDev = process.env.NODE_ENV === "development";
        if (isDev || !realFetcher) {
          const mod = (await import(`@/mocks/${mockPath}.json`)) as {
            default: T;
          };
          if (!cancelled.current) {
            setData(mod.default);
            setLoading(false);
          }
          return;
        }

        const result = await realFetcher();
        if (!cancelled.current) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled.current = true;
    };
  }, [mockPath, realFetcher]);

  return { data, loading, error };
}
