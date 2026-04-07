"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Compliance", href: "#compliance" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="TrustLink Home">
          <ShieldCheck className="h-7 w-7 text-brand-blue" aria-hidden="true" />
          <span className="text-xl font-bold tracking-tight">TrustLink</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" prefetch={false}>
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/register" prefetch={false} data-analytics-id="header-issue-credential">
            <Button variant="outline" size="sm">
              Issue Credential
            </Button>
          </Link>
          <Link href="/register" prefetch={false} data-analytics-id="header-verify-candidate">
            <Button size="sm">Verify Candidate</Button>
          </Link>
        </div>

        {/* Mobile Toggle — animated hamburger-to-X */}
        <button
          className="relative flex h-10 w-10 items-center justify-center p-2 -mr-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <div className="flex h-4 w-5 flex-col justify-between">
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 origin-center",
                mobileOpen && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300",
                mobileOpen && "scale-x-0 opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-foreground transition-all duration-300 origin-center",
                mobileOpen && "-translate-y-[7px] -rotate-45"
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu — slide-in animation */}
      <nav
        className={cn(
          "overflow-hidden bg-background transition-all duration-300 ease-out md:hidden",
          mobileOpen
            ? "max-h-80 border-t border-border opacity-100"
            : "max-h-0 opacity-0"
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="flex flex-col gap-3 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
            <Link href="/login" prefetch={false} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Log In
              </Button>
            </Link>
            <Link href="/register" prefetch={false} onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full" data-analytics-id="mobile-verify-cta">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
