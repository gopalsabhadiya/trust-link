"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
      if (data.success && data.data) {
        toast.success("Signed in successfully.");
        router.push("/dashboard");
      } else {
        const msg = data.error ?? "Login failed";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authApi.register(payload);
      if (data.success && data.data) {
        toast.success("Account created. You're signed in.");
        router.push("/dashboard");
      } else {
        const msg = data.error ?? "Registration failed";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, register, isLoading, error, clearError: () => setError(null) };
}
