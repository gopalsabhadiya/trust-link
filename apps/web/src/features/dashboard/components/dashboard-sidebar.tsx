"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  LayoutDashboard,
  Link2,
  Settings,
  UserRound,
  UserSearch,
} from "lucide-react";
import { BrandIcon, TrustLinkLogoMark } from "@/components/brand";
import { cn } from "@/lib/utils";
import type { UserDTO, UserRole } from "@trustlink/shared";

const BASE_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ROLE_EXTRA: Record<UserRole, { href: string; label: string; icon: LucideIcon }[]> = {
  CANDIDATE: [{ href: "/dashboard/drafts/new", label: "Draft letter", icon: FileText }],
  RECRUITER: [{ href: "#", label: "Candidate search", icon: UserSearch }],
  HR: [{ href: "#", label: "Team metrics", icon: Building2 }],
};

export function DashboardSidebar({
  user,
  mobileOpen,
  onNavigate,
  onOpenMobileMenu,
}: {
  user: UserDTO;
  mobileOpen: boolean;
  onNavigate?: () => void;
  onOpenMobileMenu?: () => void;
}) {
  const pathname = usePathname();
  const extra = ROLE_EXTRA[user.role];

  const NavList = ({
    expanded,
    onLinkClick,
  }: {
    expanded: boolean;
    onLinkClick?: () => void;
  }) => (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Workspace">
      {BASE_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
              expanded ? "justify-start" : "justify-center px-0",
              active
                ? "border border-brand-blue-subtle bg-brand-blue-subtle text-[var(--color-brand-blue)]"
                : "border border-transparent text-slate-800 hover:bg-slate-100"
            )}
          >
            <BrandIcon icon={Icon} variant={active ? "brand" : "muted"} size="md" />
            {expanded && <span className="text-slate-800">{label}</span>}
          </Link>
        );
      })}
      {expanded &&
        extra.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            onClick={onLinkClick}
            className="flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            <BrandIcon icon={Icon} variant="muted" size="md" />
            {label}
          </Link>
        ))}
    </nav>
  );

  return (
    <>
      <aside className="relative hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-slate-100 px-4">
          <TrustLinkLogoMark />
        </div>
        <NavList expanded />
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-14 flex-col border-r border-slate-200 bg-white md:hidden",
          mobileOpen && "hidden"
        )}
        aria-hidden={mobileOpen}
      >
        <button
          type="button"
          className="flex h-16 w-full items-center justify-center border-b border-slate-100 text-[var(--color-brand-blue)] transition hover:bg-brand-blue-subtle"
          aria-label="Open TrustLink menu"
          onClick={() => onOpenMobileMenu?.()}
        >
          <BrandIcon icon={Link2} variant="brand" size="lg" />
        </button>
        <div className="flex flex-1 flex-col items-center py-3">
          <Link
            href="/dashboard"
            className={cn(
              "rounded-md p-2 transition",
              pathname === "/dashboard"
                ? "bg-brand-blue-subtle text-[var(--color-brand-blue)]"
                : "text-[var(--color-brand-blue)] hover:bg-brand-blue-subtle"
            )}
            aria-label="Overview"
          >
            <BrandIcon icon={LayoutDashboard} variant="brand" size="md" />
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
            aria-label="Close menu"
            onClick={onNavigate}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl md:hidden">
            <div className="flex h-16 items-center border-b border-slate-100 px-4">
              <TrustLinkLogoMark />
            </div>
            <NavList expanded onLinkClick={onNavigate} />
          </aside>
        </>
      )}
    </>
  );
}
