import { apiClient } from "@/lib/api-client";
import type { ApiResponse, RegisterInput, UserDTO } from "@trustlink/shared";

export interface LoginPayload {
  email: string;
  password: string;
}

export type RegisterPayload = RegisterInput;

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<UserDTO>>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<UserDTO>>("/auth/register", payload),

  logout: () => apiClient.post<ApiResponse<null>>("/auth/logout"),

  me: () => apiClient.get<ApiResponse<UserDTO>>("/auth/me"),
} as const;
