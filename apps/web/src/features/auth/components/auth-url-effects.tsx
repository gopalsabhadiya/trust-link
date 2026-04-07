"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows toasts for OAuth redirect query params and strips them from the URL.
 */
export function AuthUrlEffects() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handledKey = useRef<string | null>(null);

  useEffect(() => {
    const oauth = searchParams.get("oauth");
    const err = searchParams.get("error");
    if (!oauth && !err) return;

    const key = `${pathname}?${searchParams.toString()}`;
    if (handledKey.current === key) return;

    if (pathname === "/" && oauth === "success") {
      handledKey.current = key;
      toast.success("You're signed in.");
      window.history.replaceState({}, "", "/");
      return;
    }

    if (pathname === "/register" && (err === "google" || err === "linkedin")) {
      handledKey.current = key;
      const label = err === "google" ? "Google" : "LinkedIn";
      toast.error(
        `${label} sign-in could not be completed. Try again or register with email.`
      );
      window.history.replaceState({}, "", "/register");
    }
  }, [pathname, searchParams]);

  return null;
}
