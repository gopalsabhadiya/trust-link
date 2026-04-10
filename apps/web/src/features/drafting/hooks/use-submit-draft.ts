"use client";

import { useMutation } from "@tanstack/react-query";
import { createCredentialDraft, type DraftApiValidationError } from "../api/drafts-api";

export function useSubmitDraft() {
  return useMutation({
    mutationKey: ["drafts", "create"],
    mutationFn: createCredentialDraft,
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
