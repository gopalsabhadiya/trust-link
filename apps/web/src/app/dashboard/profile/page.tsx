import { DashboardPageHeader, DashboardSectionCard } from "@/components/brand";

export default function DashboardProfilePage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Profile"
        description="Manage your professional identity details in TrustLink."
      />

      <DashboardSectionCard
        title="Public profile"
        description="Your profile data is used to issue and verify credentials."
      >
        <p className="text-slate-800">
          Profile editing tools will be available soon. Your current role and identity are
          synced from your secure account record.
        </p>
      </DashboardSectionCard>
    </div>
  );
}
