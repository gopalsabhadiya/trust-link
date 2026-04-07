import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In — TrustLink",
  description:
    "Sign in to your TrustLink account to issue or verify blockchain-backed professional credentials.",
};

export default function LoginPage() {
  return <LoginForm />;
}
