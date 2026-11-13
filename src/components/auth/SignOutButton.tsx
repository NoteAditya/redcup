"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { useTransition } from "react";
import { signOut as ironSignOut } from "@/server/auth/actions";

/**
 * Ends both sessions: Clerk (Google) on the client, then the iron-session
 * password cookie on the server. Without the Clerk step a Google user stays
 * signed in, because getSession() checks Clerk first.
 */
export function SignOutButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={className}
      style={style}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (isSignedIn) {
            try {
              await clerk.signOut();
            } catch {
              // Still clear the password session below.
            }
          }
          await ironSignOut();
        })
      }
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
