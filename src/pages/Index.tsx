import { useState, useEffect } from "react";
import { Shield, Fingerprint, Eye, Zap } from "lucide-react";
import { InputForm } from "@/components/InputForm";
import { StageIndicator } from "@/components/StageIndicator";
import { RiskGauge } from "@/components/RiskGauge";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { MitigationStep } from "@/components/MitigationStep";
import { TerminalLog } from "@/components/TerminalLog";
import { DataSourceCard } from "@/components/DataSourceCard";
import { Button } from "@/components/ui/button";
import { Github, Mail, Linkedin, Twitter, Globe, ArrowLeft } from "lucide-react";

type ViewState = "input" | "scanning" | "results";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

const mockVulnerabilities = [
  {
    title: "Email Address Exposed in Public Repos",
    description: "Your email address was found in 3 public GitHub repositories, making you vulnerable to targeted phishing attacks.",
    severity: "high" as const,
    category: "Data Exposure",
    details: ["Found in commit history", "Visible in package.json", "README.md contact section"],
  },
  {
    title: "Predictable Username Pattern",
    description: "The same username is used across multiple platforms, allowing attackers to easily map your digital identity.",
    severity: "medium" as const,
    category: "Identity Risk",
    details: ["GitHub: same handle", "Twitter: same handle", "LinkedIn: similar pattern"],
  },
  {
    title: "Location Data in Bio",
    description: "Your city and workplace are publicly visible, which could be used for social engineering attacks.",
    severity: "medium" as const,
    category: "Personal Info",
    details: ["City mentioned in GitHub bio", "Company name visible"],
  },
  {
    title: "2FA Status Unknown",
    description: "Unable to verify two-factor authentication status on all accounts. Consider enabling 2FA everywhere.",
    severity: "low" as const,
    category: "Account Security",
    details: ["Recommended for all accounts"],
  },
];

const mockMitigationSteps = [
  {
    step: 1,
    title: "Remove email from public commits",
    description: "Use GitHub's noreply email address to hide your real email from commit history.",
    priority: "critical" as const,
  },
  {
    step: 2,
    title: "Enable 2FA on all accounts",
    description: "Add two-factor authentication to GitHub, email, and all social media accounts.",
    priority: "critical" as const,
  },
  {
    step: 3,
    title: "Audit and update bios",
    description: "Remove or generalize location and workplace information from public profiles.",
    priority: "recommended" as const,
  },
  {
    step: 4,
    title: "Use unique usernames",
    description: "Consider using different handles for professional and personal accounts.",
    priority: "optional" as const,
  },
];

