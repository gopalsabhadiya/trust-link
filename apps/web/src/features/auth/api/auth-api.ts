import { apiClient } from "@/lib/api-client";
import type { ApiResponse, User, CreateUserInput } from "@trustlink/shared";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends CreateUserInput {
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/register", payload),

  logout: () =>
    apiClient.post<ApiResponse<null>>("/auth/logout"),

  me: () =>
    apiClient.get<ApiResponse<User>>("/auth/me"),
} as const;
