"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth-api";
import { AUTH_ME_QUERY_KEY } from "./use-session-user";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await authApi.logout();
    } catch {
      toast.error("Could not reach the server. You have been signed out locally.");
    } finally {
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
      router.push("/");
      router.refresh();
    }
  };
}
