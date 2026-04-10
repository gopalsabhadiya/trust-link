"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TrustLinkLogoMark } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { useSessionUserQuery } from "@/features/dashboard/hooks/use-session-user";
import { cn } from "@/lib/utils";

export function ReviewAccessGate({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useSessionUserQuery();

  useEffect(() => {
    if (session.isError) {
      const cb = encodeURIComponent(`/review/${token}`);
      router.replace(`/login?callbackUrl=${cb}`);
    }
  }, [session.isError, router, token]);

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your session…
        </div>
      </div>
    );
  }

  if (session.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-slate-600">
        Redirecting to sign in…
      </div>
    );
  }

  if (session.data.role !== "HR") {
    const reviewPath = `/review/${token}`;
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-6 p-6 text-center">
        <TrustLinkLogoMark />
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">HR sign-in required</h1>
          <p className="mt-2 text-sm text-slate-600">
            This secure review link can only be used from a company (HR) TrustLink account. Switch
            to an HR profile or create one, then open the link again.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(reviewPath)}`}
              className={cn(
                buttonVariants(),
                "rounded-md bg-brand-blue text-white hover:bg-brand-blue/90 no-underline"
              )}
            >
              Sign in as HR
            </Link>
            <Link
              href={`/register?role=HR&callbackUrl=${encodeURIComponent(reviewPath)}`}
              className={cn(buttonVariants({ variant: "outline" }), "rounded-md no-underline")}
            >
              Create HR account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
