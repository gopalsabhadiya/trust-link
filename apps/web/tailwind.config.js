/**
 * TrustLink brand tokens (reference + tooling).
 *
 * Tailwind v4 applies theme from `src/app/globals.css` `@theme`.
 * Keep values in sync with `--color-*` there.
 *
 * Utilities: `bg-brand-blue`, `text-brand-green`, `bg-brand-navy`, `text-verified`, etc.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563EB",
          green: "#10B981",
          navy: "#1E293B",
        },
        verified: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
      },
    },
  },
};
