import { cn } from "@/lib/utils";
import { Check, Brain, Search, FileText, Shield } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const stages: Stage[] = [
  { id: "planner", name: "Planner", icon: <Brain className="w-5 h-5" /> },
  { id: "gather", name: "Gather", icon: <Search className="w-5 h-5" /> },
  { id: "generate", name: "Generate", icon: <FileText className="w-5 h-5" /> },
  { id: "evaluate", name: "Evaluate", icon: <Shield className="w-5 h-5" /> },
];

interface StageIndicatorProps {
  currentStage: number;
  className?: string;
}

export function StageIndicator({ currentStage, className }: StageIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 md:gap-4", className)}>
      {stages.map((stage, index) => {
        const isCompleted = index < currentStage;
        const isCurrent = index === currentStage;
        const isPending = index > currentStage;

        return (
          <div key={stage.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500",
                  isCompleted && "border-success bg-success/20 text-success",
                  isCurrent && "border-primary bg-primary/20 text-primary animate-glow-pulse",
                  isPending && "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stage.icon
                )}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-mono uppercase tracking-wider transition-colors duration-300",
                  isCompleted && "text-success",
                  isCurrent && "text-primary text-glow",
                  isPending && "text-muted-foreground"
                )}
              >
                {stage.name}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  "w-8 md:w-16 h-0.5 mx-2 transition-colors duration-500",
                  index < currentStage ? "bg-success" : "bg-muted-foreground/30"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
