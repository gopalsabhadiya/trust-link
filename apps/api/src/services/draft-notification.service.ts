export interface ReviewLinkPayload {
  hrEmail: string;
  reviewLink: string;
  employeeName: string;
  companyName: string;
}

export class DraftNotificationService {
  async sendReviewLink(payload: ReviewLinkPayload): Promise<void> {
    console.log(
      [
        "[TrustLink Simulated Email]",
        `To: ${payload.hrEmail}`,
        `Subject: Review experience letter draft for ${payload.employeeName}`,
        `Company: ${payload.companyName}`,
        `Review Link: ${payload.reviewLink}`,
      ].join("\n")
    );
  }
}
