import { z } from "zod";

const DateStringSchema = z.string().refine(
  (value) => !Number.isNaN(new Date(value).getTime()),
  "Invalid date"
);

export const ExperienceLetterSchema = z
  .object({
    employeeName: z.string().min(1, "Employee name is required").max(255),
    designation: z.string().min(1, "Designation is required").max(255),
    joiningDate: DateStringSchema,
    relievingDate: DateStringSchema,
    keyAchievements: z
      .array(z.string().min(1, "Achievement cannot be empty").max(500))
      .min(1, "At least one key achievement is required"),
    companyName: z.string().min(1, "Company name is required").max(255),
    hrSignatoryName: z.string().min(1, "HR signatory name is required").max(255),
  })
  .refine(
    (payload) =>
      new Date(payload.relievingDate).getTime() >
      new Date(payload.joiningDate).getTime(),
    {
      message: "Relieving date must be after joining date",
      path: ["relievingDate"],
    }
  );

export type ExperienceLetterInput = z.infer<typeof ExperienceLetterSchema>;
