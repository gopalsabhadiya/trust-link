"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BrandProgressBar,
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardSectionCard,
  DashboardStatEmpty,
} from "@/components/brand";
import { Briefcase, ClipboardCheck, ShieldCheck } from "lucide-react";

export function CandidateDashboard() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Candidate workspace"
        description="Track verifiable credentials, applications, and anti-fraud readiness."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard title="Verifiable credentials" icon={ClipboardCheck} iconVariant="success">
          <Badge variant="verified" className="mb-2">
            Ready to verify
          </Badge>
          <p className="text-xs text-slate-600">Share proofs without exposing raw documents.</p>
        </DashboardMetricCard>

        <DashboardMetricCard title="Applied jobs" icon={Briefcase} iconVariant="brand">
          <DashboardStatEmpty className="mb-1" />
          <p className="text-xs text-slate-600">Applications synced from connected roles.</p>
        </DashboardMetricCard>

        <DashboardMetricCard title="Resume fraud protection" icon={ShieldCheck} iconVariant="brand">
          <BrandProgressBar value={40} className="mb-2" />
          <p className="text-xs text-slate-600">40% — add credentials to raise trust score.</p>
        </DashboardMetricCard>
      </div>

      <DashboardSectionCard
        title="Next steps"
        description="Complete your profile and request your first verifiable credential from an issuer."
      >
        <div className="flex flex-col gap-3">
          <p>DPDP-aligned selective disclosure keeps you in control of who sees what.</p>
          <Link href="/dashboard/experience?new=1">
            <Button className="rounded-md bg-brand-blue hover:bg-brand-blue/90">
              Start Experience Letter Draft
            </Button>
          </Link>
        </div>
      </DashboardSectionCard>
    </div>
  );
}
