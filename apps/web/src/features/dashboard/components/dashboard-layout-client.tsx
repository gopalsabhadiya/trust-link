"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DashboardSessionProvider } from "../context/session-context";
import { useSessionUserQuery } from "../hooks/use-session-user";
import { DashboardShell } from "./dashboard-shell";
import { DashboardSkeleton } from "./dashboard-skeleton";

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending, isError } = useSessionUserQuery();

  useEffect(() => {
    if (!isError) return;
    router.replace("/login");
  }, [isError, router]);

  if (isPending || (!user && !isError)) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardSessionProvider user={user}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </DashboardSessionProvider>
  );
}
