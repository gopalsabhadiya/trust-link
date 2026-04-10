"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExperienceLetterSchema, type ExperienceLetterInput } from "@trustlink/shared";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CredentialPreview } from "./credential-preview";
import { isDraftApiValidationError, useSubmitDraft } from "../hooks/use-submit-draft";
import { useResubmitDraft } from "../hooks/use-resubmit-draft";

const DEFAULT_VALUES: ExperienceLetterInput = {
  employeeName: "",
  designation: "",
  joiningDate: "",
  relievingDate: "",
  keyAchievements: [""],
  awards: [],
  companyName: "",
  hrSignatoryName: "",
};

const DraftFormSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required").max(255),
  designation: z.string().min(1, "Designation is required").max(255),
  joiningDate: z.string().min(1, "Joining date is required"),
  relievingDate: z.string().min(1, "Relieving date is required"),
  keyAchievements: z
    .array(z.object({ value: z.string().min(1, "Achievement cannot be empty").max(500) }))
    .min(1, "At least one key achievement is required"),
  awards: z
    .array(
      z.object({
        value: z.string().max(200, "Award must be 200 characters or less"),
      })
    )
    .max(20),
  companyName: z.string().min(1, "Company name is required").max(255),
  hrSignatoryName: z.string().min(1, "HR signatory name is required").max(255),
  hrEmail: z.string().trim().email("Valid HR email is required"),
});

export type ExperienceDraftFormValues = z.infer<typeof DraftFormSchema>;

const DEFAULT_FORM_VALUES: ExperienceDraftFormValues = {
  ...DEFAULT_VALUES,
  keyAchievements: [{ value: "" }],
  awards: [],
  hrEmail: "",
};

