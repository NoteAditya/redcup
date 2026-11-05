"use client";

import { HandleSSOCallback } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SSOCallbackClient() {
  const router = useRouter();

  return (
    <HandleSSOCallback
      navigateToApp={({ session, decorateUrl }) => {
        if (session?.currentTask) {
          const destination = decorateUrl(`/onboarding/${session.currentTask.key}`);
          if (destination.startsWith("http")) {
            window.location.href = destination;
            return;
          }
          router.replace(destination);
          return;
        }
        const destination = decorateUrl("/auth/continue");
        if (destination.startsWith("http")) {
          window.location.href = destination;
          return;
        }
        router.replace(destination);
      }}
      navigateToSignIn={() => router.replace("/login")}
      navigateToSignUp={() => router.replace("/signup")}
    />
  );
}
