"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, ShieldCheck } from "lucide-react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader, DashboardSectionCard } from "@/components/brand";
import { useIssuedCredential } from "../hooks/use-issued-credential";

export function IssuedCredentialClient({ id }: { id: string }) {
  const issuedQuery = useIssuedCredential(id);
  const [isDownloading, setIsDownloading] = useState(false);

  const verifyLink = useMemo(() => {
    const hash = issuedQuery.data?.credentialHash;
    if (!hash) return "";
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/verify/${hash}`;
  }, [issuedQuery.data?.credentialHash]);

  if (issuedQuery.isLoading) {
    return <p className="text-sm text-slate-600">Loading issued credential...</p>;
  }

  if (issuedQuery.isError || !issuedQuery.data) {
    return <p className="text-sm text-slate-600">Unable to load issued credential.</p>;
  }

  const credential = issuedQuery.data;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Issued Credential"
        description="This credential is cryptographically signed and ready for verification."
      />

      <DashboardSectionCard
        title="Credential Successfully Verified & Issued"
        description="TrustLink has signed and anchored this issuance hash for third-party verification."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-md bg-brand-green px-3 py-1 text-white">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Verified & Issued
          </Badge>
          <Badge
            variant="outline"
            className="rounded-md border-brand-green-subtle-border bg-brand-green-subtle-bg text-brand-green"
            title="This signature can be validated publicly and is immutable once issued."
          >
            <ShieldCheck className="mr-1 h-4 w-4" />
            Blockchain Verified
          </Badge>
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard title="Credential Details" description={credential.companyName}>
        <dl className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Candidate</dt>
            <dd>{credential.content.employeeName}</dd>
          </div>
          <div>
            <dt className="font-semibold">Designation</dt>
            <dd>{credential.content.designation}</dd>
          </div>
          <div>
            <dt className="font-semibold">Tenure</dt>
            <dd>
              {credential.content.joiningDate} - {credential.content.relievingDate}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Credential Hash</dt>
            <dd className="break-all font-mono text-xs">{credential.credentialHash}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <Button
            className="rounded-md"
            disabled={isDownloading}
            onClick={async () => {
              try {
                setIsDownloading(true);
                const doc = new jsPDF();
                doc.setFontSize(18);
                doc.text("TrustLink Experience Letter", 20, 20);
                doc.setFontSize(12);
                doc.text(`Candidate: ${credential.content.employeeName}`, 20, 35);
                doc.text(`Company: ${credential.companyName}`, 20, 44);
                doc.text(
                  `Tenure: ${credential.content.joiningDate} - ${credential.content.relievingDate}`,
                  20,
                  53
                );
                doc.text(`Hash: ${credential.credentialHash}`, 20, 65, { maxWidth: 170 });

                const qrData = await QRCode.toDataURL(verifyLink, { margin: 1, width: 200 });
                doc.addImage(qrData, "PNG", 20, 80, 45, 45);
                doc.text("Scan QR to verify", 20, 130);

                doc.save(`trustlink-issued-${credential.id}.pdf`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to generate PDF");
              } finally {
                setIsDownloading(false);
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Generating PDF..." : "Download Signed PDF"}
          </Button>
        </div>
      </DashboardSectionCard>
    </div>
  );
}
