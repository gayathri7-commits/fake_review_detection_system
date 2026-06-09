import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ReviewDistributionChartProps {
  data: { real: number; fake: number; uncertain: number };
}

const COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(0, 72%, 51%)",
  "hsl(38, 92%, 50%)",
];

export function ReviewDistributionChart({ data }: ReviewDistributionChartProps) {
  const chartData = [
    { name: "Authentic", value: data.real },
    { name: "Fake", value: data.fake },
    { name: "Uncertain", value: data.uncertain },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value}%`, ""]}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: "0.8rem" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
