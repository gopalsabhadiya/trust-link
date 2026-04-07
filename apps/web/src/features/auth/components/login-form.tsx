"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SocialLoginButtons } from "./social-login-buttons";
import { useAuth } from "../hooks/use-auth";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your TrustLink account to manage credentials.
        </p>
      </div>

      <SocialLoginButtons />

      <Separator label="or" className="my-6" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <a
              href="#"
              className="text-xs text-brand-blue hover:underline"
              tabIndex={-1}
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          By signing in, you acknowledge that TrustLink processes your credentials under
          the DPDP Act, 2023. See our{" "}
          <a
            href="#"
            className="text-brand-blue underline hover:text-brand-navy"
            onClick={(e) => e.preventDefault()}
          >
            Privacy Policy
          </a>
          .
        </p>

        <Button
          type="submit"
          className="mt-2 w-full bg-brand-blue hover:bg-brand-blue/90"
          disabled={isLoading}
          data-analytics-id="auth-login-submit"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-blue hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
