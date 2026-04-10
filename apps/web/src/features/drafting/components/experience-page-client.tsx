"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CandidateExperienceCaseDTO, ExperienceUiStatus } from "@trustlink/shared";
import {
  CheckCircle2,
  ClipboardCopy,
  Download,
  ExternalLink,
  FileEdit,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  BrandProgressBar,
  DashboardPageHeader,
  DashboardSectionCard,
} from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { downloadIssuedCredentialPdf } from "@/lib/download-issued-pdf";
import { cn } from "@/lib/utils";
import { fetchIssuedCredential, regenerateReviewLink } from "../api/drafts-api";
import { useCandidateExperienceQuery } from "../hooks/use-candidate-experience";

function uiStatusLabel(status: ExperienceUiStatus): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "HR_REVIEWING":
      return "HR reviewing";
    case "REVISIONS_REQUIRED":
      return "Revisions required";
    case "ISSUED":
      return "Issued";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

function uiStatusBadgeClass(status: ExperienceUiStatus): string {
  switch (status) {
    case "DRAFT":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "SUBMITTED":
      return "border-blue-100 bg-blue-50 text-blue-800";
    case "HR_REVIEWING":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "REVISIONS_REQUIRED":
      return "border-red-200 bg-red-50 text-red-800";
    case "ISSUED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "REJECTED":
      return "border-slate-300 bg-slate-100 text-slate-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function CaseCard({ item }: { item: CandidateExperienceCaseDTO }) {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const regenerate = useMutation({
    mutationFn: () => regenerateReviewLink(item.caseId),
    onSuccess: async (data) => {
      try {
        await navigator.clipboard.writeText(data.reviewUrl);
        toast.success("Fresh HR review link copied. The previous link no longer works.");
      } catch {
        toast.success("New review link ready.", {
          description: data.reviewUrl,
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["candidate", "experience"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not refresh link"),
  });

  const verifyBase = typeof window !== "undefined" ? window.location.origin : "";

  const onDownload = async () => {
    if (!item.canDownloadPdf) return;
    try {
      setDownloadingId(item.caseId);
      const credential = await fetchIssuedCredential(item.caseId);
      const verifyLink = `${verifyBase}/verify/${credential.credentialHash}`;
      await downloadIssuedCredentialPdf(credential, verifyLink);
      toast.success("PDF downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{item.companyName}</h3>
          {item.employeeName ? (
            <p className="text-sm text-slate-600">{item.employeeName}</p>
          ) : null}
          {item.designation ? (
            <p className="text-xs text-slate-500">{item.designation}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
            uiStatusBadgeClass(item.uiStatus)
          )}
        >
          {uiStatusLabel(item.uiStatus)}
        </span>
      </div>

      {item.joiningDate && item.relievingDate ? (
        <p className="mt-2 text-xs text-slate-500">
          Tenure: {item.joiningDate} – {item.relievingDate}
        </p>
      ) : null}

      {item.tokenExpiresAt && item.canCopyMagicLink ? (
        <p className="mt-1 text-xs text-slate-500">
          Link expires {new Date(item.tokenExpiresAt).toLocaleString()}
        </p>
      ) : null}

      {item.hrFeedback &&
      (item.uiStatus === "REVISIONS_REQUIRED" || item.uiStatus === "REJECTED") ? (
        <p className="mt-2 line-clamp-3 rounded-md bg-amber-50 p-2 text-xs text-amber-950">
          {item.hrFeedback}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.canEdit ? (
          <Link
            href={`/dashboard/drafts/edit/${item.caseId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-md")}
          >
            <FileEdit className="mr-1.5 h-3.5 w-3.5" />
            Edit & resubmit
          </Link>
        ) : null}

        {item.canCopyMagicLink ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md"
            disabled={regenerate.isPending}
            title="Creates a fresh review link and copies it. Any previous HR link for this case will stop working."
            onClick={() => regenerate.mutate()}
          >
            {regenerate.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <ClipboardCopy className="mr-1.5 h-3.5 w-3.5" />
            )}
            Copy HR review link
          </Button>
        ) : null}

        {item.canViewIssued ? (
          <Link
            href={`/dashboard/issued/${item.caseId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-md")}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            View issued
          </Link>
        ) : null}

        {item.canDownloadPdf ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md"
            disabled={downloadingId === item.caseId}
            onClick={() => void onDownload()}
          >
            {downloadingId === item.caseId ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Download PDF
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ExperiencePageClient() {
  const { data, isLoading, isError, refetch, isFetching } = useCandidateExperienceQuery();

  if (isLoading && !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your experience…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-800">
        <p>We could not load your experience data.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const { summary, cases, timeline } = data;
  const total = summary.verifiedCredentialCount + summary.pendingCredentialCount;
  const verifiedRatio = total > 0 ? Math.round((summary.verifiedCredentialCount / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <DashboardPageHeader
          title="Experience"
          description="Track every experience letter from draft through issuance. Copy HR links, resubmit after feedback, and download issued credentials."
        />
        {isFetching ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating…
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardSectionCard title="Verified credentials" description="Ready to share or verify.">
          <p className="text-3xl font-semibold text-emerald-700">
            {summary.verifiedCredentialCount}
          </p>
        </DashboardSectionCard>
        <DashboardSectionCard title="In progress" description="Draft, review, or pending issuance.">
          <p className="text-3xl font-semibold text-[var(--color-brand-blue)]">
            {summary.pendingCredentialCount}
          </p>
        </DashboardSectionCard>
      </div>

      {total > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Credential progress
          </p>
          <BrandProgressBar value={verifiedRatio} className="mt-2" />
          <p className="mt-1 text-xs text-slate-600">
            {verifiedRatio}% of tracked cases are verified ({summary.verifiedCredentialCount} of{" "}
            {total})
          </p>
        </div>
      ) : null}

      <DashboardSectionCard
        title="Your cases"
        description="Each row is one employer credential journey."
      >
        {cases.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-6 text-center sm:items-center sm:text-center">
            <p className="max-w-md text-sm text-slate-600">
              You do not have any experience letters yet. Start a draft to request verification from
              your HR team.
            </p>
            <Link
              href="/dashboard/drafts/new"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "rounded-md bg-brand-blue hover:bg-brand-blue/90"
              )}
            >
              Start experience letter draft
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cases.map((c) => (
              <CaseCard key={c.caseId} item={c} />
            ))}
          </div>
        )}
      </DashboardSectionCard>

      {timeline.length > 0 ? (
        <DashboardSectionCard
          title="Timeline"
          description="Verified and in-progress employment credentials."
        >
          <ul className="space-y-3">
            {timeline.map((t) => (
              <li
                key={`${t.caseId}-${t.kind}`}
                className="flex flex-wrap items-start gap-3 rounded-md border border-slate-100 bg-white p-3"
              >
                {t.kind === "verified" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Badge variant="outline" className="shrink-0 border-amber-200 text-amber-900">
                    Pending
                  </Badge>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{t.companyName}</p>
                  <p className="text-sm text-slate-600">{t.employeeName}</p>
                  <p className="text-xs text-slate-500">{t.tenureLabel}</p>
                  {t.issuedAt ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Issued {new Date(t.issuedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </DashboardSectionCard>
      ) : null}
    </div>
  );
}
