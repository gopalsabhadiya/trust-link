"use client";

import { Bell, Menu } from "lucide-react";
import { BrandIcon } from "@/components/brand";
import { NotificationPanel } from "./notification-panel";
import { UserMenu } from "./user-menu";
import type { UserDTO } from "@trustlink/shared";

export function DashboardHeader({
  user,
  onMenuClick,
}: {
  user: UserDTO;
  onMenuClick?: () => void;
}) {
  const count = user.notificationCount;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6">
      <button
        type="button"
        className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 md:hidden"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
      >
        <BrandIcon icon={Menu} variant="muted" size="md" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-3">
        <NotificationPanel count={count} />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
