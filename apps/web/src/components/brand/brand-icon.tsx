import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Use CSS variables so stroke/fill match design tokens exactly (avoids text-* vs bg-* drift). */
const variantClass = {
  /** Primary brand blue #2563EB */
  brand: "text-[var(--color-brand-blue)]",
  /** Verification / success #10B981 */
  success: "text-[var(--color-brand-green)]",
  /** Secondary icons on white cards */
  muted: "text-slate-500",
} as const;

const sizeClass = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
  xl: "h-8 w-8",
} as const;

export type BrandIconVariant = keyof typeof variantClass;
export type BrandIconSize = keyof typeof sizeClass;

export function BrandIcon({
  icon: Icon,
  variant,
  size = "sm",
  className,
}: {
  icon: LucideIcon;
  variant: BrandIconVariant;
  size?: BrandIconSize;
  className?: string;
}) {
  return (
    <Icon
      className={cn("shrink-0", sizeClass[size], variantClass[variant], className)}
      aria-hidden={true}
    />
  );
}
