import { AlertTriangle, Clock, ShieldAlert, PhoneOff } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "The Resume Lie Crisis",
    stat: "40%",
    detail: "of resumes in India contain inflated or fake data",
    impact: "Bad hires cost companies 30–50% of annual salary",
    color: "text-red-500 bg-red-50",
  },
  {
    icon: Clock,
    title: "Speed-to-Hire Barrier",
    stat: "14 days",
    detail: "average BGV turnaround at ₹1,500–₹8,000 per candidate",
    impact: "Top talent is ghosted while verification is pending",
    color: "text-amber-500 bg-amber-50",
  },
  {
    icon: ShieldAlert,
    title: "DPDP Compliance Nightmare",
    stat: "₹250 Cr",
    detail: "maximum penalty under the DPDP Act 2023",
    impact: "HR departments store unencrypted data bombs",
    color: "text-orange-500 bg-orange-50",
  },
  {
    icon: PhoneOff,
    title: "The Administrative Sinkhole",
    stat: "60 hrs",
    detail: "wasted per month responding to verification requests",
    impact: "HR teams trapped in manual phone-tag loops",
    color: "text-purple-500 bg-purple-50",
  },
] as const;

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="bg-muted/50 py-20 sm:py-28"
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">
              The Problem
            </p>
            <h2 id="problem-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Background Verification is Broken
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              In 2026, AI-generated resumes and deepfakes make manual verification
              impossible to scale. The old system fails in four critical ways.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <ScrollReveal key={problem.title} delay={i * 100}>
                <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${problem.color}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold">{problem.title}</h3>
                  <p className="mt-3 text-3xl font-bold text-foreground">
                    {problem.stat}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{problem.detail}</p>
                  <p className="mt-auto pt-4 text-xs font-medium text-destructive">
                    {problem.impact}
                  </p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
