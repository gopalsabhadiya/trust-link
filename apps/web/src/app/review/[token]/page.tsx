import type { Metadata } from "next";
import { ReviewAccessGate } from "@/features/drafting/components/review-access-gate";
import { ReviewDraftClient } from "@/features/drafting/components/review-draft-client";

export const metadata: Metadata = {
  title: "Secure Draft Review — TrustLink",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ReviewDraftPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <ReviewAccessGate token={token}>
      <ReviewDraftClient token={token} />
    </ReviewAccessGate>
  );
}