const dataSources = [
  { name: "GitHub", icon: <Github className="w-5 h-5" /> },
  { name: "Email Services", icon: <Mail className="w-5 h-5" /> },
  { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" /> },
  { name: "Twitter/X", icon: <Twitter className="w-5 h-5" /> },
  { name: "Public Web", icon: <Globe className="w-5 h-5" /> },
];

export default function Index() {
  const [view, setView] = useState<ViewState>("input");
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, "pending" | "scanning" | "complete" | "error">>({});

  const addLog = (type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { timestamp, type, message }]);
  };

  const handleSubmit = async () => {
    setView("scanning");
    setLogs([]);
    setCurrentStage(0);
    
    // Initialize all sources as pending
    const initialStatuses: Record<string, "pending" | "scanning" | "complete" | "error"> = {};
    dataSources.forEach((s) => (initialStatuses[s.name] = "pending"));
    setSourceStatuses(initialStatuses);

    // Simulate the 4-stage scanning process
    const stages = [
      { name: "Planner", logs: ["Initializing autonomous agents...", "Parsing input parameters...", "Creating scan strategy..."] },
      { name: "Gather", logs: ["Scanning GitHub repositories...", "Checking email breach databases...", "Analyzing social profiles..."] },
      { name: "Generate", logs: ["Correlating data points...", "Identifying exposure patterns...", "Calculating risk vectors..."] },
      { name: "Evaluate", logs: ["Scoring vulnerability severity...", "Generating mitigation steps...", "Compiling final report..."] },
    ];

    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(i);
      addLog("info", `[STAGE ${i + 1}] ${stages[i].name.toUpperCase()} AGENT ACTIVATED`);
      
      for (const log of stages[i].logs) {
        await new Promise((r) => setTimeout(r, 600));
        addLog("info", log);
        
        // Simulate data source scanning during gather phase
        if (i === 1) {
          const sourceIndex = stages[1].logs.indexOf(log);
          if (sourceIndex < dataSources.length) {
            setSourceStatuses((prev) => ({
              ...prev,
              [dataSources[sourceIndex].name]: "scanning",
            }));
            await new Promise((r) => setTimeout(r, 800));
            setSourceStatuses((prev) => ({
              ...prev,
              [dataSources[sourceIndex].name]: "complete",
            }));
          }
        }
      }
      
      addLog("success", `${stages[i].name} stage complete`);
      await new Promise((r) => setTimeout(r, 500));
    }

    // Complete remaining sources
    dataSources.forEach((s) => {
      setSourceStatuses((prev) => ({
        ...prev,
        [s.name]: prev[s.name] === "pending" ? "complete" : prev[s.name],
      }));
    });

    addLog("success", "SCAN COMPLETE - Report generated");
    await new Promise((r) => setTimeout(r, 1000));
    setView("results");
  };

  const resetScan = () => {
    setView("input");
    setCurrentStage(0);
    setLogs([]);
    setSourceStatuses({});
  };

  return (
    <div className="min-h-screen bg-background grid-cyber">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
              <Fingerprint className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">FootprintGuard</h1>
              <p className="text-xs font-mono text-muted-foreground">AUTONOMOUS RISK AGENT</p>
            </div>
          </div>
          {view !== "input" && (
            <Button variant="cyber-outline" size="sm" onClick={resetScan}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Scan
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Input View */}
        {view === "input" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6 animate-glow-pulse">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Digital Footprint</span>
                <br />
                <span className="text-foreground">Risk Analysis</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Our autonomous agents analyze your publicly visible online presence to identify 
                cyber risks and provide actionable security recommendations.
              </p>
            </div>

            <div className="card-cyber rounded-xl p-8">
              <InputForm onSubmit={handleSubmit} />
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              {[
                { icon: <Eye className="w-6 h-6" />, label: "Exposure Detection" },
                { icon: <Shield className="w-6 h-6" />, label: "Risk Scoring" },
                { icon: <Zap className="w-6 h-6" />, label: "Mitigation Steps" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="p-3 rounded-lg bg-muted/50">{item.icon}</div>
                  <span className="text-sm font-mono">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanning View */}
        {view === "scanning" && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Scanning in Progress</h2>
              <p className="text-muted-foreground font-mono text-sm">Autonomous agents are analyzing your digital footprint</p>
            </div>

            <StageIndicator currentStage={currentStage} className="mb-10" />

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Data Sources</h3>
                <div className="space-y-3">
                  {dataSources.map((source) => (
                    <DataSourceCard
                      key={source.name}
                      name={source.name}
                      icon={source.icon}
                      status={sourceStatuses[source.name] || "pending"}
                      findings={Math.floor(Math.random() * 5)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Agent Logs</h3>
                <TerminalLog logs={logs} />
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {view === "results" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Risk Score */}
              <div className="lg:col-span-1">
                <div className="card-cyber rounded-xl p-6 sticky top-24">
                  <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-6 text-center">
                    Overall Risk Score
                  </h3>
                  <RiskGauge score={67} />
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Data Exposure</span>
                      <span className="font-mono text-destructive">High</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Identity Risk</span>
                      <span className="font-mono text-warning">Medium</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Account Security</span>
                      <span className="font-mono text-success">Low</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Vulnerabilities */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Identified Vulnerabilities
                  </h3>
                  <div className="grid gap-4">
                    {mockVulnerabilities.map((vuln, i) => (
                      <VulnerabilityCard key={i} {...vuln} />
                    ))}
                  </div>
                </section>

                {/* Mitigation Steps */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Recommended Mitigation Steps
                  </h3>
                  <div className="space-y-3">
                    {mockMitigationSteps.map((step) => (
                      <MitigationStep key={step.step} {...step} />
                    ))}
                  </div>
                </section>

                {/* Action buttons */}
                <div className="flex gap-4 pt-4">
                  <Button variant="cyber" size="lg" className="flex-1">
                    Download Report
                  </Button>
                  <Button variant="cyber-outline" size="lg" onClick={resetScan}>
                    Scan Another Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            FootprintGuard v1.0 • Autonomous Digital Footprint Risk Agent
          </p>
        </div>
      </footer>
    </div>
  );
}
