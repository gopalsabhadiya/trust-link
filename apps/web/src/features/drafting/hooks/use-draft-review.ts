"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchReviewDraft, submitReviewAction } from "../api/drafts-api";
import type { DraftReviewMutationInput } from "@trustlink/shared";

export function useDraftReview(token: string) {
  return useQuery({
    queryKey: ["draft-review", token],
    queryFn: () => fetchReviewDraft(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useDraftReviewAction(token: string) {
  return useMutation({
    mutationKey: ["draft-review-action", token],
    mutationFn: (payload: DraftReviewMutationInput) => submitReviewAction(token, payload),
  });
}
