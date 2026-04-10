import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ExperiencePageClient } from "@/features/drafting/components/experience-page-client";

function ExperienceFallback() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Loading experience…
    </div>
  );
}

export default function CandidateExperiencePage() {
  return (
    <Suspense fallback={<ExperienceFallback />}>
      <ExperiencePageClient />
    </Suspense>
  );
}
