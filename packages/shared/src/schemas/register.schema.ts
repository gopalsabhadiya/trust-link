import { z } from "zod";
import { UserRoleSchema } from "./user.schema";

export const RegisterInputSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(255, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  consent: z
    .boolean()
    .refine((v) => v === true, {
      message:
        "You must agree to the processing of your personal data under the DPDP Act for recruitment purposes",
    }),
  role: UserRoleSchema,
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
