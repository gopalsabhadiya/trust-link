import {
  Zap,
  ShieldOff,
  MailX,
  Globe,
  EyeOff,
  Lock,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const ENTERPRISE_FEATURES = [
  {
    icon: Zap,
    title: "Instant Verification API",
    description:
      "Move from offer letter to onboarding in days, not weeks. Reduce time-to-hire by up to 90% with a single API call.",
  },
  {
    icon: ShieldOff,
    title: "Zero Data Liability",
    description:
      "Verify candidate data without storing sensitive files. Full DPDP compliance with zero data-bomb risk.",
  },
  {
    icon: MailX,
    title: "End the Administrative Tax",
    description:
      "Automate 100% of incoming verification requests. Free your HR team from 60 hours/month of phone tag.",
  },
] as const;

const CANDIDATE_FEATURES = [
  {
    icon: Globe,
    title: "Instant Portability",
    description:
      "Verified credentials follow you across borders, industries, and employers — forever in your digital wallet.",
  },
  {
    icon: EyeOff,
    title: "Selective Disclosure",
    description:
      "Prove specific claims (tenure, role, salary band) without revealing your entire private history.",
  },
  {
    icon: Lock,
    title: "Privacy by Design",
    description:
      "Total control over who sees your data, for how long, and for what purpose. Revoke access anytime.",
  },
] as const;

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Zap;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10">
        <Icon className="h-5 w-5 text-brand-blue" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 sm:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">
              Value Pillars
            </p>
            <h2
              id="features-heading"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Built for Everyone in the Hiring Chain
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you&apos;re an enterprise, a candidate, or a recruiter —
              TrustLink is the DPDP compliant HR tech platform that works for
              you.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-2">
          {/* Enterprise */}
          <ScrollReveal direction="left">
            <div>
              <h3 className="mb-8 text-xl font-bold">
                For the Enterprise:{" "}
                <span className="text-brand-blue">From &quot;Checking&quot; to &quot;Knowing&quot;</span>
              </h3>
              <div className="flex flex-col gap-8">
                {ENTERPRISE_FEATURES.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Candidate */}
          <ScrollReveal direction="right">
            <div>
              <h3 className="mb-8 text-xl font-bold">
                For the Candidate:{" "}
                <span className="text-brand-blue">Own Your Truth</span>
              </h3>
              <div className="flex flex-col gap-8">
                {CANDIDATE_FEATURES.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
