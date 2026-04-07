"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import type { UserRole } from "@trustlink/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SocialLoginButtons } from "./social-login-buttons";
import { useAuth } from "../hooks/use-auth";
import { cn } from "@/lib/utils";
import { Building2, User } from "lucide-react";

type AccountType = Extract<UserRole, "HR" | "CANDIDATE">;

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string; icon: typeof Building2 }[] = [
  {
    value: "HR",
    label: "Company",
    description: "Issue & manage verifiable credentials for employees",
    icon: Building2,
  },
  {
    value: "CANDIDATE",
    label: "Candidate",
    description: "Own your verified career history in a digital wallet",
    icon: User,
  },
];

export function RegisterForm() {
  const { register, isLoading, error, clearError } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("HR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dpdpConsent, setDpdpConsent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!dpdpConsent) return;
    register({ name, email, password, role: accountType });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join TrustLink and start verifying or owning credentials today.
        </p>
      </div>

      {/* Account type selector */}
      <fieldset className="mb-6">
        <legend className="mb-3 text-sm font-medium">I am a...</legend>
        <div className="grid grid-cols-2 gap-3">
          {ACCOUNT_TYPES.map((type) => {
            const Icon = type.icon;
            const selected = accountType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setAccountType(type.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all",
                  selected
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
                aria-pressed={selected}
              >
                <Icon
                  className={cn("h-5 w-5", selected ? "text-brand-blue" : "text-muted-foreground")}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold">{type.label}</span>
                <span className="text-[11px] leading-tight text-muted-foreground">
                  {type.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <SocialLoginButtons />

      <Separator label="or" className="my-6" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-name">Full name</Label>
          <Input
            id="register-name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError();
            }}
            required
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email">Work email</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="register-dpdp-consent"
            checked={dpdpConsent}
            onChange={(e) => setDpdpConsent(e.target.checked)}
            required
            className="mt-0.5"
          />
          <label
            htmlFor="register-dpdp-consent"
            className="cursor-pointer text-xs leading-relaxed text-muted-foreground"
          >
            I consent to TrustLink collecting and processing my personal data to
            create and manage my account, in line with the Digital Personal Data
            Protection (DPDP) Act, 2023. I have read the{" "}
            <a
              href="#"
              className="text-brand-blue underline hover:text-brand-navy"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={isLoading || !dpdpConsent}
          data-analytics-id="auth-register-submit"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you also agree to our{" "}
          <a href="#" className="text-brand-blue underline hover:text-brand-navy">
            Terms of Service
          </a>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-blue hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
