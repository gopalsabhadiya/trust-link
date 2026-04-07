import { z } from "zod";

export const UserRoleSchema = z.enum(["HR", "CANDIDATE", "RECRUITER"]);

export type UserRoleEnum = z.infer<typeof UserRoleSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(255),
  role: UserRoleSchema,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
