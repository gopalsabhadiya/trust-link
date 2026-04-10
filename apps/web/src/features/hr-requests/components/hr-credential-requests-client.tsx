"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CredentialStatus, HrCredentialRequestItemDTO } from "@trustlink/shared";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { submitHrReviewByCaseId } from "@/features/drafting/api/drafts-api";
import { useHrCredentialRequestsQuery } from "../hooks/use-hr-credential-requests";
import {
  HR_NEW_REQUEST_WINDOW_EVENT,
  type HrNewRequestWindowEvent,
} from "../lib/hr-realtime-window-event";
import { cn } from "@/lib/utils";

const HIGHLIGHT_MS = 6500;

function statusLabel(status: CredentialStatus): string {
  switch (status) {
    case "DRAFT_SUBMITTED":
      return "Submitted";
    case "HR_REVIEWING":
    case "HR_APPROVED":
      return "Under Review";
    case "REVISIONS_REQUIRED":
      return "Revision Requested";
    default:
      return status;
  }
}

function StatusBadge({
  status,
  showNew,
}: {
  status: CredentialStatus;
  showNew?: boolean;
}) {
  const label = statusLabel(status);
  const reviewing = status === "HR_REVIEWING" || status === "HR_APPROVED";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="outline"
        className={cn(
          "rounded-md font-medium",
          reviewing && "border-slate-300 bg-slate-50 text-slate-500",
          status === "DRAFT_SUBMITTED" && "border-slate-200 text-slate-700",
          status === "REVISIONS_REQUIRED" && "border-amber-200 bg-amber-50 text-amber-800"
        )}
      >
        {label}
      </Badge>
      {showNew ? (
        <Badge className="rounded-md border-transparent bg-[var(--color-brand-blue)] px-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition-opacity duration-300 ease-sidebar">
          New
        </Badge>
      ) : null}
    </div>
  );
}

function canQuickApprove(status: CredentialStatus): boolean {
  return (
    status === "DRAFT_SUBMITTED" ||
    status === "HR_REVIEWING" ||
    status === "HR_APPROVED"
  );
}

function useQuickApprove(caseId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => submitHrReviewByCaseId(caseId, { action: "APPROVE" }),
    onSuccess: async (result) => {
      toast.success("Credential approved and digitally signed.");
      await queryClient.invalidateQueries({ queryKey: ["hr-credential-requests"] });
      if (result.status === "ISSUED") {
        router.push(`/dashboard/issued/${result.id}`);
      }
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not approve"),
  });
}

function CandidateCell({ row }: { row: HrCredentialRequestItemDTO }) {
  const initials = row.candidateName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-3">
      {row.profilePicture ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote OAuth URLs; avoid image domain config
        <img
          src={row.profilePicture}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
          width={40}
          height={40}
        />
      ) : (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
          aria-hidden
        >
          {initials || "—"}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{row.candidateName}</p>
        <p className="truncate text-sm text-slate-600">{row.designation}</p>
        <p className="truncate text-xs text-slate-500">{row.companyName}</p>
      </div>
    </div>
  );
}

function ActionButtons({ row }: { row: HrCredentialRequestItemDTO }) {
  const approveMutation = useQuickApprove(row.caseId);
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href={`/dashboard/hr/requests/${row.caseId}`}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-md border-slate-200 no-underline"
        )}
      >
        Open review
      </Link>
      <Button
        size="sm"
        className="rounded-md bg-brand-blue text-white hover:bg-brand-blue/90"
        disabled={!canQuickApprove(row.status) || approveMutation.isPending}
        onClick={() => approveMutation.mutate()}
      >
        {approveMutation.isPending ? "Approving…" : "Quick approve"}
      </Button>
    </div>
  );
}

function MobileCard({
  row,
  isHighlighted,
}: {
  row: HrCredentialRequestItemDTO;
  isHighlighted: boolean;
}) {
  return (
    <article
      className={cn(
        "space-y-3 p-4",
        isHighlighted && "animate-hr-request-row-new"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={row.status} showNew={isHighlighted} />
        <span className="text-xs text-slate-500">
          {new Date(row.dateReceived).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <CandidateCell row={row} />
      <ActionButtons row={row} />
    </article>
  );
}

export function HrCredentialRequestsClient() {
  const { data, isPending, isError, error, refetch } = useHrCredentialRequestsQuery(true);
  const highlightedRef = useRef(new Set<string>());
  const [, setHighlightBump] = useState(0);

  const markHighlighted = useCallback((caseId: string) => {
    highlightedRef.current.add(caseId);
    setHighlightBump((n) => n + 1);
    window.setTimeout(() => {
      highlightedRef.current.delete(caseId);
      setHighlightBump((n) => n + 1);
    }, HIGHLIGHT_MS);
  }, []);

  useEffect(() => {
    const onIncoming = (e: Event) => {
      const detail = (e as HrNewRequestWindowEvent).detail;
      if (detail?.caseId) markHighlighted(detail.caseId);
    };
    window.addEventListener(HR_NEW_REQUEST_WINDOW_EVENT, onIncoming);
    return () => window.removeEventListener(HR_NEW_REQUEST_WINDOW_EVENT, onIncoming);
  }, [markHighlighted]);

  const isRowNew = (caseId: string) => highlightedRef.current.has(caseId);

  if (isPending) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">
        Loading credential requests…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error instanceof Error ? error.message : "Could not load requests."}
        <Button
          variant="outline"
          size="sm"
          className="ml-3 mt-2 rounded-md"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const requests = data?.requests ?? [];

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <p className="text-slate-600">
          All caught up! No pending credential requests at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100 sm:hidden">
        {requests.map((row) => (
          <MobileCard
            key={row.caseId}
            row={row}
            isHighlighted={isRowNew(row.caseId)}
          />
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Candidate</th>
              <th className="py-3 pr-4">Status</th>
              <th className="hidden py-3 pr-4 md:table-cell">Received</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {requests.map((row) => (
              <tr
                key={row.caseId}
                className={cn(
                  "border-b border-slate-100 last:border-0",
                  isRowNew(row.caseId) && "animate-hr-request-row-new"
                )}
              >
                <td className="px-4 py-3 pr-4 align-middle">
                  <CandidateCell row={row} />
                </td>
                <td className="py-3 pr-4 align-middle">
                  <StatusBadge status={row.status} showNew={isRowNew(row.caseId)} />
                </td>
                <td className="hidden py-3 pr-4 align-middle text-slate-600 md:table-cell">
                  {new Date(row.dateReceived).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 align-middle">
                  <ActionButtons row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
