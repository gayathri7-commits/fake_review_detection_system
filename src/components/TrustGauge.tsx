import { useEffect, useState } from "react";

interface TrustGaugeProps {
  score: number;
  size?: number;
}

export function TrustGauge({ score, size = 180 }: TrustGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270 degree arc
  const offset = arc - (animatedScore / 100) * arc;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 65) return "hsl(var(--success))";
    if (s >= 35) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getLabel = (s: number) => {
    if (s >= 65) return "Trustworthy";
    if (s >= 35) return "Questionable";
    return "Unreliable";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(animatedScore)}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="gauge-ring"
          style={{ filter: `drop-shadow(0 0 6px ${getColor(animatedScore)}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-foreground">{animatedScore}%</span>
        <span className="text-sm font-medium text-muted-foreground">{getLabel(score)}</span>
      </div>
    </div>
  );
}
