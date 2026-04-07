import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

export function CtaSection() {
  return (
    <section
      className="bg-brand-navy py-20 sm:py-28"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="cta-heading"
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              Stop Checking.
              <br />
              Start <span className="text-brand-blue">Knowing</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
              Secure your spot in the pilot program. Be among the first to
              eliminate resume fraud and reduce time-to-hire with blockchain
              background verification.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" prefetch={false} data-analytics-id="cta-secure-spot">
                <Button
                  size="lg"
                  className="gap-2 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
                >
                  Secure Your Spot in the Pilot
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/register" prefetch={false} data-analytics-id="cta-request-demo">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border border-white/25 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  Request a Demo
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
