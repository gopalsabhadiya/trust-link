# TrustLink: AI Agent Development Instructions

## 1. Core Architectural Mandate
You must strictly follow a **3-Layer Architecture** for both Frontend and Backend. This ensures separation of concerns, scalability, and high testability.

### A. Frontend Layering (React/Next.js)
1.  **Component Layer (`/components`):** 
    *   **UI Components:** Pure, stateless, domain-agnostic (e.g., Shadcn buttons).
    *   **Feature Components:** Domain-aware (e.g., `EmployeeCard`). Handles layout but **never** performs direct API calls.
2.  **Service Layer (`/services` or `/hooks`):** 
    *   Contains business logic, state management, and data transformations.
    *   Acts as the mediator between the UI and the API.
3.  **API Integration Layer (`/api` or `/gateways`):** 
    *   The "Bridge." Pure fetch/axios calls. Handles headers, interceptors, and error parsing.

### B. Backend Layering (Node.js/TypeScript)
1.  **Controller Layer (`/controllers`):** 
    *   Handles HTTP requests/responses only.
    *   Validates input (using Zod) and delegates logic to the Service.
2.  **Service Layer (`/services`):** 
    *   The "Brain." Contains all business logic and orchestrates different repositories.
    *   **Never** interacts with the database directly.
3.  **Repository Layer (`/repositories`):** 
    *   The "Data Gate." Pure database queries (Prisma/Drizzle).
    *   Abstracts the database technology from the rest of the application.

---

## 2. Coding Principles & Standards
*   **SOLID Compliance:**
    *   **SRP:** Every function/class must have exactly one reason to change.
    *   **DIP:** High-level modules must depend on abstractions (interfaces), not concrete implementations.
*   **DRY (Don't Repeat Yourself):** Abstract repeating logic into utilities or higher-order components.
*   **Type Safety:** 100% TypeScript coverage. No `any`. Use strict interfaces for all API payloads and component props.
*   **Error Handling:** Implement a global error-handling strategy. Every API response must follow a standard `{ success: boolean, data: T, error: string }` format.

---

## 3. Project Structure Pattern
Organize code by **Domain (Features)**, not just by technical type:
```text
trustlink/
├── apps/
│   ├── web/                        # FRONTEND: Next.js (App Router)
│   │   └── src/
│   │       ├── app/                # Routes, Layouts, and Server Components
│   │       ├── components/ui/      # Atomic Shadcn components (Stateless)
│   │       ├── features/           # Domain-driven Features (The Core)
│   │       │   └── [feature_name]/ # e.g., 'issuance', 'verification'
│   │       │       ├── components/ # LAYER 1: Feature-specific UI
│   │       │       ├── hooks/      # LAYER 2: Services & Logic (useFeature)
│   │       │       └── api/        # LAYER 3: API Clients/Integration
│   │       └── lib/                # Shared FE utilities (auth-helpers, providers)
│   │
│   └── api/                        # BACKEND: Express Server
│       └── src/
│           ├── routes/             # Endpoint definitions & routing
│           ├── controllers/        # LAYER 1: Request/Response & Zod Validation
│           ├── services/           # LAYER 2: Business Logic (SSI, Signing, Credits)
│           ├── repositories/       # LAYER 3: Data Access (Prisma/Drizzle queries)
│           ├── middleware/         # Auth, Error Handling, DPDP Compliance
│           ├── config/             # DB connection & Env setup
│           └── index.ts            # Server Entry Point
│
├── packages/
│   └── shared/                     # SHARED: The "Contract" Layer
│       └── src/
│           ├── types/              # Unified TypeScript Interfaces
│           ├── schemas/            # Shared Zod Validation Schemas
│           └── constants/          # Shared Enums & Error Codes (e.g., Roles)
│
├── instructions.md                 # Architectural Guardrails
└── .cursor/rules/                  # Product Context (MDC)
```

## 4. Monorepo Workflow
- **Cross-App Awareness:** When modifying an API endpoint in `apps/api`, check if the corresponding type in `packages/shared` needs an update.
- **Type Syncing:** Always use the shared types for API requests and responses. Never redefine a 'User' or 'Credential' type locally in `apps/web` or `apps/api`.
- **Atomic Changes:** If a feature requires both a frontend change and a backend change, perform them in a single "Composer" session to maintain system integrity.

## 5. Mandatory File Placement Rules
To maintain the 3-layer architecture, follow these strict placement rules:

### A. For Frontend Tasks (`apps/web`):
1. **Components:** Place in `features/[feature]/components` for domain logic, or `components/ui` for pure UI.
2. **Business Logic (Services):** Create custom hooks in `features/[feature]/hooks`. These must manage state and call the API layer.
3. **API Calls:** Place in `features/[feature]/api`. Use a typed client.

### B. For Backend Tasks (`apps/api`):
1. **Entry Points:** Define routes in `src/routes`.
2. **Controllers:** Handle HTTP logic in `src/controllers`. Use Zod schemas from `@trustlink/shared` for validation.
3. **Services:** All "Trust" logic (Signing, Proofs, Credits) must live in `src/services`. No SQL/DB calls here.
4. **Repositories:** All Database interactions must live in `src/repositories`.

### C. Shared Logic:
- If a data type or validation schema is used by both FE and BE, it **MUST** be placed in `packages/shared`.

## 7. Navigation Standards

All internal route links in the frontend (`apps/web`) **must** use the Next.js `Link` component from `next/link` instead of plain `<a>` tags. This is non-negotiable.

### Rules:
1.  **Internal Routes → `<Link href="...">`:** Any navigation to a page within the app (e.g., `/login`, `/register`, `/dashboard`) must use `Link` to preserve SPA behavior (client-side transitions, no full page reloads).
2.  **Hash/Anchor Links → `<a href="#...">`:** Same-page scroll targets (e.g., `#features`, `#how-it-works`) may use standard `<a>` tags since they are not route transitions.
3.  **External URLs → `<a href="..." target="_blank" rel="noopener noreferrer">`:** Links to third-party sites use standard `<a>` tags with security attributes.

### Rationale:
Using `<a>` for internal routes causes a full browser reload, destroying SPA state, resetting scroll position, and degrading Core Web Vitals (increases LCP/FID). `next/link` prefetches routes and performs client-side navigation.

---

## 8. Vibe Coding Workflow

Before writing code, you (the AI Agent) must:

* **Analyze & Plan:** State which layers (Controller, Service, Repository) will be affected by the request.
* **Validate SOLID:** Briefly explain how the new code respects the Single Responsibility Principle.
* **Self-Correction:** After coding, verify: *"Did I put business logic in a Controller? Did I put a fetch call inside a React Component?"* If yes, refactor it.