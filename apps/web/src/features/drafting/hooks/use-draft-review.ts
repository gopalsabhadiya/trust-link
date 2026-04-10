"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchHrReviewByCaseId,
  fetchReviewDraft,
  submitHrReviewByCaseId,
  submitReviewAction,
} from "../api/drafts-api";
import type { DraftReviewMutationInput } from "@trustlink/shared";

export type DraftReviewSource = { token: string } | { caseId: string };

export function useDraftReview(source: DraftReviewSource, queryEnabled = true) {
  const isToken = "token" in source;
  return useQuery({
    queryKey: isToken ? ["draft-review", source.token] : ["hr-draft-review", source.caseId],
    queryFn: () =>
      isToken ? fetchReviewDraft(source.token) : fetchHrReviewByCaseId(source.caseId),
    enabled:
      queryEnabled && (isToken ? Boolean(source.token) : Boolean(source.caseId)),
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDraftReviewAction(source: DraftReviewSource, mutationEnabled = true) {
  const isToken = "token" in source;
  return useMutation({
    mutationKey: isToken
      ? ["draft-review-action", source.token]
      : ["hr-draft-review-action", source.caseId],
    mutationFn: (payload: DraftReviewMutationInput) => {
      if (!mutationEnabled) {
        return Promise.reject(new Error("Review action unavailable"));
      }
      return isToken
        ? submitReviewAction(source.token, payload)
        : submitHrReviewByCaseId(source.caseId, payload);
    },
  });
}
