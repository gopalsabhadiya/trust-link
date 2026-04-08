import { cn } from "@/lib/utils";

export function DashboardPageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">
        {title}
      </h1>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
