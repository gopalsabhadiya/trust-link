import passport from "passport";
import type { Profile, VerifyCallback } from "passport-google-oauth20";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import OAuth2Strategy from "passport-oauth2";
import { env, isGoogleOAuthConfigured, isLinkedInOAuthConfigured } from "./env";

export interface OAuthProfilePayload {
  authProvider: "GOOGLE" | "LINKEDIN";
  externalId: string;
  email: string;
  name: string;
}

export function configurePassport(): void {
  if (isGoogleOAuthConfigured()) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
          callbackURL: `${env.API_PUBLIC_URL}/api/auth/google/callback`,
        },
        (_accessToken, _refreshToken, profile: Profile, done: VerifyCallback) => {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            done(new Error("Google did not return an email address"));
            return;
          }
          const payload: OAuthProfilePayload = {
            authProvider: "GOOGLE",
            externalId: profile.id,
            email,
            name: profile.displayName?.trim() || email.split("@")[0]!,
          };
          done(null, payload as unknown as Express.User);
        }
      )
    );
  }

  if (isLinkedInOAuthConfigured()) {
    passport.use(
      "linkedin",
      new OAuth2Strategy(
        {
          authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
          tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
          clientID: env.LINKEDIN_CLIENT_ID!,
          clientSecret: env.LINKEDIN_CLIENT_SECRET!,
          callbackURL: `${env.API_PUBLIC_URL}/api/auth/linkedin/callback`,
          scope: ["openid", "profile", "email"],
          // `state: true` requires a session store; we use `session: false` on routes.
          state: false,
        },
        async (
          accessToken: string,
          _refreshToken: string,
          _profile: unknown,
          verified: OAuth2Strategy.VerifyCallback
        ) => {
          try {
            const r = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!r.ok) {
              verified(new Error("LinkedIn userinfo request failed"));
              return;
            }
            const j = (await r.json()) as {
              sub: string;
              name?: string;
              email?: string;
            };
            if (!j.email) {
              verified(new Error("LinkedIn did not return an email address"));
              return;
            }
            const payload: OAuthProfilePayload = {
              authProvider: "LINKEDIN",
              externalId: j.sub,
              email: j.email,
              name: j.name?.trim() || j.email.split("@")[0]!,
            };
            verified(null, payload as unknown as Express.User);
          } catch (e) {
            verified(e as Error);
          }
        }
      )
    );
  }
}
