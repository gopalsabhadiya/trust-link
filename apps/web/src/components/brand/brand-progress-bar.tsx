import { cn } from "@/lib/utils";

export function BrandProgressBar({
  value,
  className,
  trackClassName,
  labelId,
}: {
  /** 0–100 */
  value: number;
  className?: string;
  trackClassName?: string;
  /** For aria-labelledby */
  labelId?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full",
        "bg-[var(--color-dashboard-progress-track)]",
        trackClassName
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-labelledby={labelId}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-out",
          "bg-[var(--color-brand-blue)]",
          className
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
