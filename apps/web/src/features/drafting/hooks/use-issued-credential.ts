"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchIssuedCredential, verifyCredentialHash } from "../api/drafts-api";

export function useIssuedCredential(id: string) {
  return useQuery({
    queryKey: ["issued-credential", id],
    queryFn: () => fetchIssuedCredential(id),
    enabled: Boolean(id),
  });
}

export function useVerifyCredential(hash: string) {
  return useQuery({
    queryKey: ["verify-credential", hash],
    queryFn: () => verifyCredentialHash(hash),
    enabled: Boolean(hash),
    retry: false,
  });
}
