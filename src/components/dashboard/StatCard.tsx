import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
}: StatCardProps) {
  return (
    <div className="stat-card flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <div className={cn("stat-card-icon", iconBgColor, iconColor)}>{icon}</div>
    </div>
  );
}
