import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Above-fold content uses CSS @keyframes (animate-hero-*) instead of
 * ScrollReveal to guarantee the H1 is visible in the initial SSR HTML.
 * This is critical for Lighthouse LCP detection.
 *
 * Only the stats bar (below the fold) uses ScrollReveal.
 */
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-blue/5 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge — CSS animation, no ScrollReveal */}
          <div className="animate-hero-1">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-semibold tracking-wide">
              India&apos;s First Blockchain Background Verification Platform
            </Badge>
          </div>

          {/* H1 — THE LCP ELEMENT. Must be fully visible in SSR HTML. */}
          <h1
            id="hero-heading"
            className="animate-hero-2 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          >
            Verify Any Professional in{" "}
            <span className="text-brand-blue">1&nbsp;Second</span>
            <br className="hidden sm:block" />
            {" "}— Not 14&nbsp;Days
          </h1>

          {/* Subheadline */}
          <p className="animate-hero-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Stop losing top talent to slow background checks. TrustLink replaces
            manual BGV with instant cryptographic proof of employment, education,
            and credentials — fully{" "}
            <strong className="text-foreground">DPDP compliant</strong>.
          </p>

          {/* CTAs */}
          <div className="animate-hero-4 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" prefetch={false} data-analytics-id="hero-request-demo">
              <Button size="lg" className="gap-2 px-8 text-base">
                Request a Demo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <a href="#how-it-works" data-analytics-id="hero-see-how">
              <Button variant="outline" size="lg" className="gap-2 px-8 text-base">
                <Play className="h-4 w-4" aria-hidden="true" />
                See How It Works
              </Button>
            </a>
          </div>

          {/* Trust line */}
          <p className="animate-hero-5 mt-8 text-sm text-muted-foreground">
            Trusted by <strong className="text-foreground">50+ companies</strong>{" "}
            on our pilot waitlist &middot; Reduce time-to-hire by up to 90%
          </p>
        </div>

        {/* Stats bar — below the fold, safe to use ScrollReveal */}
        <ScrollReveal delay={100}>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 rounded-2xl border border-border bg-card p-8 shadow-sm sm:grid-cols-3">
            {[
              { stat: "1 sec", label: "Verification Time" },
              { stat: "₹0", label: "Data Liability" },
              { stat: "100%", label: "DPDP Compliant" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-bold text-brand-blue">{item.stat}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
