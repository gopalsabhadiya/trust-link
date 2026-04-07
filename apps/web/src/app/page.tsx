import type { Metadata } from "next";
import {
  Header,
  HeroSection,
  ProblemSection,
  SolutionSection,
  HowItWorksSection,
  FeaturesSection,
  SocialProofSection,
  ComplianceSection,
  CtaSection,
  Footer,
} from "@/features/landing/components";

/** Explicit description on the document route — some Lighthouse versions miss layout-only metadata. */
export const metadata: Metadata = {
  title: "TrustLink — Blockchain Background Verification India | Instant Employee Verification API",
  description:
    "Eliminate resume fraud with India's first DPDP compliant blockchain verification platform. Replace 14-day background checks with 1-second cryptographic proofs. DPDP compliant HR tech for India.",
  alternates: { canonical: "https://trustlink.io/" },
  openGraph: {
    url: "https://trustlink.io/",
    title: "TrustLink — The Trust Layer for the Global Workforce",
    description:
      "Instant employee verification API, digital experience letters, and automated offboarding. Reduce time-to-hire with self-sovereign identity.",
  },
};

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SocialProofSection />
        <ComplianceSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
