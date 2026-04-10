import type { Server } from "socket.io";
import {
  HR_SOCKET_EVENT_NEW_CREDENTIAL_REQUEST,
  type HrNewCredentialRequestPayload,
} from "@trustlink/shared";

let io: Server | null = null;

export function registerHrRealtimeServer(server: Server): void {
  io = server;
}

function hrRoom(normalizedEmail: string): string {
  return `hr:${normalizedEmail}`;
}

export function emitNewCredentialRequest(
  hrEmailNormalized: string,
  payload: HrNewCredentialRequestPayload
): void {
  io
    ?.to(hrRoom(hrEmailNormalized))
    .emit(HR_SOCKET_EVENT_NEW_CREDENTIAL_REQUEST, payload);
}
