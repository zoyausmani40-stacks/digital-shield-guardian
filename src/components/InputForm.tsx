import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Mail, AtSign, User, Scan } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  className?: string;
}

interface FormData {
  githubUsername: string;
  email: string;
  socialHandles: string;
  fullName: string;
}

export function InputForm({ onSubmit, className }: InputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    githubUsername: "",
    email: "",
    socialHandles: "",
    fullName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isValid = formData.githubUsername || formData.email || formData.socialHandles;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            variant="cyber"
            placeholder="Full Name (optional)"
            value={formData.fullName}
            onChange={handleChange("fullName")}
            className="pl-12"
          />
        </div>

        <div className="relative">
          <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            variant="cyber"
            placeholder="GitHub Username"
            value={formData.githubUsername}
            onChange={handleChange("githubUsername")}
            className="pl-12"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            variant="cyber"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange("email")}
            className="pl-12"
          />
        </div>

        <div className="relative">
          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            variant="cyber"
            placeholder="Social Handles (Twitter, LinkedIn, etc.)"
            value={formData.socialHandles}
            onChange={handleChange("socialHandles")}
            className="pl-12"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="cyber"
        size="xl"
        className="w-full"
        disabled={!isValid}
      >
        <Scan className="w-5 h-5 mr-2" />
        Initialize Scan
      </Button>

      <p className="text-xs text-center text-muted-foreground font-mono">
        We only analyze publicly available information
      </p>
    </form>
  );
}
