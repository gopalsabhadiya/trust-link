"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ERROR_CODES } from "@trustlink/shared";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TrustLinkLogoMark } from "@/components/brand";
import { CredentialPreview } from "./credential-preview";
import { DraftRequestError } from "../api/drafts-api";
import { useDraftReview, useDraftReviewAction } from "../hooks/use-draft-review";
import { cn } from "@/lib/utils";

export function ReviewDraftClient({
  token,
  caseId,
  embedded = false,
}: {
  token?: string;
  caseId?: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);

  const hasToken = Boolean(token?.length);
  const hasCaseId = Boolean(caseId?.length);
  const sourceValid = (hasToken && !hasCaseId) || (!hasToken && hasCaseId);
  const source = hasToken ? { token: token! } : { caseId: caseId! };
  const reviewQuery = useDraftReview(source, sourceValid);
  const actionMutation = useDraftReviewAction(source, sourceValid);

  if (!sourceValid) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Missing review parameters.
      </div>
    );
  }

  const effectiveStatus = optimisticStatus ?? reviewQuery.data?.status ?? null;
  const isFinal =
    effectiveStatus === "ISSUED" || effectiveStatus === "REVISIONS_REQUIRED";

  const previewData = useMemo(
    () => reviewQuery.data?.content,
    [reviewQuery.data?.content]
  );

  if (reviewQuery.isLoading) {
    return (
      <div className={cn(!embedded && "mx-auto max-w-5xl p-6")}>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">
          Loading secure review...
        </div>
      </div>
    );
  }

  const reviewErr = reviewQuery.error;
  if (reviewQuery.isError && reviewErr instanceof DraftRequestError) {
    if (reviewErr.errorCode === ERROR_CODES.REVIEW_EMAIL_MISMATCH) {
      return (
        <AccessDeniedEmailState
          token={token}
          masked={reviewErr.meta?.invitedEmailMasked}
          embedded={embedded}
        />
      );
    }
    if (reviewErr.errorCode === ERROR_CODES.LEGACY_REVIEW_INVITATION) {
      return <LegacyReviewInvitationState embedded={embedded} />;
    }
  }

  if (reviewQuery.isError || !reviewQuery.data || !previewData) {
    return <ExpiredReviewState embedded={embedded} />;
  }

  const employeeName = previewData.employeeName || "the employee";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-5",
        embedded ? "p-0" : "mx-auto max-w-6xl p-4 md:p-6"
      )}
    >
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TrustLinkLogoMark />
            <div>
              <p className="text-sm font-semibold text-slate-800">Secure Review</p>
              <p className="text-xs text-slate-600">
                You are reviewing a draft requested by {employeeName}. Your approval will
                digitally sign this document.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="rounded-md border-brand-blue-subtle text-brand-blue">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            HR-verified session
          </Badge>
        </div>
      </div>

      <CredentialPreview value={previewData} />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">One-click review action</p>
        {isFinal && (
          <p className="mb-3 text-sm text-slate-600">
            This review is already completed with status <strong>{effectiveStatus}</strong>.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-md bg-brand-blue text-white hover:bg-brand-blue/90"
            disabled={actionMutation.isPending || isFinal}
            onClick={async () => {
              setOptimisticStatus("ISSUED");
              try {
                const result = await actionMutation.mutateAsync({ action: "APPROVE" });
                toast.success("Draft approved and digitally signed.");
                if (caseId) {
                  void queryClient.invalidateQueries({ queryKey: ["hr-credential-requests"] });
                }
                if (result.status === "ISSUED") {
                  router.push(`/dashboard/issued/${result.id}`);
                }
              } catch (error) {
                setOptimisticStatus(null);
                const message =
                  error instanceof Error ? error.message : "Could not complete approval";
                toast.error(message);
              }
            }}
          >
            {actionMutation.isPending && optimisticStatus === "ISSUED"
              ? "Approving..."
              : "Approve"}
          </Button>
          <Button
            variant="outline"
            className="rounded-md border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
            disabled={actionMutation.isPending || isFinal}
            onClick={() => setRevisionOpen((v) => !v)}
          >
            Request Revision
          </Button>
        </div>

        {revisionOpen && !isFinal && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="feedback">Revision feedback</Label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-blue focus:outline-none"
              placeholder="Example: Change the end date to the 15th."
            />
            <Button
              variant="outline"
              className="rounded-md"
              disabled={actionMutation.isPending}
              onClick={async () => {
                const trimmed = feedback.trim();
                if (!trimmed) {
                  toast.error("Please provide feedback before requesting revision.");
                  return;
                }
                setOptimisticStatus("REVISIONS_REQUIRED");
                try {
                  await actionMutation.mutateAsync({
                    action: "REQUEST_REVISION",
                    hrFeedback: trimmed,
                  });
                  toast.success("Revision request sent to candidate.");
                  if (caseId) {
                    void queryClient.invalidateQueries({ queryKey: ["hr-credential-requests"] });
                  }
                } catch (error) {
                  setOptimisticStatus(null);
                  const message =
                    error instanceof Error
                      ? error.message
                      : "Could not submit revision request";
                  toast.error(message);
                }
              }}
            >
              {actionMutation.isPending && optimisticStatus === "REVISIONS_REQUIRED"
                ? "Sending..."
                : "Send Revision Request"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AccessDeniedEmailState({
  token,
  masked,
  embedded,
}: {
  token?: string;
  masked?: string;
  embedded?: boolean;
}) {
  const reviewPath = token ? `/review/${token}` : "/dashboard/hr/requests";
  const inner = (
    <>
      <div className="mb-4 flex items-center justify-center">
        <TrustLinkLogoMark />
      </div>
      <h1 className="text-xl font-semibold text-slate-800">Access denied</h1>
      <p className="mt-2 text-sm text-slate-600">
        This review is restricted to{" "}
        <strong className="font-medium text-slate-800">
          {masked ?? "the invited HR email"}
        </strong>
        . Sign in with the TrustLink account that uses that address, or ask the candidate to
        update the HR contact on their draft.
      </p>
      <Link
        href={
          embedded || !token
            ? "/dashboard/hr/requests"
            : `/login?callbackUrl=${encodeURIComponent(reviewPath)}`
        }
        className={cn(
          buttonVariants(),
          "mt-6 inline-flex rounded-md bg-brand-blue text-white hover:bg-brand-blue/90 no-underline"
        )}
      >
        {embedded || !token ? "Back to requests" : "Switch account"}
      </Link>
    </>
  );

  if (embedded) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">{inner}</div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center">
        {inner}
      </div>
    </main>
  );
}

function LegacyReviewInvitationState({ embedded }: { embedded?: boolean }) {
  const inner = (
    <>
      <div className="mb-4 flex items-center justify-center">
        <TrustLinkLogoMark />
      </div>
      <h1 className="text-xl font-semibold text-slate-800">Invitation needs refresh</h1>
      <p className="mt-2 text-sm text-slate-600">
        This review link was issued before secure HR sign-in was required. Ask the candidate to
        resubmit the draft or send you a new HR review link from their TrustLink dashboard.
      </p>
    </>
  );
  if (embedded) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">{inner}</div>
    );
  }
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center">
        {inner}
      </div>
    </main>
  );
}

function ExpiredReviewState({ embedded }: { embedded?: boolean }) {
  const inner = (
    <>
      <div className="mb-4 flex items-center justify-center">
        <TrustLinkLogoMark />
      </div>
      <h1 className="text-xl font-semibold text-slate-800">Review link unavailable</h1>
      <p className="mt-2 text-sm text-slate-600">
        This secure review link is invalid, expired, or has already been completed.
      </p>
    </>
  );
  if (embedded) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">{inner}</div>
    );
  }
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center">
        {inner}
      </div>
    </main>
  );
}
