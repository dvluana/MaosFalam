"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "maosfalam_user";

interface StoredUser {
  id: string;
  name: string;
  email: string;
}

function readStored(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(user: StoredUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function genId(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

export function useAuth() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setUser(readStored());
      setHydrated(true);
    }, 0);

    // Sincroniza entre instâncias do hook na mesma aba via evento custom
    const onSync = () => setUser(readStored());
    window.addEventListener("storage", onSync);
    window.addEventListener("maosfalam:auth", onSync);
    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener("storage", onSync);
      window.removeEventListener("maosfalam:auth", onSync);
    };
  }, []);

  const emit = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("maosfalam:auth"));
    }
  };

  const login = useCallback((email: string, password: string): boolean => {
    if (!email.includes("@") || password.length < 1) return false;
    const u: StoredUser = {
      id: genId(),
      name: email.split("@")[0] ?? "voce",
      email,
    };
    writeStored(u);
    setUser(u);
    emit();
    return true;
  }, []);

  const register = useCallback((name: string, email: string, password: string): boolean => {
    if (!name.trim() || !email.includes("@") || password.length < 6) {
      return false;
    }
    const u: StoredUser = { id: genId(), name: name.trim(), email };
    writeStored(u);
    setUser(u);
    emit();
    return true;
  }, []);

  const logout = useCallback((): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setUser(null);
    emit();
  }, []);

  return { user, hydrated, login, register, logout };
}
