import type { HrNewCredentialRequestPayload } from "@trustlink/shared";

export const HR_NEW_REQUEST_WINDOW_EVENT = "trustlink:hr-new-credential-request";

export type HrNewRequestWindowEvent = CustomEvent<HrNewCredentialRequestPayload>;

export function dispatchHrNewRequestWindowEvent(detail: HrNewCredentialRequestPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<HrNewCredentialRequestPayload>(HR_NEW_REQUEST_WINDOW_EVENT, { detail })
  );
}
