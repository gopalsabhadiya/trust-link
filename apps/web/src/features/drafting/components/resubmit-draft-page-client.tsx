"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { CaseEditPayloadDTO } from "@trustlink/shared";
import { fetchCaseEditPayload } from "../api/drafts-api";
import { DashboardPageHeader } from "@/components/brand";
import { ExperienceLetterDraftForm, type ExperienceDraftFormValues } from "./experience-letter-draft-form";

function payloadToFormValues(p: CaseEditPayloadDTO): ExperienceDraftFormValues {
  const c = p.content;
  return {
    employeeName: c.employeeName,
    designation: c.designation,
    joiningDate: c.joiningDate,
    relievingDate: c.relievingDate,
    keyAchievements:
      c.keyAchievements.length > 0
        ? c.keyAchievements.map((v) => ({ value: v }))
        : [{ value: "" }],
    companyName: c.companyName,
    hrSignatoryName: c.hrSignatoryName,
    hrEmail: "",
  };
}

export function ResubmitDraftPageClient() {
  const params = useParams();
  const caseId = typeof params.caseId === "string" ? params.caseId : "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["drafts", "case-edit", caseId],
    queryFn: () => fetchCaseEditPayload(caseId),
    enabled: Boolean(caseId),
  });

  const initialValues = useMemo(
    () => (data ? payloadToFormValues(data) : null),
    [data]
  );

  if (!caseId) {
    return <p className="text-sm text-slate-600">Invalid case.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading draft...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        Could not load this draft for editing. It may no longer be open for resubmission.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Update your draft"
        description="Address HR feedback, confirm the HR email for notifications, and resubmit for review."
      />
      <ExperienceLetterDraftForm
        mode="resubmit"
        caseId={caseId}
        initialValues={initialValues}
        hrFeedback={data.hrFeedback}
      />
    </div>
  );
}
