"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHrCredentialRequests } from "@/features/drafting/api/drafts-api";

export function useHrCredentialRequestsQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["hr-credential-requests"],
    queryFn: fetchHrCredentialRequests,
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
