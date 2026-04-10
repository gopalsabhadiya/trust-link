"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resubmitCase, type CreateDraftPayload } from "../api/drafts-api";

export function useResubmitDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["drafts", "resubmit"],
    mutationFn: ({ caseId, payload }: { caseId: string; payload: CreateDraftPayload }) =>
      resubmitCase(caseId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["candidate", "experience"] });
    },
  });
}
