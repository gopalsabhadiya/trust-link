# Brand Identity & UI Rules: TrustLink

## 1. Core Brand Concept
TrustLink is a decentralized recruitment platform focused on verifiable credentials and DPDP Act compliance. The visual style must be **professional, high-trust, and modern (Web3-adjacent but B2B focused).**

## 2. Color Palette & Theming
When generating CSS, Tailwind classes, or inline styles, strictly adhere to these brand colors:

| Role | Hex Code | Tailwind Class |
| :--- | :--- | :--- |
| **Primary (Trust Blue)** | `#2563EB` | `blue-600` |
| **Secondary (Verify Green)** | `#10B981` | `emerald-500` |
| **Primary Text (Navy)** | `#1E293B` | `slate-800` |
| **Secondary Text** | `#64748B` | `slate-500` |
| **Background (Light)** | `#F8FAFC` | `slate-50` |
| **Border / Stroke** | `#E2E8F0` | `slate-200` |

### Usage Rules:
- **Blue-600:** Use for primary CTA buttons, navigation links, and brand-heavy elements.
- **Emerald-500:** Strictly reserved for "Verified" statuses, success messages, and the "Check" icon.
- **Slate-800:** Use for all headings to ensure high readability and professional weight.

## 3. Logo & Iconography
- **Logo Symbol:** A linked chain where the right-hand link transitions into a sharp checkmark.
- **Icon Style:** Use `lucide-react` or similar clean, stroke-based icons.
- **Corners:** Use a standard radius of `0.375rem` (`rounded-md`) for buttons and `0.5rem` (`rounded-lg`) for cards. Do not use fully rounded "pill" shapes unless specified.

## 4. Development Constraints
- **Tailwind CSS:** Always use Tailwind classes for styling. Do not write raw CSS files unless necessary for animations.
- **Font:** Use a clean Sans-Serif stack (Inter, Geist, or system-sans).
- **Compliance UI:** Every data-collection form must include a `Checkbox` or `Toggle` for DPDP-compliant consent, using the `slate-500` for the legal micro-copy.
- **Contrast:** Ensure all text-to-background combinations meet WCAG AA accessibility standards.

## 5. Implementation in this repo (`apps/web`)
- **Source of truth:** `src/app/globals.css` → `@theme` defines semantic tokens (`background`, `foreground`, `primary`, `muted-foreground`, `brand-blue`, `brand-green`, `brand-navy`, `verified`, `card`, etc.).
- **Prefer semantic tokens:** Use `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `text-card-foreground` for layout and copy; use **`text-brand-blue` / `bg-brand-blue`** for trust/CTA accents; reserve **`text-brand-green` / `bg-brand-green`** (or `Badge variant="verified"`) for verified/success only.
- **Reference file:** `tailwind.config.js` mirrors names for tooling; the build reads CSS `@theme`.
