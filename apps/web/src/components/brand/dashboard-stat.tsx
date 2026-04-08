import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Empty / not-yet-available metric — avoids heavy em dash styling */
export function DashboardStatEmpty({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block text-3xl font-medium tabular-nums tracking-tight text-slate-400",
        className
      )}
      aria-hidden
    >
      —
    </span>
  );
}

export function DashboardStatValue({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-3xl font-semibold tabular-nums tracking-tight text-slate-800",
        className
      )}
    >
      {children}
    </p>
  );
}
