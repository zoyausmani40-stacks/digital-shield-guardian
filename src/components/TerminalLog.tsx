import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

interface TerminalLogProps {
  logs: LogEntry[];
  className?: string;
  autoScroll?: boolean;
}

export function TerminalLog({ logs, className, autoScroll = true }: TerminalLogProps) {
  const typeColors = {
    info: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error: "text-destructive",
  };

  return (
    <div
      className={cn(
        "bg-background/80 border border-border rounded-lg overflow-hidden font-mono text-sm",
        className
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <div className="w-3 h-3 rounded-full bg-destructive/80" />
        <div className="w-3 h-3 rounded-full bg-warning/80" />
        <div className="w-3 h-3 rounded-full bg-success/80" />
        <span className="ml-2 text-xs text-muted-foreground">agent_logs</span>
      </div>

      {/* Terminal content */}
      <div className="p-4 max-h-64 overflow-y-auto space-y-1">
        {logs.map((log, index) => (
          <div
            key={index}
            className="flex gap-2 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-muted-foreground">[{log.timestamp}]</span>
            <span className={typeColors[log.type]}>
              [{log.type.toUpperCase()}]
            </span>
            <span className="text-foreground">{log.message}</span>
          </div>
        ))}
        {logs.length > 0 && (
          <div className="flex items-center gap-1 text-primary">
            <span className="animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}