export function ExperienceLetterDraftForm({
  mode = "create",
  caseId,
  initialValues = null,
  hrFeedback = null,
  layout = "page",
  sheetView = "edit",
  onSuccess,
  onDirtyChange,
}: {
  mode?: "create" | "resubmit";
  caseId?: string;
  initialValues?: ExperienceDraftFormValues | null;
  hrFeedback?: string | null;
  layout?: "page" | "sheet";
  sheetView?: "edit" | "preview";
  onSuccess?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
} = {}) {
  const router = useRouter();
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const submitDraft = useSubmitDraft();
  const resubmitDraft = useResubmitDraft();
  const isSheet = layout === "sheet";
  const showForm = !isSheet || sheetView === "edit";
  const showPreview = !isSheet || sheetView === "preview";

  const {
    control,
    register,
    setError,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ExperienceDraftFormValues>({
    resolver: zodResolver(DraftFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  useEffect(() => {
    if (mode !== "resubmit" || !initialValues) return;
    reset(initialValues);
  }, [mode, initialValues, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({
    control,
    name: "keyAchievements",
  });

  const {
    fields: awardFields,
    append: appendAward,
    remove: removeAward,
  } = useFieldArray({
    control,
    name: "awards",
  });

  const watched = useWatch({ control });
  const deferredWatched = useDeferredValue(watched);
  const previewData = useMemo<ExperienceLetterInput>(
    () => ({
      ...DEFAULT_VALUES,
      ...deferredWatched,
      keyAchievements:
        deferredWatched?.keyAchievements && deferredWatched.keyAchievements.length > 0
          ? deferredWatched.keyAchievements.map((item) => item?.value ?? "")
          : [""],
      awards:
        deferredWatched?.awards?.map((a) => a?.value?.trim() ?? "").filter((s) => s.length > 0) ??
        [],
    }),
    [deferredWatched]
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      const normalizedPayload: ExperienceLetterInput = {
        employeeName: values.employeeName,
        designation: values.designation,
        joiningDate: values.joiningDate,
        relievingDate: values.relievingDate,
        keyAchievements: values.keyAchievements.map((item) => item.value),
        awards: (values.awards ?? [])
          .map((a) => a.value.trim())
          .filter((s) => s.length > 0),
        companyName: values.companyName,
        hrSignatoryName: values.hrSignatoryName,
      };
      const parsedPayload = ExperienceLetterSchema.parse(normalizedPayload);
      if (mode === "resubmit") {
        if (!caseId) {
          toast.error("Missing case. Please return to Experience and try again.");
          return;
        }
        await resubmitDraft.mutateAsync({
          caseId,
          payload: {
            content: parsedPayload,
            consentLogged: true,
            hrEmail: values.hrEmail,
          },
        });
        toast.success("Resubmitted. A fresh review link was sent to your HR contact.");
        if (onSuccess) onSuccess();
        else router.push("/dashboard/experience");
        return;
      }
      await submitDraft.mutateAsync({
        content: parsedPayload,
        consentLogged: true,
        hrEmail: values.hrEmail,
      });
      toast.success("Draft sent! We've generated a magic link for your HR.");
      onSuccess?.();
    } catch (error) {
      if (isDraftApiValidationError(error)) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          setError(field as keyof ExperienceDraftFormValues, { message });
        }
        toast.error(error.message);
        return;
      }
      toast.error(
        mode === "resubmit"
          ? "Could not resubmit. Please try again."
          : "Could not submit draft. Please try again."
      );
    }
  });

  const isSubmitting =
    mode === "resubmit" ? resubmitDraft.isPending : submitDraft.isPending;

  return (
    <div className="space-y-4">
      {!isSheet ? (
        <div className="flex gap-2 md:hidden">
          <Button
            type="button"
            variant={mobileView === "form" ? "default" : "outline"}
            className="flex-1 rounded-md"
            onClick={() => setMobileView("form")}
          >
            Form
          </Button>
          <Button
            type="button"
            variant={mobileView === "preview" ? "default" : "outline"}
            className="flex-1 rounded-md"
            onClick={() => setMobileView("preview")}
          >
            Preview
          </Button>
        </div>
      ) : null}

      <div
        className={cn(
          !isSheet && "grid gap-6 md:grid-cols-2",
          isSheet && "flex flex-col"
        )}
      >
        <form
          onSubmit={onSubmit}
          className={cn(
            "space-y-4",
            !isSheet && mobileView === "preview" && "hidden md:block",
            isSheet && !showForm && "hidden"
          )}
        >
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {mode === "resubmit" ? "Resubmit for HR review" : "Experience Letter Draft"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {mode === "resubmit"
                ? "Update your letter and confirm your HR contact email. A new review link will be issued."
                : "Fill all fields and submit for HR review."}
            </p>
          </div>

          {mode === "resubmit" && hrFeedback ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <p className="font-medium">HR feedback</p>
              <p className="mt-1 whitespace-pre-wrap text-amber-900/90">{hrFeedback}</p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="employeeName">Employee Name</Label>
            <Input id="employeeName" {...register("employeeName")} />
            {errors.employeeName && (
              <p className="text-sm text-red-500">{errors.employeeName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...register("designation")} />
            {errors.designation && (
              <p className="text-sm text-red-500">{errors.designation.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input id="joiningDate" type="date" {...register("joiningDate")} />
              {errors.joiningDate && (
                <p className="text-sm text-red-500">{errors.joiningDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="relievingDate">Relieving Date</Label>
              <Input id="relievingDate" type="date" {...register("relievingDate")} />
              {errors.relievingDate && (
                <p className="text-sm text-red-500">{errors.relievingDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Key Achievements</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={() => appendAchievement({ value: "" })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {achievementFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input {...register(`keyAchievements.${index}.value` as const)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-md text-slate-500 hover:text-red-500"
                  onClick={() => removeAchievement(index)}
                  disabled={achievementFields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {typeof errors.keyAchievements?.message === "string" && (
              <p className="text-sm text-red-500">{errors.keyAchievements.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Awards &amp; Recognitions</Label>
                <p className="mt-0.5 text-xs text-slate-500">Optional. Leave empty or add as many as you need (max 20).</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-md"
                onClick={() => appendAward({ value: "" })}
                disabled={awardFields.length >= 20}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {awardFields.length === 0 ? (
              <p className="text-xs text-slate-500">No awards added yet.</p>
            ) : null}
            {awardFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`awards.${index}.value` as const)}
                  placeholder="e.g. Employee of the Year 2024"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-md text-slate-500 hover:text-red-500"
                  onClick={() => removeAward(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.awards && typeof errors.awards.message === "string" && (
              <p className="text-sm text-red-500">{errors.awards.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" {...register("companyName")} />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hrSignatoryName">HR Signatory Name</Label>
            <Input id="hrSignatoryName" {...register("hrSignatoryName")} />
            {errors.hrSignatoryName && (
              <p className="text-sm text-red-500">{errors.hrSignatoryName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hrEmail">HR Email</Label>
            <Input id="hrEmail" type="email" {...register("hrEmail")} />
            {errors.hrEmail && <p className="text-sm text-red-500">{errors.hrEmail.message}</p>}
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            By submitting this draft, you consent to sharing this professional data with your
            employer for the purpose of credential issuance under the DPDP Act 2026.
          </div>

          <Button
            type="submit"
            className="w-full rounded-md bg-brand-blue hover:bg-brand-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "resubmit" ? "Resubmitting..." : "Submitting..."}
              </>
            ) : mode === "resubmit" ? (
              "Resubmit for review"
            ) : (
              "Submit for Review"
            )}
          </Button>
        </form>

        <div
          className={cn(
            !isSheet && mobileView === "form" && "hidden md:block",
            isSheet && !showPreview && "hidden"
          )}
        >
          <CredentialPreview value={previewData} />
        </div>
      </div>
    </div>
  );
}
