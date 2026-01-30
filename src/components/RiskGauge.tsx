import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  maxScore?: number;
  className?: string;
}

export function RiskGauge({ score, maxScore = 100, className }: RiskGaugeProps) {
  const percentage = (score / maxScore) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  const getRiskLevel = () => {
    if (percentage <= 30) return { label: "LOW", color: "text-success", glow: "text-glow" };
    if (percentage <= 60) return { label: "MEDIUM", color: "text-warning", glow: "" };
    return { label: "HIGH", color: "text-destructive", glow: "text-glow-danger" };
  };

  const risk = getRiskLevel();

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-64 h-32 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(142, 76%, 45%)" />
                <stop offset="50%" stopColor="hsl(38, 92%, 50%)" />
                <stop offset="100%" stopColor="hsl(0, 85%, 55%)" />
              </linearGradient>
            </defs>
            {/* Background track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="hsl(222, 30%, 15%)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Colored arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-primary to-primary/50 rounded-full shadow-[0_0_10px_hsl(180_100%_50%/0.5)]" />
        </div>

        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 rounded-full bg-card border-2 border-primary shadow-[0_0_15px_hsl(180_100%_50%/0.4)]" />
      </div>

      {/* Score display */}
      <div className="mt-4 text-center">
        <div className="font-mono text-5xl font-bold text-foreground">
          {score}
          <span className="text-2xl text-muted-foreground">/{maxScore}</span>
        </div>
        <div className={cn("mt-2 font-mono text-lg uppercase tracking-widest", risk.color, risk.glow)}>
          {risk.label} RISK
        </div>
      </div>
    </div>
  );
}
