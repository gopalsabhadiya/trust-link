import { DashboardPageHeader } from "@/components/brand";
import { ExperienceLetterDraftForm } from "@/features/drafting/components/experience-letter-draft-form";

export default function DraftExperienceLetterPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Draft Experience Letter"
        description="Draft your experience letter and preview it in real-time before HR review."
      />
      <ExperienceLetterDraftForm />
    </div>
  );
}
