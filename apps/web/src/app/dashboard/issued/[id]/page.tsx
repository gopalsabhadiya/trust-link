import { IssuedCredentialClient } from "@/features/drafting/components/issued-credential-client";

export default async function IssuedCredentialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IssuedCredentialClient id={id} />;
}
