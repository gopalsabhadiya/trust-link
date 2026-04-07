import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create Account — TrustLink",
  description:
    "Join TrustLink to issue verifiable credentials or own your professional identity in a private digital wallet.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
