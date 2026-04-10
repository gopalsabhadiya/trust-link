/** Socket.io runs on the API host, not under `/api`. */
export function getRealtimeBaseUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  return api.replace(/\/api\/?$/, "");
}
