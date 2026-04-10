import { redirect } from "next/navigation";

export default async function EditDraftCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  redirect(`/dashboard/experience?edit=${encodeURIComponent(caseId)}`);
}
