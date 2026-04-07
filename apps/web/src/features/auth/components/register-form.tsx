"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserRole } from "@trustlink/shared";
import { RegisterInputSchema, type RegisterInput } from "@trustlink/shared";
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

const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  description: string;
  icon: typeof Building2;
}[] = [
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
  const { register: submitRegistration, isLoading } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("HR");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      consent: false,
      role: "HR",
    },
  });

  useEffect(() => {
    setValue("role", accountType);
  }, [accountType, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    await submitRegistration(values);
  });

  const busy = isLoading || isSubmitting;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join TrustLink and start verifying or owning credentials today.
        </p>
      </div>

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
                  className={cn(
                    "h-5 w-5",
                    selected ? "text-brand-blue" : "text-muted-foreground"
                  )}
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

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-fullName">Full name</Label>
          <Input
            id="register-fullName"
            type="text"
            placeholder="Jane Doe"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email">Work email</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="register-dpdp-consent"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="mt-0.5"
                aria-invalid={Boolean(errors.consent)}
              />
            )}
          />
          <label
            htmlFor="register-dpdp-consent"
            className="cursor-pointer text-xs leading-relaxed text-muted-foreground"
          >
            I agree to the processing of my personal data under the DPDP Act for
            recruitment purposes. I have read the{" "}
            <a
              href="#"
              className="text-brand-blue underline hover:text-brand-navy"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </a>
            .
          </label>
        </div>
        {errors.consent && (
          <p className="-mt-2 text-xs text-destructive" role="alert">
            {errors.consent.message}
          </p>
        )}

        <Button
          type="submit"
          className="mt-2 w-full bg-brand-blue hover:bg-brand-blue/90"
          disabled={busy}
          data-analytics-id="auth-register-submit"
        >
          {busy ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you also agree to our{" "}
          <a
            href="#"
            className="text-brand-blue underline hover:text-brand-navy"
            onClick={(e) => e.preventDefault()}
          >
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
