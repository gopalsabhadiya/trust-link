import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { SonnerToaster } from "@/components/ui/sonner-toaster";
import { AuthUrlEffects } from "@/features/auth/components/auth-url-effects";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://trustlink.io"),
  title:
    "TrustLink — Blockchain Background Verification India | Instant Employee Verification API",
  description:
    "Eliminate resume fraud with India's first DPDP compliant blockchain verification platform. Replace 14-day background checks with 1-second cryptographic proofs. Digital experience letters, automated offboarding, and self-sovereign identity for careers.",
  applicationName: "TrustLink",
  keywords: [
    "Blockchain Background Verification India",
    "Instant Employee Verification API",
    "Eliminate Resume Fraud",
    "DPDP Compliant HR Tech",
    "Digital Experience Letter",
    "Automated Employee Offboarding",
    "Self-Sovereign Identity Careers",
    "Reduce Time-to-Hire",
  ],
  openGraph: {
    title: "TrustLink — The Trust Layer for the Global Workforce",
    description:
      "Replace 14-day background checks with 1-second cryptographic proofs. DPDP compliant, blockchain-verified professional credentials.",
    url: "https://trustlink.io",
    siteName: "TrustLink",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustLink — Instant Employee Verification API",
    description:
      "Eliminate resume fraud. 1-second verification. Fully DPDP compliant.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <noscript>
          <style>{`
            .opacity-0 { opacity: 1 !important; }
            .translate-y-8, .-translate-y-8,
            .translate-x-8, .-translate-x-8 {
              transform: none !important;
            }
          `}</style>
        </noscript>
      </head>
      <body>
        <Providers>
          <SonnerToaster />
          <Suspense fallback={null}>
            <AuthUrlEffects />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
