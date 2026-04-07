import { ArrowRight, FileText, Zap, Shield } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const TRANSITIONS = [
  {
    icon: FileText,
    from: "Static PDFs",
    to: "Verifiable Credentials",
    description:
      "Digitally signed, tamper-proof credentials that travel with the candidate across borders and industries.",
  },
  {
    icon: Zap,
    from: "14-Day Delays",
    to: "1-Second API Calls",
    description:
      "Instant employee verification API that eliminates the BGV bottleneck from your hiring pipeline.",
  },
  {
    icon: Shield,
    from: "Data Liability",
    to: "Sovereign Ownership",
    description:
      "Candidates own their data. Verify without storing — zero liability, full DPDP compliance.",
  },
] as const;

export function SolutionSection() {
  return (
    <section
      id="solution"
      className="py-20 sm:py-28"
      aria-labelledby="solution-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">
              The Solution
            </p>
            <h2
              id="solution-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              The Trust Layer for Professional Identity
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              TrustLink transforms professional history into immutable,
              cryptographically verifiable assets using self-sovereign identity
              and blockchain technology.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {TRANSITIONS.map((t, i) => {
            const Icon = t.icon;
            return (
              <ScrollReveal key={t.from} delay={i * 120}>
                <div className="group relative rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-md">
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-blue/10">
                    <Icon className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                  </div>

                  <div className="mb-4 flex items-center gap-3 text-sm font-semibold">
                    <span className="rounded-md bg-muted px-3 py-1 text-muted-foreground line-through">
                      {t.from}
                    </span>
                    <ArrowRight className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                    <span className="rounded-md bg-brand-blue/10 px-3 py-1 text-brand-blue">
                      {t.to}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Wallet visual placeholder */}
        <ScrollReveal delay={400}>
          <div className="mx-auto mt-16 flex max-w-2xl flex-col items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-8 py-12 text-center">
            <Shield className="h-12 w-12 text-brand-blue/40" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold text-foreground">
              The Verified Career Wallet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              A private digital wallet where candidates carry their entire
              verified professional history — promotions, salary hikes, degrees
              — without relying on any employer&apos;s database.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
