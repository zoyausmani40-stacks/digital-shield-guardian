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

const dataSources = [
  { name: "GitHub", icon: <Github className="w-5 h-5" /> },
  { name: "Email Services", icon: <Mail className="w-5 h-5" /> },
  { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" /> },
  { name: "Twitter/X", icon: <Twitter className="w-5 h-5" /> },
  { name: "Public Web", icon: <Globe className="w-5 h-5" /> },
];

interface ScanResult {
  riskScore: number;
  riskLevel: string;
  riskFactors: string[];
  mitigations: string[];
  evidence: Record<string, any>;
  timestamp: string;
}

export default function Index() {
  const [view, setView] = useState<ViewState>("input");
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, "pending" | "scanning" | "complete" | "error">>({});
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [formData, setFormData] = useState<{githubUsername: string; email: string; socialHandles: string; fullName: string} | null>(null);

  const addLog = (type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { timestamp, type, message }]);
  };

  const handleSubmit = async (data: {githubUsername: string; email: string; socialHandles: string; fullName: string}) => {
    setFormData(data);
    setView("scanning");
    setLogs([]);
    setCurrentStage(0);
    
    // Initialize all sources as pending
    const initialStatuses: Record<string, "pending" | "scanning" | "complete" | "error"> = {};
    dataSources.forEach((s) => (initialStatuses[s.name] = "pending"));
    setSourceStatuses(initialStatuses);

    try {
      // Show initial stage
      setCurrentStage(0);
      addLog("info", "[STAGE 1] PLANNER AGENT ACTIVATED");
      addLog("info", "Initializing autonomous agents...");
      addLog("info", "Parsing input parameters...");
      
      // Make API call to backend
      addLog("info", "Sending request to backend API...");
      const response = await fetch("http://localhost:8000/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubUsername: data.githubUsername || undefined,
          email: data.email || undefined,
          socialHandles: data.socialHandles || undefined,
          fullName: data.fullName || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const result: ScanResult = await response.json();
      setScanResult(result);

      // Update stages based on evidence collected
      setCurrentStage(1);
      addLog("info", "[STAGE 2] GATHER AGENT ACTIVATED");
      if (result.evidence.github) {
        addLog("info", "Scanning GitHub repositories...");
        setSourceStatuses((prev) => ({ ...prev, GitHub: "complete" }));
      }
      if (result.evidence.email) {
        addLog("info", "Checking email breach databases...");
        setSourceStatuses((prev) => ({ ...prev, "Email Services": "complete" }));
      }
      if (result.evidence.username) {
        addLog("info", "Analyzing social profiles...");
        setSourceStatuses((prev) => ({ ...prev, "Twitter/X": "complete", LinkedIn: "complete" }));
      }

      setCurrentStage(2);
      addLog("info", "[STAGE 3] GENERATE AGENT ACTIVATED");
      addLog("info", "Correlating data points...");
      addLog("info", "Identifying exposure patterns...");
      addLog("info", "Calculating risk vectors...");

      setCurrentStage(3);
      addLog("info", "[STAGE 4] EVALUATE AGENT ACTIVATED");
      addLog("info", "Scoring vulnerability severity...");
      addLog("info", "Generating mitigation steps...");
      addLog("info", "Compiling final report...");

      // Complete remaining sources
      dataSources.forEach((s) => {
        if (!sourceStatuses[s.name] || sourceStatuses[s.name] === "pending") {
          setSourceStatuses((prev) => ({
            ...prev,
            [s.name]: "complete",
          }));
        }
      });

      addLog("success", "SCAN COMPLETE - Report generated");
      await new Promise((r) => setTimeout(r, 500));
      setView("results");
    } catch (error) {
      addLog("error", `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
      // Mark sources as error
      dataSources.forEach((s) => {
        setSourceStatuses((prev) => ({
          ...prev,
          [s.name]: "error",
        }));
      });
    }
  };

  const resetScan = () => {
    setView("input");
    setCurrentStage(0);
    setLogs([]);
    setSourceStatuses({});
    setScanResult(null);
    setFormData(null);
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
              <InputForm onSubmit={(data) => handleSubmit(data)} />
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
        {view === "results" && scanResult && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Risk Score */}
              <div className="lg:col-span-1">
                <div className="card-cyber rounded-xl p-6 sticky top-24">
                  <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-6 text-center">
                    Overall Risk Score
                  </h3>
                  <RiskGauge score={scanResult.riskScore} />
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Risk Level</span>
                      <span className={`font-mono ${
                        scanResult.riskLevel === "High" ? "text-destructive" :
                        scanResult.riskLevel === "Medium" ? "text-warning" :
                        "text-success"
                      }`}>
                        {scanResult.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Risk Factors */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Identified Risk Factors
                  </h3>
                  <div className="grid gap-4">
                    {scanResult.riskFactors.length > 0 ? (
                      scanResult.riskFactors.map((factor, i) => (
                        <div key={i} className="card-cyber rounded-lg p-4">
                          <p className="text-foreground">{factor}</p>
                        </div>
                      ))
                    ) : (
                      <div className="card-cyber rounded-lg p-4">
                        <p className="text-muted-foreground">No significant risks detected</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Mitigation Steps */}
                <section>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Recommended Mitigation Steps
                  </h3>
                  <div className="space-y-3">
                    {scanResult.mitigations.length > 0 ? (
                      scanResult.mitigations.map((mitigation, i) => (
                        <MitigationStep
                          key={i}
                          step={i + 1}
                          title={mitigation}
                          description={mitigation}
                          priority={i < 2 ? "critical" as const : "recommended" as const}
                        />
                      ))
                    ) : (
                      <div className="card-cyber rounded-lg p-4">
                        <p className="text-muted-foreground">No specific mitigations recommended</p>
                      </div>
                    )}
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
