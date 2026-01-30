import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle } from "lucide-react";

interface DataSourceCardProps {
  name: string;
  icon: React.ReactNode;
  status: "pending" | "scanning" | "complete" | "error";
  findings?: number;
  className?: string;
}

export function DataSourceCard({
  name,
  icon,
  status,
  findings = 0,
  className,
}: DataSourceCardProps) {
  const statusConfig = {
    pending: {
      color: "text-muted-foreground",
      border: "border-muted",
      statusIcon: null,
      label: "Pending",
    },
    scanning: {
      color: "text-primary",
      border: "border-primary/50",
      statusIcon: <Loader2 className="w-4 h-4 animate-spin" />,
      label: "Scanning...",
    },
    complete: {
      color: "text-success",
      border: "border-success/50",
      statusIcon: <Check className="w-4 h-4" />,
      label: `${findings} findings`,
    },
    error: {
      color: "text-destructive",
      border: "border-destructive/50",
      statusIcon: <AlertCircle className="w-4 h-4" />,
      label: "Error",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "card-cyber rounded-lg p-4 transition-all duration-300",
        config.border,
        status === "scanning" && "animate-glow-pulse",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-muted", config.color)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{name}</h4>
          <div className={cn("flex items-center gap-1 text-xs font-mono", config.color)}>
            {config.statusIcon}
            <span>{config.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
