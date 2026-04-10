"use client";

import {
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardSectionCard,
  DashboardStatEmpty,
} from "@/components/brand";
import { Building2, ShieldCheck, Users } from "lucide-react";

export function HRDashboard() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="HR workspace"
        description="Post company roles, verify candidates, and monitor team metrics."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard title="Company job postings" icon={Building2} iconVariant="brand">
          <DashboardStatEmpty className="mb-1" />
          <p className="text-xs text-slate-600">Open listings linked to verification policies.</p>
        </DashboardMetricCard>

        <DashboardMetricCard title="Verifying candidates" icon={ShieldCheck} iconVariant="success">
          <p className="text-sm text-slate-600">
            Review incoming proofs and issue verifiable credentials with audit trails.
          </p>
        </DashboardMetricCard>

        <DashboardMetricCard title="Team metrics" icon={Users} iconVariant="muted">
          <DashboardStatEmpty className="mb-1" />
          <p className="text-xs text-slate-600">Issuer throughput and verification SLAs (coming soon).</p>
        </DashboardMetricCard>
      </div>

      <DashboardSectionCard
        title="DPDP posture"
        description="Reduce data liability by verifying without hoarding candidate PDFs in shared drives."
      />
    </div>
  );
}
