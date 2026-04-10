"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExperienceLetterSchema, type ExperienceLetterInput } from "@trustlink/shared";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CredentialPreview } from "./credential-preview";
import { isDraftApiValidationError, useSubmitDraft } from "../hooks/use-submit-draft";

const DEFAULT_VALUES: ExperienceLetterInput = {
  employeeName: "",
  designation: "",
  joiningDate: "",
  relievingDate: "",
  keyAchievements: [""],
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
  companyName: z.string().min(1, "Company name is required").max(255),
  hrSignatoryName: z.string().min(1, "HR signatory name is required").max(255),
  hrEmail: z.string().trim().email("Valid HR email is required"),
});

type DraftFormValues = z.infer<typeof DraftFormSchema>;

const DEFAULT_FORM_VALUES: DraftFormValues = {
  ...DEFAULT_VALUES,
  keyAchievements: [{ value: "" }],
  hrEmail: "",
};

export function ExperienceLetterDraftForm() {
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const submitDraft = useSubmitDraft();

  const {
    control,
    register,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<DraftFormValues>({
    resolver: zodResolver(DraftFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keyAchievements",
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
    }),
    [deferredWatched]
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      const normalizedPayload: ExperienceLetterInput = {
        ...values,
        keyAchievements: values.keyAchievements.map((item) => item.value),
      };
      const parsedPayload = ExperienceLetterSchema.parse(normalizedPayload);
      await submitDraft.mutateAsync({
        content: parsedPayload,
        consentLogged: true,
        hrEmail: values.hrEmail,
      });
      toast.success("Draft sent! We've generated a magic link for your HR.");
    } catch (error) {
      if (isDraftApiValidationError(error)) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          setError(field as keyof DraftFormValues, { message });
        }
        toast.error(error.message);
        return;
      }
      toast.error("Could not submit draft. Please try again.");
    }
  });

  return (
    <div className="space-y-4">
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

      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className={mobileView === "preview" ? "hidden md:block" : "space-y-4"}
        >
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Experience Letter Draft</h3>
            <p className="mt-1 text-xs text-slate-500">
              Fill all fields and submit for HR review.
            </p>
          </div>

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
                onClick={() => append({ value: "" })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input {...register(`keyAchievements.${index}.value` as const)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-md text-slate-500 hover:text-red-500"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {typeof errors.keyAchievements?.message === "string" && (
              <p className="text-sm text-red-500">{errors.keyAchievements.message}</p>
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
            disabled={submitDraft.isPending}
          >
            {submitDraft.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Review"
            )}
          </Button>
        </form>

        <div className={mobileView === "form" ? "hidden md:block" : ""}>
          <CredentialPreview value={previewData} />
        </div>
      </div>
    </div>
  );
}
