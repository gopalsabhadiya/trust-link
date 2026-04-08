import { DashboardPageHeader, DashboardSectionCard } from "@/components/brand";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Settings"
        description="Configure your account preferences and security posture."
      />

      <DashboardSectionCard
        title="Account settings"
        description="Control notifications, consent, and organization preferences."
      >
        <p className="text-slate-800">
          Settings controls are coming soon. Critical auth controls like logout are already
          available from the user menu.
        </p>
      </DashboardSectionCard>
    </div>
  );
}
