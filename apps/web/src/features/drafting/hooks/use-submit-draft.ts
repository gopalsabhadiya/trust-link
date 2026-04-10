"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCredentialDraft, type DraftApiValidationError } from "../api/drafts-api";

export function useSubmitDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["drafts", "create"],
    mutationFn: createCredentialDraft,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["candidate", "experience"] });
    },
  });
}

export function isDraftApiValidationError(
  error: unknown
): error is DraftApiValidationError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
  );
}
