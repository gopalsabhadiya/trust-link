import { Building2 } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const PILOT_CLIENTS = [
  { name: "Acme Corp", sector: "IT Services" },
  { name: "Pinnacle HR", sector: "Staffing" },
  { name: "NovaTech", sector: "FinTech" },
] as const;

export function SocialProofSection() {
  return (
    <section
      id="waitlist"
      className="bg-muted/50 py-20 sm:py-28"
      aria-labelledby="social-proof-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">
              Early Adopters
            </p>
            <h2
              id="social-proof-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Trusted by Industry Leaders
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Companies that are already building the future of automated employee
              offboarding and blockchain background verification in India.
            </p>
          </div>
        </ScrollReveal>

        {/* Pilot logos */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PILOT_CLIENTS.map((client, i) => (
            <ScrollReveal key={client.name} delay={i * 100}>
              <div className="flex flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
                  <Building2
                    className="h-7 w-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 text-lg font-semibold">{client.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {client.sector}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Waitlist count */}
        <ScrollReveal delay={350}>
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Join{" "}
            <strong className="text-foreground">50+ companies</strong> on our
            pilot waitlist — early access opening Q3 2026
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
