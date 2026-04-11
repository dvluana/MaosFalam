"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef } from "react";

const CLAIMED_KEY = "maosfalam_readings_claimed";
const STAGING_SEEDED_KEY = "maosfalam_staging_seeded";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  // Track whether we've already attempted the claim in this render cycle
  const claimAttempted = useRef(false);

  const user: AuthUser | null =
    isLoaded && isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          name: clerkUser.fullName ?? clerkUser.primaryEmailAddress?.emailAddress ?? "",
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        }
      : null;

  // On first authenticated hydration: claim any anonymous readings
  useEffect(() => {
    if (!isLoaded || !isSignedIn || claimAttempted.current) return;
    if (typeof window === "undefined") return;

    claimAttempted.current = true;

    // Claim anonymous readings (fire-and-forget)
    const alreadyClaimed = localStorage.getItem(CLAIMED_KEY);
    if (!alreadyClaimed) {
      void fetch("/api/user/claim-readings", { method: "POST" })
        .then((res) => {
          if (res.ok) {
            localStorage.setItem(CLAIMED_KEY, "1");
          }
        })
        .catch(() => undefined);
    }

    // Staging only: seed 100 test credits on first login
    if (process.env.NEXT_PUBLIC_ENV_LABEL === "Testes") {
      const alreadySeeded = localStorage.getItem(STAGING_SEEDED_KEY);
      if (!alreadySeeded) {
        void fetch("/api/dev/seed-credits", { method: "POST" })
          .then((res) => {
            if (res.ok) {
              localStorage.setItem(STAGING_SEEDED_KEY, "1");
            }
          })
          .catch(() => undefined);
      }
    }
  }, [isLoaded, isSignedIn]);

  const login = useCallback((_email: string, _password: string): boolean => false, []);

  const register = useCallback(
    (_name: string, _email: string, _password: string): boolean => false,
    [],
  );

  const logout = useCallback((): void => {
    // Clear claim flag on logout so next login re-checks
    localStorage.removeItem(CLAIMED_KEY);
    void signOut();
  }, [signOut]);

  return { user, hydrated: isLoaded, login, register, logout };
}
