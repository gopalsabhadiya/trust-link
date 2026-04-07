import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/lib/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustLink — The Trust Layer for the Global Workforce",
  description:
    "Decentralized verification protocol that turns professional history into immutable, cryptographically verifiable assets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-border">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight">
                    TrustLink
                  </span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    BETA
                  </span>
                </div>
                <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                  <a href="/" className="hover:text-foreground transition-colors">
                    Dashboard
                  </a>
                  <a
                    href="/issuance"
                    className="hover:text-foreground transition-colors"
                  >
                    Issue
                  </a>
                  <a
                    href="/verification"
                    className="hover:text-foreground transition-colors"
                  >
                    Verify
                  </a>
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
