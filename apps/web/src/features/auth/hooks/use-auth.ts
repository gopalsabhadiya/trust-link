"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, type LoginPayload, type RegisterPayload } from "../api/auth-api";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login(payload);
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authApi.register(payload);
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error ?? "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, register, isLoading, error, clearError: () => setError(null) };
}
