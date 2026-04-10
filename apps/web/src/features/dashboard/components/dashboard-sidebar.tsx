"use client";

import type { MouseEventHandler } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileCheck,
  LayoutDashboard,
  Link2,
  Settings,
  UserRound,
  UserSearch,
} from "lucide-react";
import { BrandIcon, TrustLinkLogoMark } from "@/components/brand";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UserDTO, UserRole } from "@trustlink/shared";
import { useHrCredentialRequestsQuery } from "@/features/hr-requests/hooks/use-hr-credential-requests";

const BASE_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const ROLE_EXTRA: Record<
  UserRole,
  { href: string; label: string; icon: LucideIcon; hrRequestsBadge?: boolean }[]
> = {
  CANDIDATE: [{ href: "/dashboard/experience", label: "Experience", icon: ClipboardList }],
  RECRUITER: [{ href: "#", label: "Candidate search", icon: UserSearch }],
  HR: [
    {
      href: "/dashboard/hr/requests",
      label: "Credential Requests",
      icon: FileCheck,
      hrRequestsBadge: true,
    },
    { href: "#", label: "Team metrics", icon: Building2 },
  ],
};

/**
 * @param collapsed `true` | `false` = desktop rail (labels animate). Omit = mobile drawer (labels always shown).
 */
function SidebarNavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
  badgeCount,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  badgeCount?: number;
}) {
  const isDrawer = collapsed === undefined;
  const labelCollapsed = collapsed === true;

  const showBadge = typeof badgeCount === "number" && badgeCount > 0;
  const badgeText = badgeCount != null && badgeCount > 9 ? "9+" : String(badgeCount ?? "");

  const link = (
    <Link
      href={href}
      onClick={onClick}
      aria-label={labelCollapsed ? label : undefined}
      className={cn(
        "flex w-full min-w-0 items-center rounded-md border-2 text-sm transition-colors duration-150 ease-out",
        isDrawer ? "gap-3 px-3 py-2.5" : "gap-1 px-2 py-2",
        active
          ? "border-[var(--color-brand-blue)] bg-brand-blue-subtle font-semibold text-[var(--color-brand-blue)] shadow-sm"
          : "border-transparent font-medium text-slate-800 hover:bg-slate-100"
      )}
    >
      <span className="relative flex h-9 w-10 shrink-0 items-center justify-center">
        <BrandIcon icon={Icon} variant={active ? "brand" : "muted"} size="md" />
        {showBadge && labelCollapsed ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-1 text-[10px] font-bold leading-none text-white transition-[transform,opacity] duration-[320ms] ease-sidebar"
            aria-hidden
          >
            {badgeText}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left",
          isDrawer && "max-w-[min(100%,18rem)] opacity-100 transition-[max-width,opacity] duration-200 ease-sidebar",
          !isDrawer && "transition-sidebar-label",
          !isDrawer && labelCollapsed && "max-w-0 opacity-0",
          !isDrawer && !labelCollapsed && "max-w-[min(100%,15rem)] opacity-100",
          active ? "font-semibold text-[var(--color-brand-blue)]" : "font-medium text-slate-800"
        )}
        aria-hidden={labelCollapsed}
      >
        {label}
      </span>
      {showBadge && !labelCollapsed ? (
        <span
          className="ml-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-1.5 text-[10px] font-bold leading-none text-white transition-sidebar-label"
          aria-hidden
        >
          {badgeText}
        </span>
      ) : null}
    </Link>
  );

  if (labelCollapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" align="center" className="font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function DashboardSidebar({
  user,
  mobileOpen,
  onNavigate,
  onOpenMobileMenu,
  sidebarCollapsed,
  onToggleSidebarCollapsed,
}: {
  user: UserDTO;
  mobileOpen: boolean;
  onNavigate?: () => void;
  onOpenMobileMenu?: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebarCollapsed: () => void;
}) {
  const pathname = usePathname();
  const extra = ROLE_EXTRA[user.role];
  const hrRequestsQuery = useHrCredentialRequestsQuery(user.role === "HR");
  const hrPendingCount = hrRequestsQuery.data?.pendingActionCount ?? 0;

  const DesktopNav = () => (
    <nav
      id="dashboard-workspace-nav"
      className="flex flex-col gap-1 px-3 pb-3 pt-5"
      aria-label="Workspace"
    >
      {BASE_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <SidebarNavLink
            key={href}
            href={href}
            label={label}
            icon={Icon}
            active={active}
            collapsed={sidebarCollapsed}
          />
        );
      })}
      {extra.map(({ href, label, icon: Icon, hrRequestsBadge }) => {
        const roleLinkActive = href !== "#" && pathname === href;
        return (
          <SidebarNavLink
            key={label}
            href={href}
            label={label}
            icon={Icon}
            active={roleLinkActive}
            collapsed={sidebarCollapsed}
            badgeCount={hrRequestsBadge ? hrPendingCount : undefined}
            onClick={href === "#" ? (e) => e.preventDefault() : undefined}
          />
        );
      })}
    </nav>
  );

  const MobileDrawerNav = () => (
    <nav className="flex flex-col gap-1 px-3 pb-3 pt-5" aria-label="Workspace">
      {BASE_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <SidebarNavLink
            key={href}
            href={href}
            label={label}
            icon={Icon}
            active={active}
            onClick={() => {
              onNavigate?.();
            }}
          />
        );
      })}
      {extra.map(({ href, label, icon: Icon, hrRequestsBadge }) => {
        const roleLinkActive = href !== "#" && pathname === href;
        return (
          <SidebarNavLink
            key={label}
            href={href}
            label={label}
            icon={Icon}
            active={roleLinkActive}
            badgeCount={hrRequestsBadge ? hrPendingCount : undefined}
            onClick={(e) => {
              if (href === "#") e.preventDefault();
              onNavigate?.();
            }}
          />
        );
      })}
    </nav>
  );

  return (
    <>
      <aside
        className={cn(
          "relative hidden h-full min-h-0 shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-[320ms] ease-sidebar md:flex",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div
          className={cn(
            "shrink-0 border-b border-slate-200 bg-white transition-[padding,min-height,gap] duration-[320ms] ease-sidebar",
            sidebarCollapsed
              ? "flex min-h-[4.5rem] flex-col items-stretch gap-1 px-0.5 py-1.5"
              : "flex h-16 flex-row items-center gap-1 px-2.5"
          )}
        >
          {sidebarCollapsed ? (
            <>
              <div className="flex min-h-9 w-full items-center justify-center overflow-hidden">
                <TrustLinkLogoMark
                  variant="sidebar"
                  showWordmark={false}
                  iconSize="xl"
                  className="min-w-0"
                />
              </div>
              <div className="flex w-full items-center justify-center">
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onToggleSidebarCollapsed}
                      aria-expanded={false}
                      aria-controls="dashboard-workspace-nav"
                      aria-label="Expand Sidebar"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-[320ms] ease-sidebar hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
                    >
                      <ChevronRight
                        className="h-5 w-5 text-[var(--color-brand-blue)]"
                        aria-hidden
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Expand Sidebar
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-1 items-center justify-start overflow-hidden">
                <TrustLinkLogoMark
                  variant="sidebar"
                  showWordmark
                  iconSize="xl"
                  className="min-w-0"
                />
              </div>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleSidebarCollapsed}
                    aria-expanded
                    aria-controls="dashboard-workspace-nav"
                    aria-label="Collapse Sidebar"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors duration-[320ms] ease-sidebar hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
                  >
                    <ChevronLeft
                      className="h-5 w-5 text-[var(--color-brand-blue)]"
                      aria-hidden
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Collapse Sidebar
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <DesktopNav />
        </div>
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
          className="flex h-16 w-full items-center justify-center border-b border-slate-200 text-[var(--color-brand-blue)] transition-colors duration-150 hover:bg-brand-blue-subtle"
          aria-label="Open TrustLink menu"
          onClick={() => onOpenMobileMenu?.()}
        >
          <BrandIcon icon={Link2} variant="brand" size="lg" />
        </button>
        <div className="flex flex-1 flex-col items-center py-3">
          <Link
            href="/dashboard"
            className={cn(
              "rounded-md border-2 p-2 transition-colors duration-150 ease-out",
              pathname === "/dashboard"
                ? "border-[var(--color-brand-blue)] bg-brand-blue-subtle text-[var(--color-brand-blue)] shadow-sm"
                : "border-transparent text-[var(--color-brand-blue)] hover:bg-slate-100"
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
            <div className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-4">
              <TrustLinkLogoMark variant="sidebar" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <MobileDrawerNav />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
