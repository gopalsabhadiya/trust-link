import type { Metadata } from "next";
import { VerifyCredentialClient } from "@/features/drafting/components/verify-credential-client";

export const metadata: Metadata = {
  title: "Verify Credential — TrustLink",
};

export default async function VerifyCredentialPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  return <VerifyCredentialClient hash={hash} />;
}
