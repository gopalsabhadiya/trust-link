import { z } from "zod";

export const DraftReviewActionSchema = z.enum(["APPROVE", "REQUEST_REVISION"]);

export const DraftReviewMutationSchema = z
  .object({
    action: DraftReviewActionSchema,
    hrFeedback: z.string().trim().max(2000).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.action === "REQUEST_REVISION" &&
      (!value.hrFeedback || value.hrFeedback.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Feedback is required when requesting revision",
        path: ["hrFeedback"],
      });
    }
  });

export type DraftReviewMutationInput = z.infer<typeof DraftReviewMutationSchema>;
