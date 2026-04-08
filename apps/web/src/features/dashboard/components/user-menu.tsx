"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { BrandIcon } from "@/components/brand";
import { cn } from "@/lib/utils";
import { useLogout } from "../hooks/use-logout";
import type { UserDTO } from "@trustlink/shared";

export function UserMenu({ user }: { user: UserDTO }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogout();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const initial = user.name?.trim()?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left text-sm shadow-sm transition hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePicture}
            alt=""
            className="h-8 w-8 rounded-full object-cover ring-1 ring-[var(--color-brand-blue)]/15"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-subtle text-xs font-semibold text-[var(--color-brand-blue)] ring-1 ring-[var(--color-brand-blue)]/15">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[140px] truncate text-slate-800 sm:block">{user.name}</span>
        <BrandIcon icon={ChevronDown} variant="muted" size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link
            href="/dashboard/profile"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <BrandIcon icon={UserRound} variant="muted" size="sm" />
            Profile
          </Link>
          <Link
            href="/dashboard/settings"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <BrandIcon icon={Settings} variant="muted" size="sm" />
            Settings
          </Link>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            className={cn(
              "group flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
              "text-slate-500 hover:bg-red-50 hover:text-red-600"
            )}
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-red-600" aria-hidden />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
