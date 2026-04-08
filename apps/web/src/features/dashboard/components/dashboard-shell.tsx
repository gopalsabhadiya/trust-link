"use client";

import { useState, type ReactNode } from "react";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import type { UserDTO } from "@trustlink/shared";

export function DashboardShell({
  user,
  children,
}: {
  user: UserDTO;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        user={user}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onOpenMobileMenu={() => setMobileOpen(true)}
      />
      <div className="ml-14 flex min-h-screen min-w-0 flex-1 flex-col md:ml-0">
        <DashboardHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
