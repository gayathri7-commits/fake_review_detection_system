interface ScoreBarProps {
  label: string;
  value: number;
  description: string;
  inverted?: boolean;
}

export function ScoreBar({ label, value, description, inverted = false }: ScoreBarProps) {
  const displayValue = Math.min(100, Math.max(0, value));
  const getColor = () => {
    const effective = inverted ? 100 - displayValue : displayValue;
    if (effective >= 65) return "bg-success";
    if (effective >= 35) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-muted-foreground">{displayValue}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor()}`}
          style={{ width: `${displayValue}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
