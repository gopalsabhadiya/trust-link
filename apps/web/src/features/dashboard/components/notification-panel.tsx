"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { BrandIcon } from "@/components/brand";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  "New Credential Verified",
  "Candidate proof shared",
  "Recruiter outreach accepted",
] as const;

export function NotificationPanel({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const displayCount = count > 0 ? count : MOCK_NOTIFICATIONS.length;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
        aria-label={`${displayCount} notifications`}
        aria-expanded={open}
      >
        <BrandIcon icon={Bell} variant="muted" size="md" />
        <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-blue)]/35 opacity-75"
            aria-hidden="true"
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-blue)] ring-2 ring-white"
            aria-hidden="true"
          />
        </span>
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
          {displayCount > 9 ? "9+" : displayCount}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
            Notifications
          </p>
          <ul className="mt-1 space-y-1">
            {MOCK_NOTIFICATIONS.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left",
                    "hover:bg-slate-50"
                  )}
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-brand-blue)]" />
                  <span className="text-sm text-slate-800">{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
