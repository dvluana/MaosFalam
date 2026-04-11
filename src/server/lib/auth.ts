import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Returns the full Clerk user record { id, name, email }.
 * Use only when you need name or email (e.g. for sending email via Resend).
 * For auth checks only, use getClerkUserId() — currentUser() makes a network call.
 * Throws "Not authenticated" if called outside an authenticated request.
 */
export async function getClerkUser(): Promise<{ id: string; name: string; email: string }> {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  return {
    id: user.id,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    email: user.emailAddresses[0]?.emailAddress || "",
  };
}

/**
 * Returns the Clerk user ID from the current session.
 * Use this in every protected route handler — do NOT accept userId from request body.
 * Throws "Not authenticated" if called outside an authenticated request.
 */
export async function getClerkUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}
