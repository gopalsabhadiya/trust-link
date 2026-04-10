"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { DashboardSectionCard, TrustLinkLogoMark } from "@/components/brand";
import { useVerifyCredential } from "../hooks/use-issued-credential";

export function VerifyCredentialClient({ hash }: { hash: string }) {
  const verifyQuery = useVerifyCredential(hash);

  if (verifyQuery.isLoading) {
    return <p className="text-sm text-slate-600">Verifying credential...</p>;
  }

  if (verifyQuery.isError || !verifyQuery.data) {
    return (
      <p className="text-sm text-slate-600">
        Verification record not found or this document is invalid.
      </p>
    );
  }

  const verified = verifyQuery.data;
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-center">
        <TrustLinkLogoMark />
      </div>
      <DashboardSectionCard
        title="Public Credential Verification"
        description={`Hash: ${verified.hash}`}
      >
        <div className="mb-4 flex items-center gap-2">
          {verified.valid ? (
            <CheckCircle2 className="h-5 w-5 text-brand-green" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <p className="text-sm font-medium text-slate-800">
            {verified.revoked
              ? "This credential has been revoked by the issuer and is no longer valid for verification."
              : verified.valid
                ? `This document matches the original record signed by ${verified.companyName}.`
                : "Signature verification failed. This document may be tampered."}
          </p>
        </div>
        <dl className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Candidate</dt>
            <dd>{verified.candidateName}</dd>
          </div>
          <div>
            <dt className="font-semibold">Company</dt>
            <dd>{verified.companyName}</dd>
          </div>
          <div>
            <dt className="font-semibold">Joining Date</dt>
            <dd>{verified.joiningDate}</dd>
          </div>
          <div>
            <dt className="font-semibold">Relieving Date</dt>
            <dd>{verified.relievingDate}</dd>
          </div>
        </dl>
      </DashboardSectionCard>
    </main>
  );
}
