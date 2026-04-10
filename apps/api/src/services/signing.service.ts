import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { env } from "../config";

export interface SignedCredentialPayload {
  hash: string;
  signature: string;
  signatoryPubKey: string;
}

export class SigningService {
  private readonly privateKey = createPrivateKey(
    env.ISSUANCE_PRIVATE_KEY_PEM.replace(/\\n/g, "\n")
  );
  private readonly publicKey = createPublicKey(this.privateKey)
    .export({ type: "spki", format: "pem" })
    .toString();

  hashCanonicalPayload(payload: string): string {
    return createHash("sha256").update(payload).digest("hex");
  }

  signHash(hashHex: string): SignedCredentialPayload {
    const signature = sign(
      "sha256",
      Buffer.from(hashHex, "hex"),
      this.privateKey
    ).toString("base64");

    return {
      hash: hashHex,
      signature,
      signatoryPubKey: this.publicKey,
    };
  }

  verifyHashSignature(hashHex: string, signatureBase64: string, pubKeyPem: string): boolean {
    return verify(
      "sha256",
      Buffer.from(hashHex, "hex"),
      pubKeyPem,
      Buffer.from(signatureBase64, "base64")
    );
  }
}
