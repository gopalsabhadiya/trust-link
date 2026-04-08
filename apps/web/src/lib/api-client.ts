import axios from "axios";
import type { ApiResponse } from "@trustlink/shared";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? "Unknown error";
    const err = new Error(message) as Error & { status?: number };
    if (typeof error.response?.status === "number") {
      err.status = error.response.status;
    }
    return Promise.reject(err);
  }
);

export async function fetcher<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await apiClient.get<ApiResponse<T>>(url);
  return data;
}
