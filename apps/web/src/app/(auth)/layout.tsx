import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-navy p-10 text-slate-100 lg:flex">
        <Link href="/" className="flex items-center gap-2" aria-label="TrustLink Home">
          <ShieldCheck className="h-7 w-7 text-brand-blue" aria-hidden="true" />
          <span className="text-xl font-bold tracking-tight text-white">TrustLink</span>
        </Link>

        <div className="max-w-md">
          <blockquote className="text-lg font-medium leading-relaxed text-slate-100/90">
            &ldquo;TrustLink replaced our entire 14-day BGV pipeline with a single API call. We
            onboard engineers in 48 hours now.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-slate-400">
            — VP of People, Series B Fintech (Pilot Client)
          </p>
        </div>

        <p className="text-xs text-slate-500">
          Blockchain Background Verification &middot; DPDP Compliant HR Tech
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">{children}</div>
    </div>
  );
}
