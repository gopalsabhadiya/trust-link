"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { UserDTO } from "@trustlink/shared";
import { HrRealtimeListener } from "@/features/hr-requests/components/hr-realtime-listener";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

const SIDEBAR_COLLAPSED_KEY = "trustlink.sidebarCollapsed";

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function DashboardShell({
  user,
  children,
}: {
  user: UserDTO;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(readSidebarCollapsed());
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore quota / private mode */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.key || e.key.toLowerCase() !== "b") return;
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.altKey || e.shiftKey) return;
      if (!window.matchMedia("(min-width: 768px)").matches) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable=true]")) return;
      e.preventDefault();
      toggleSidebarCollapsed();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebarCollapsed]);

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      {user.role === "HR" ? <HrRealtimeListener /> : null}
      <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-slate-50">
        <DashboardSidebar
          user={user}
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
          onOpenMobileMenu={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapsed={toggleSidebarCollapsed}
        />
        <div className="ml-14 flex h-full min-h-0 min-w-0 flex-1 flex-col md:ml-0">
          <DashboardHeader
            user={user}
            onMenuClick={() => setMobileOpen(true)}
          />
          <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
