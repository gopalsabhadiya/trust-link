import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandIcon, type BrandIconVariant } from "./brand-icon";
import { cn } from "@/lib/utils";

export function DashboardMetricCard({
  title,
  icon,
  iconVariant,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  iconVariant: BrandIconVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-800">{title}</CardTitle>
        <BrandIcon icon={icon} variant={iconVariant} size="sm" />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function DashboardSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-slate-200 bg-white shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-slate-600">{description}</CardDescription>
        ) : null}
      </CardHeader>
      {children ? <CardContent className="text-sm text-slate-600">{children}</CardContent> : null}
    </Card>
  );
}
