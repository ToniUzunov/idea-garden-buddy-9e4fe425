import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
}

export function QuickActionCard({
  icon,
  title,
  description,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="quick-action-card w-full text-left"
    >
      <div className={cn("stat-card-icon flex-shrink-0", iconBgColor, iconColor)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
    </button>
  );
}
