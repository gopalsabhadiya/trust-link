"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { toast } from "sonner";
import {
  HR_SOCKET_EVENT_NEW_CREDENTIAL_REQUEST,
  type HrNewCredentialRequestPayload,
} from "@trustlink/shared";
import { getRealtimeBaseUrl } from "@/lib/realtime-url";
import { dispatchHrNewRequestWindowEvent } from "../lib/hr-realtime-window-event";

/**
 * Authenticated Socket.io client for HR: joins `hr:{normalizedEmail}` on the server.
 * Invalidates inbox query, toasts, and dispatches a window event for row highlights.
 */
export function HrRealtimeListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const base = getRealtimeBaseUrl();
    const socket = io(base, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    const onNewRequest = (payload: HrNewCredentialRequestPayload) => {
      void queryClient.invalidateQueries({ queryKey: ["hr-credential-requests"] });
      toast("New request", {
        description: `New request: ${payload.candidateName} has submitted a draft for review.`,
        className: "border border-slate-200 bg-white text-slate-800 shadow-md",
        duration: 8000,
      });
      dispatchHrNewRequestWindowEvent(payload);
    };

    socket.on(HR_SOCKET_EVENT_NEW_CREDENTIAL_REQUEST, onNewRequest);

    return () => {
      socket.off(HR_SOCKET_EVENT_NEW_CREDENTIAL_REQUEST, onNewRequest);
      socket.disconnect();
    };
  }, [queryClient]);

  return null;
}
