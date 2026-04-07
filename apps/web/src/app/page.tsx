import { USER_ROLES } from "@trustlink/shared";
import type { UserRole } from "@trustlink/shared";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileCheck, UserCheck } from "lucide-react";

const ROLE_CONFIG: Record<UserRole, { label: string; description: string; icon: typeof Shield }> = {
  HR: {
    label: "Issuer (HR)",
    description: "Issue verifiable credentials for employees — promotions, tenure, salary history.",
    icon: FileCheck,
  },
  CANDIDATE: {
    label: "Holder (Candidate)",
    description: "Own and control your professional credentials in a private digital wallet.",
    icon: Shield,
  },
  RECRUITER: {
    label: "Verifier (Recruiter)",
    description: "Instantly verify candidate claims with cryptographic proof — no phone tag.",
    icon: UserCheck,
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          The Trust Layer for the Global Workforce
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Replace 14-day background checks with 1-second cryptographic proofs.
          Own your professional identity.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {USER_ROLES.map((role) => {
          const config = ROLE_CONFIG[role];
          const Icon = config.icon;
          return (
            <Card key={role} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <Badge variant="secondary">{role}</Badge>
                </div>
                <CardTitle className="text-lg">{config.label}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Select this role to get started with TrustLink.
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
