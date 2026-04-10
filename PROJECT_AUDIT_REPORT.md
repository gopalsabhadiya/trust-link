# PROJECT_AUDIT_REPORT: TrustLink (v1.0-Audit)

## 1. Executive Summary
TrustLink demonstrates a high-quality monorepo architecture with a clear separation of concerns and a strong focus on type safety through a shared schema layer. The project is approximately 90% production-ready, featuring robust magic-link security and a sophisticated "Experience Journey" timeline. However, critical gaps in DPDP-compliant data minimization and consent versioning must be addressed before deployment.

---

## 2. Critical Findings (Fix Immediately)

### 🚨 [DATA SECURITY] Incomplete PII Purge
- **Location:** `apps/api/src/repositories/draft.repository.ts` -> `runSoftPurge()`
- **Issue:** The soft-purge logic currently only clears the `content` field in the `CredentialDraftVersion` table. It **leaves the `contentSnapshot` untouched** in the `IssuedCredentialSnapshot` table. This snapshot contains the exact same PII (name, achievements, dates).
- **Risk:** Failure to comply with DPDP "Right to Erasure" and "Data Minimization" mandates.
- **Impact:** High. Sensitive employee data remains in the database indefinitely despite the "Purge" status being marked as `PURGED`.

### 🚨 [COMPLIANCE] Automated Consent without Versioning
- **Location:** `apps/api/src/services/auth.service.ts` -> `registerManual` / `signInWithOAuth`
- **Issue:** Consent is automatically set to `true` with the current `now()` timestamp during registration. There is no record of the specific Privacy Policy version the user agreed to at the point of account creation.
- **Risk:** Legal ambiguity during a DPDP audit if the Privacy Policy changes over time.
- **Impact:** Medium-High.

---

## 3. Technical Debt (Refactor Needed)

### 🛠️ Reactive Purge Execution
- **Location:** `apps/api/src/services/draft.service.ts` -> `submitReviewAction()`
- **Issue:** `runSoftPurge` is called inside a controller-triggered service method. While this ensures frequent checks, it ties transaction logic to user actions, which may cause performance jitter as the dataset grows.
- **Suggestion:** Move to a scheduled job (e.g., `node-cron` or a dedicated worker).

### 🛠️ Magic Token Format Validation
- **Location:** `apps/api/src/services/draft.service.ts` -> `resolveActiveVersionFromToken()`
- **Issue:** The regex `/^[a-f0-9]{64}$/i` is hardcoded. If the `TOKEN_BYTES` in `magic-token.ts` changes, the service will break silently.
- **Suggestion:** Export a validation constant from `magic-token.ts`.

---

## 4. Compliance Checklist (DPDP Act 2026)

| Requirement | Status | Note |
| :--- | :--- | :--- |
| **Notice & Consent** | ⚠️ Partial | Captured at reg, but missing version link in `User` table. |
| **Data Minimization** | ❌ Failed | `contentSnapshot` remains after purge period. |
| **Audit Trail** | ✅ Pass | `ComplianceAuditLog` correctly tracks HR/Candidate actions. |
| **Right to Correction** | ✅ Pass | Supported via "Revisions Required" flow. |
| **Selective Disclosure** | ✅ Pass | Verifier only sees signed hash vs platform providing PDF. |

---

## 5. UI/UX & Brand Consistency Audit

### ✅ Experience Journey Timeline
- **Performance:** The `ExperienceJourneyFeed` uses `useMemo` for row computation and sorts a maximum of 50 items (limited by the API). This is highly performant for typical user data.
- **Edge Cases:**
  - **Zero Records:** Correctly handled via the `emptyIllustration` prop.
  - **Large Datasets (50+):** The current API limit of 50 prevents UI lag, but pagination is not yet implemented. Year-based grouping keeps the list organized.
  - **Missing Data:** Components use optional chaining and null-checks (e.g., `item.designation ? ... : null`) which prevents crashes on partial draft data.

---

## 6. Actionable Instructions for Cursor

### Prompt 1: Fix PII Purge Logic
```text
In `apps/api/src/repositories/draft.repository.ts`, update the `runSoftPurge` method to also clear the `contentSnapshot` in the `IssuedCredentialSnapshot` table. It should set the JSON to an empty object `{}` for all records where `purgeStatus` is 'SCHEDULED' and the date has passed. Ensure this is done within the existing transaction.
```

### Prompt 2: Enhance Consent Versioning
```text
Update the `User` model in `schema.prisma` to include a `consentVersion` field (String). Update `AuthService` in `apps/api/src/services/auth.service.ts` to accept a `consentVersion` from the registration payload (use the `PRIVACY_POLICY_VERSION` from env as default). Update the registration schemas in `packages/shared` to include this field.
```

### Prompt 3: Refactor Timeline Logic
```text
The `ExperienceJourneyFeed` in `apps/web/src/features/drafting/components/experience-journey-feed.tsx` uses a complex `caseActivityTimestamp` function. Refactor this into a utility in `packages/shared` so that both the Backend (for sorting APIs) and Frontend use the exact same logic for determining "Recency."
```

### Prompt 4: Strengthen Magic Link Security
```text
In `apps/api/src/utils/magic-token.ts`, export a constant `MAGIC_TOKEN_REGEX` based on the current `TOKEN_BYTES`. Update `apps/api/src/services/draft.service.ts` to use this exported regex instead of the hardcoded one in `resolveActiveVersionFromToken`.
```
