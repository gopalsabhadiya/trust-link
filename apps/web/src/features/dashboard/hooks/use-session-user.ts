"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth-api";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

export function useSessionUserQuery() {
  return useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      const { data } = await authApi.me();
      if (!data.success || !data.data) {
        throw new Error(data.error ?? "Not authenticated");
      }
      return data.data;
    },
    retry: false,
    staleTime: 30 * 1000,
  });
}
