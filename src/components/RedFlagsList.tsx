import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { RedFlag } from "@/lib/analyzeReview";

interface RedFlagsListProps {
  flags: RedFlag[];
}

const severityConfig = {
  high: { icon: AlertTriangle, classes: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { icon: AlertCircle, classes: "bg-warning/10 text-warning border-warning/20" },
  low: { icon: Info, classes: "bg-primary/10 text-primary border-primary/20" },
};

export function RedFlagsList({ flags }: RedFlagsListProps) {
  if (flags.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
          <span className="text-success text-sm">✓</span>
        </div>
        <div>
          <p className="font-medium text-foreground">No Red Flags Detected</p>
          <p className="text-sm text-muted-foreground">This review appears authentic</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag, i) => {
        const config = severityConfig[flag.severity];
        const Icon = config.icon;
        return (
          <div key={i} className={`flex items-start gap-3 rounded-lg border p-4 ${config.classes}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{flag.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{flag.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
