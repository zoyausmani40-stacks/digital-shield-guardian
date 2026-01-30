import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface MitigationStepProps {
  step: number;
  title: string;
  description: string;
  priority: "critical" | "recommended" | "optional";
  completed?: boolean;
  className?: string;
}

export function MitigationStep({
  step,
  title,
  description,
  priority,
  completed = false,
  className,
}: MitigationStepProps) {
  const priorityConfig = {
    critical: {
      color: "text-destructive",
      badge: "bg-destructive/20 text-destructive border-destructive/30",
    },
    recommended: {
      color: "text-warning",
      badge: "bg-warning/20 text-warning border-warning/30",
    },
    optional: {
      color: "text-success",
      badge: "bg-success/20 text-success border-success/30",
    },
  };

  const config = priorityConfig[priority];

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 group",
        completed && "opacity-60",
        className
      )}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-muted font-mono font-bold text-primary">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <span>{step}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn("font-semibold", completed && "line-through text-muted-foreground")}>
            {title}
          </h4>
          <span className={cn("px-2 py-0.5 rounded text-xs font-mono uppercase border", config.badge)}>
            {priority}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
