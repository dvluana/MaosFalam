"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const user: AuthUser | null =
    isLoaded && isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          name: clerkUser.fullName ?? clerkUser.primaryEmailAddress?.emailAddress ?? "",
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        }
      : null;

  const login = useCallback((_email: string, _password: string): boolean => false, []);

  const register = useCallback(
    (_name: string, _email: string, _password: string): boolean => false,
    [],
  );

  const logout = useCallback((): void => {
    void signOut();
  }, [signOut]);

  return { user, hydrated: isLoaded, login, register, logout };
}
