import { ShieldCheck } from "lucide-react";
import { BrandIcon } from "./brand-icon";
import { cn } from "@/lib/utils";

export function TrustLinkLogoMark({
  className,
  iconSize = "xl",
  showWordmark = true,
  /** Align shield to the same column as sidebar nav icons (`w-10`). */
  variant = "default",
}: {
  className?: string;
  iconSize?: "lg" | "xl";
  showWordmark?: boolean;
  variant?: "default" | "sidebar";
}) {
  return (
    <div className={cn("flex min-w-0 items-center", showWordmark ? "gap-2" : "gap-0", className)}>
      <span
        className={cn(
          "shrink-0 transition-transform duration-[320ms] ease-sidebar",
          variant === "sidebar" && "flex h-9 w-10 items-center justify-center",
          variant === "sidebar" && (showWordmark ? "scale-100" : "scale-[0.92]")
        )}
      >
        <BrandIcon icon={ShieldCheck} variant="brand" size={iconSize} />
      </span>
      <span
        className={cn(
          "inline-block overflow-hidden whitespace-nowrap text-lg font-bold tracking-tight text-slate-800 transition-sidebar-label",
          showWordmark ? "max-w-[7.5rem] opacity-100" : "max-w-0 opacity-0"
        )}
        aria-hidden={!showWordmark}
      >
        TrustLink
      </span>
    </div>
  );
}
