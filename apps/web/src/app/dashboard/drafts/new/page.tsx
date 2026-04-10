import { redirect } from "next/navigation";

export default function DraftExperienceLetterPage() {
  redirect("/dashboard/experience?new=1");
}
