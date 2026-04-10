import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReviewDraftClient } from "@/features/drafting/components/review-draft-client";

export const metadata: Metadata = {
  title: "Review credential — TrustLink",
};

export default async function HrCaseReviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link
        href="/dashboard/hr/requests"
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back to requests
      </Link>
      <ReviewDraftClient caseId={caseId} embedded />
    </div>
  );
}
