"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CandidateExperienceCaseDTO, ExperienceUiStatus } from "@trustlink/shared";
import { caseActivityTimestamp, compareExperienceCases } from "@trustlink/shared";
import {
  Check,
  ClipboardCopy,
  Download,
  ExternalLink,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { downloadIssuedCredentialPdf } from "@/lib/download-issued-pdf";
import { cn } from "@/lib/utils";
import { fetchIssuedCredential, regenerateReviewLink } from "../api/drafts-api";

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

function TimelineNodeCreate() {
  return (
    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-400 bg-white text-slate-500 ring-4 ring-white">
      <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
    </div>
  );
}

function TimelineNodeIssued() {
  return (
    <div
      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-sm ring-4 ring-white"
      aria-hidden
    >
      <Check className="h-5 w-5" strokeWidth={2.5} />
    </div>
  );
}

function TimelineNodeInProgress({ pulse }: { pulse: boolean }) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--color-brand-blue)] bg-white ring-4 ring-white",
        pulse && "shadow-[0_0_0_3px_rgb(37_99_235_/_0.22)]"
      )}
      aria-hidden
    />
  );
}

type JourneyRow =
  | { kind: "year"; year: number }
  | { kind: "case"; item: CandidateExperienceCaseDTO };

function buildJourneyRows(cases: CandidateExperienceCaseDTO[]): JourneyRow[] {
  const sorted = [...cases].sort(compareExperienceCases);
  const rows: JourneyRow[] = [];
  let lastYear: number | null = null;
  for (const item of sorted) {
    const ts = caseActivityTimestamp(item);
    const year = ts > 0 ? new Date(ts).getFullYear() : new Date().getFullYear();
    if (lastYear !== year) {
      rows.push({ kind: "year", year });
      lastYear = year;
    }
    rows.push({ kind: "case", item });
  }
  return rows;
}

function JourneyCaseCard({
  item,
  onResumeEdit,
}: {
  item: CandidateExperienceCaseDTO;
  onResumeEdit: (caseId: string) => void;
}) {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const isIssued = item.uiStatus === "ISSUED";
  const inProgress = !isIssued;

  const regenerate = useMutation({
    mutationFn: () => regenerateReviewLink(item.caseId),
    onSuccess: async (data) => {
      try {
        await navigator.clipboard.writeText(data.reviewUrl);
        toast.success("Fresh HR review link copied. The previous link no longer works.");
      } catch {
        toast.success("New review link ready.", { description: data.reviewUrl });
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
    <div
      className={cn(
        "min-w-0 flex-1 rounded-lg border border-slate-200 p-4 shadow-sm transition",
        "bg-slate-50 md:bg-white",
        inProgress && "border-l-4 border-l-[var(--color-brand-blue)] md:border-l-[var(--color-brand-blue)]"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{item.companyName}</h3>
          {item.designation ? (
            <p className="text-sm font-medium text-slate-700">{item.designation}</p>
          ) : null}
          {item.employeeName ? (
            <p className="text-sm text-slate-600">{item.employeeName}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
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

      {inProgress && item.uiStatus === "HR_REVIEWING" ? (
        <p className="mt-1 text-xs text-amber-800">Awaiting action from your HR contact.</p>
      ) : null}
      {inProgress && item.uiStatus === "SUBMITTED" ? (
        <p className="mt-1 text-xs text-slate-600">HR review link active — share or copy below if needed.</p>
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
          <Button
            type="button"
            size="sm"
            className="rounded-md bg-brand-blue text-white hover:bg-brand-blue/90"
            onClick={() => onResumeEdit(item.caseId)}
          >
            Resume editing
          </Button>
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

export function ExperienceJourneyFeed({
  cases,
  onOpenCreate,
  onResumeEdit,
  emptyIllustration,
}: {
  cases: CandidateExperienceCaseDTO[];
  onOpenCreate: () => void;
  onResumeEdit: (caseId: string) => void;
  emptyIllustration?: ReactNode;
}) {
  const rows = useMemo(() => buildJourneyRows(cases), [cases]);
  const hasCases = cases.length > 0;
  const caseRowIndices = rows
    .map((r, i) => (r.kind === "case" ? i : -1))
    .filter((i) => i >= 0);
  const lastCaseRowIndex = caseRowIndices.length > 0 ? caseRowIndices[caseRowIndices.length - 1] : -1;

  return (
    <div className="relative">
      {/* Single vertical axis (behind nodes) */}
      <div
        className="pointer-events-none absolute bottom-8 left-5 top-5 w-0.5 -translate-x-1/2 bg-slate-200 md:left-6"
        aria-hidden
      />

      <div className="relative space-y-0">
        {/* Create row — always first */}
        <div className="relative flex gap-3 pb-8 md:gap-4">
          <div className="relative z-[1] flex w-10 shrink-0 justify-center md:w-12">
            <TimelineNodeCreate />
          </div>
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex min-h-[140px] min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-[var(--color-brand-blue)] hover:bg-brand-blue-subtle md:min-h-[160px]"
          >
            <span className="text-sm font-semibold text-slate-800">Create new draft</span>
            <span className="max-w-sm text-xs text-slate-500">
              Start an experience letter and send a secure link to your HR team for review.
            </span>
          </button>
        </div>

        {rows.map((row, idx) => {
          if (row.kind === "year") {
            return (
              <div
                key={`year-${row.year}-${idx}`}
                className="relative z-[1] flex gap-3 pb-3 md:gap-4"
              >
                <div className="flex w-10 shrink-0 justify-center md:w-12">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 ring-4 ring-white">
                    {row.year}
                  </span>
                </div>
                <div className="min-w-0 flex-1" />
              </div>
            );
          }

          const item = row.item;
          const isIssued = item.uiStatus === "ISSUED";
          const pulse = item.uiStatus === "HR_REVIEWING" || item.uiStatus === "SUBMITTED";
          const isLastCase = idx === lastCaseRowIndex;

          return (
            <div
              key={item.caseId}
              className={cn("relative flex gap-3 md:gap-4", isLastCase ? "pb-0" : "pb-8")}
            >
              <div className="relative z-[1] flex w-10 shrink-0 justify-center md:w-12">
                {isIssued ? <TimelineNodeIssued /> : <TimelineNodeInProgress pulse={pulse} />}
              </div>
              <JourneyCaseCard item={item} onResumeEdit={onResumeEdit} />
            </div>
          );
        })}

        {!hasCases && emptyIllustration ? (
          <div className="relative z-[1] border-t border-slate-100 pt-10">{emptyIllustration}</div>
        ) : null}
      </div>
    </div>
  );
}
