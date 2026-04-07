import { FileSignature, Wallet, ScanSearch } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const STEPS = [
  {
    step: 1,
    icon: FileSignature,
    role: "Issuer (HR)",
    title: "HR Signs a Credential",
    description:
      "On offboarding, HR issues a digitally signed verifiable credential — experience letter, promotion record, salary proof — anchored to the blockchain.",
    keyword: "Digital Experience Letter",
  },
  {
    step: 2,
    icon: Wallet,
    role: "Holder (Candidate)",
    title: "Candidate Claims Ownership",
    description:
      "The credential is stored in the candidate's private digital wallet. They own it forever — no dependence on the employer's HR database.",
    keyword: "Self-Sovereign Identity",
  },
  {
    step: 3,
    icon: ScanSearch,
    role: "Verifier (Recruiter)",
    title: "Recruiter Verifies Instantly",
    description:
      "Recruiters call the TrustLink API and receive a cryptographic yes/no proof — no PII exchanged, no data stored, verification in 1 second.",
    keyword: "Instant Employee Verification API",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-muted/50 py-20 sm:py-28"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">
              How It Works
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Three Steps to Eliminate Resume Fraud
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple, automated flow that replaces the entire BGV pipeline
              with cryptographic certainty.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative mt-16">
          {/* Connector line (desktop) */}
          <div
            className="absolute left-0 right-0 top-24 hidden h-0.5 bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent lg:block"
            aria-hidden="true"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <ScrollReveal key={s.step} delay={i * 150}>
                  <div className="relative flex flex-col items-center text-center">
                    {/* Step number */}
                    <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-blue bg-card shadow-sm">
                      <Icon className="h-7 w-7 text-brand-blue" aria-hidden="true" />
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                        {s.step}
                      </span>
                    </div>

                    <span className="mb-2 inline-block rounded-md bg-brand-blue/10 px-3 py-0.5 text-xs font-semibold text-brand-blue">
                      {s.role}
                    </span>

                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
