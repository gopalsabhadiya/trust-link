import axios from "axios";
import type { ApiResponse } from "@trustlink/shared";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? "Unknown error";
    return Promise.reject(new Error(message));
  }
);

export async function fetcher<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await apiClient.get<ApiResponse<T>>(url);
  return data;
}
