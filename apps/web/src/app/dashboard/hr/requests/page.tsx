import type { Metadata } from "next";
import { HrCredentialRequestsClient } from "@/features/hr-requests/components/hr-credential-requests-client";

export const metadata: Metadata = {
  title: "Credential Requests — TrustLink",
};

export default function HrCredentialRequestsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-heading-dashboard text-2xl">Credential requests</h1>
        <p className="mt-1 text-body-dashboard-muted">
          Review and approve experience letter drafts addressed to your HR email.
        </p>
      </div>
      <HrCredentialRequestsClient />
    </div>
  );
}
