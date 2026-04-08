import { ShieldCheck } from "lucide-react";
import { BrandIcon } from "./brand-icon";
import { cn } from "@/lib/utils";

export function TrustLinkLogoMark({
  className,
  iconSize = "xl",
  showWordmark = true,
}: {
  className?: string;
  iconSize?: "lg" | "xl";
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrandIcon icon={ShieldCheck} variant="brand" size={iconSize} />
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-slate-800">TrustLink</span>
      )}
    </div>
  );
}
