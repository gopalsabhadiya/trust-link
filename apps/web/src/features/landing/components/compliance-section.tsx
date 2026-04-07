import { ShieldCheck, Eye, Server, KeyRound } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const COMPLIANCE_POINTS = [
  {
    icon: KeyRound,
    title: "Zero-Knowledge Proofs",
    description:
      "Verify candidate claims with a cryptographic yes/no — no personal data is ever transmitted or stored by the verifier.",
  },
  {
    icon: Server,
    title: "No Centralized Data Store",
    description:
      "TrustLink never stores PII. Credentials live in the candidate's wallet, hashes live on-chain. Nothing to breach.",
  },
  {
    icon: Eye,
    title: "Consent-First Architecture",
    description:
      "Every data disclosure requires explicit candidate consent with expiry dates — fully aligned with the DPDP Act 2023.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-Ready Compliance",
    description:
      "Immutable on-chain logs of every issuance and verification event. Complete traceability for regulatory audits.",
  },
] as const;

export function ComplianceSection() {
  return (
    <section
      id="compliance"
      className="relative overflow-hidden py-20 sm:py-28"
      aria-labelledby="compliance-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-blue/5"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <ScrollReveal direction="left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">
                Compliance
              </p>
              <h2
                id="compliance-heading"
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                DPDP Act Ready from Day&nbsp;One
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Traditional HR tech stores &quot;data bombs&quot; — unencrypted scans with
                no legal basis. TrustLink&apos;s zero-knowledge architecture eliminates
                the liability entirely, making it the most compliant HR tech
                platform available.
              </p>
            </div>
          </ScrollReveal>

          {/* Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {COMPLIANCE_POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <ScrollReveal key={p.title} delay={i * 100} direction="right">
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                    <Icon className="mb-3 h-6 w-6 text-brand-blue" aria-hidden="true" />
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {p.description}
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
