import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Separator({
  className,
  orientation = "horizontal",
  label,
}: SeparatorProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        orientation === "horizontal" ? "h-px w-full bg-border" : "h-full w-px bg-border",
        className
      )}
    />
  );
}
