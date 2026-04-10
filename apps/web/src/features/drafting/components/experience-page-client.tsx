"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2 } from "lucide-react";
import {
  BrandProgressBar,
  DashboardPageHeader,
  DashboardSectionCard,
} from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { fetchCaseEditPayload } from "../api/drafts-api";
import { useCandidateExperienceQuery } from "../hooks/use-candidate-experience";
import { caseEditPayloadToFormValues } from "../utils/case-edit-payload-to-form";
import { ExperienceJourneyFeed } from "./experience-journey-feed";
import { ExperienceLetterDraftForm } from "./experience-letter-draft-form";

export function ExperiencePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useCandidateExperienceQuery();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "resubmit">("create");
  const [editCaseId, setEditCaseId] = useState<string | null>(null);
  const [sheetView, setSheetView] = useState<"edit" | "preview">("edit");
  const [formDirty, setFormDirty] = useState(false);

  const openCreateSheet = useCallback(() => {
    setSheetMode("create");
    setEditCaseId(null);
    setSheetView("edit");
    setSheetOpen(true);
  }, []);

  const openEditSheet = useCallback((caseId: string) => {
    setSheetMode("resubmit");
    setEditCaseId(caseId);
    setSheetView("edit");
    setSheetOpen(true);
  }, []);

  useEffect(() => {
    const newQ = searchParams.get("new");
    const editQ = searchParams.get("edit");
    if (newQ === "1") {
      openCreateSheet();
      router.replace("/dashboard/experience", { scroll: false });
    }
    if (editQ) {
      openEditSheet(editQ);
      router.replace("/dashboard/experience", { scroll: false });
    }
  }, [searchParams, router, openCreateSheet, openEditSheet]);

  const editQuery = useQuery({
    queryKey: ["drafts", "case-edit", editCaseId],
    queryFn: () => fetchCaseEditPayload(editCaseId!),
    enabled: Boolean(sheetOpen && sheetMode === "resubmit" && editCaseId),
  });

  /** Stable reference so the draft form does not reset on every parent re-render (e.g. dirty-state updates). */
  const resubmitFormDefaults = useMemo(() => {
    if (sheetMode !== "resubmit" || !editQuery.data) return null;
    return caseEditPayloadToFormValues(editQuery.data);
  }, [sheetMode, editQuery.data]);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setSheetOpen(true);
        return;
      }
      if (formDirty && typeof window !== "undefined" && !window.confirm("Discard your changes?")) {
        return;
      }
      setSheetOpen(false);
      setSheetMode("create");
      setEditCaseId(null);
      setSheetView("edit");
      setFormDirty(false);
    },
    [formDirty]
  );

  const handleDraftSuccess = useCallback(() => {
    setSheetOpen(false);
    setFormDirty(false);
    setSheetMode("create");
    setEditCaseId(null);
    setSheetView("edit");
    void queryClient.invalidateQueries({ queryKey: ["candidate", "experience"] });
  }, [queryClient]);

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

  const { summary, cases } = data;
  const total = summary.verifiedCredentialCount + summary.pendingCredentialCount;
  const verifiedRatio = total > 0 ? Math.round((summary.verifiedCredentialCount / total) * 100) : 0;

  const showResubmitForm =
    sheetMode === "resubmit" && editQuery.data && !editQuery.isLoading && !editQuery.isError;

  const emptyIllustration = (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <ClipboardList className="h-12 w-12" strokeWidth={1.25} aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <p className="text-heading-dashboard text-base">No journeys yet</p>
        <p className="text-sm text-slate-600">
          Use <strong className="font-medium text-slate-800">Create new draft</strong> above to
          request your first verifiable experience letter from HR.
        </p>
      </div>
      <Button
        type="button"
        className="rounded-md bg-brand-blue px-6 text-white hover:bg-brand-blue/90"
        onClick={openCreateSheet}
      >
        Add new experience
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <DashboardPageHeader
          title="Experience"
          description="Follow one journey from draft through HR review to a verified credential. In-progress steps stay at the top."
        />
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <Button
            type="button"
            className="rounded-md bg-brand-blue text-white hover:bg-brand-blue/90"
            onClick={openCreateSheet}
          >
            Add new experience
          </Button>
          {isFetching ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating…
            </span>
          ) : null}
        </div>
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
        title="Experience journey"
        description="Chronological feed: newest activity first. Green marks verified credentials; blue highlights work in progress."
      >
        <ExperienceJourneyFeed
          cases={cases}
          onOpenCreate={openCreateSheet}
          onResumeEdit={openEditSheet}
          emptyIllustration={emptyIllustration}
        />
      </DashboardSectionCard>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            "flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
          )}
        >
          <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 px-4 pb-4 pt-4 pr-14">
            <SheetHeader className="space-y-1 p-0">
              <SheetTitle>
                {sheetMode === "create" ? "New experience letter" : "Update your draft"}
              </SheetTitle>
              <SheetDescription>
                {sheetMode === "create"
                  ? "Complete the form and submit to generate an HR review link."
                  : "Address HR feedback, confirm the HR email, and resubmit for review."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={sheetView === "edit" ? "default" : "outline"}
                className={cn(
                  "rounded-md",
                  sheetView === "edit" && "bg-brand-blue hover:bg-brand-blue/90"
                )}
                onClick={() => setSheetView("edit")}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sheetView === "preview" ? "default" : "outline"}
                className={cn(
                  "rounded-md",
                  sheetView === "preview" && "bg-brand-blue hover:bg-brand-blue/90"
                )}
                onClick={() => setSheetView("preview")}
              >
                Preview
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {sheetMode === "resubmit" && editQuery.isLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading draft…
              </div>
            ) : null}
            {sheetMode === "resubmit" && editQuery.isError ? (
              <p className="py-6 text-sm text-red-600">
                Could not load this draft. It may no longer be open for editing.
              </p>
            ) : null}
            {(sheetMode === "create" || showResubmitForm) && (
              <ExperienceLetterDraftForm
                key={sheetMode === "create" ? "create" : editCaseId ?? "edit"}
                layout="sheet"
                sheetView={sheetView}
                mode={sheetMode}
                caseId={sheetMode === "resubmit" ? editCaseId ?? undefined : undefined}
                initialValues={resubmitFormDefaults}
                hrFeedback={sheetMode === "resubmit" ? editQuery.data?.hrFeedback ?? null : null}
                onSuccess={handleDraftSuccess}
                onDirtyChange={setFormDirty}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
