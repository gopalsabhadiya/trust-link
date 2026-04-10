import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { IssuedCredentialDTO } from "@trustlink/shared";

export async function downloadIssuedCredentialPdf(
  credential: IssuedCredentialDTO,
  verifyLink: string
): Promise<void> {
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
}
