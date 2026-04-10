import type { CaseEditPayloadDTO } from "@trustlink/shared";
import type { ExperienceDraftFormValues } from "../components/experience-letter-draft-form";

export function caseEditPayloadToFormValues(p: CaseEditPayloadDTO): ExperienceDraftFormValues {
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
    awards: (c.awards ?? []).map((v) => ({ value: v })),
    companyName: c.companyName,
    hrSignatoryName: c.hrSignatoryName,
    hrEmail: "",
    dpdpConsent: false,
  };
}
