"use client";

import {
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardSectionCard,
  DashboardStatEmpty,
  DashboardStatValue,
} from "@/components/brand";
import { Coins, Search, Workflow } from "lucide-react";

export function RecruiterDashboard() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Recruiter workspace"
        description="Search candidates, manage B2B credits, and track active pipelines."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard title="Candidate search" icon={Search} iconVariant="brand">
          <p className="text-sm text-slate-600">
            Run instant cryptographic checks instead of waiting on manual BGV cycles.
          </p>
        </DashboardMetricCard>

        <DashboardMetricCard title="B2B credit balance" icon={Coins} iconVariant="success">
          <DashboardStatEmpty className="mb-1" />
          <p className="text-xs text-slate-600">Fiat-based verification credits (coming soon).</p>
        </DashboardMetricCard>

        <DashboardMetricCard title="Active pipelines" icon={Workflow} iconVariant="muted">
          <DashboardStatValue className="mb-1">0</DashboardStatValue>
          <p className="text-xs text-slate-600">Open hiring pipelines currently in progress.</p>
        </DashboardMetricCard>
      </div>

      <DashboardSectionCard
        title="Pipeline"
        description="When candidates share proofs, you'll see status here without storing sensitive files."
      />
    </div>
  );
}
