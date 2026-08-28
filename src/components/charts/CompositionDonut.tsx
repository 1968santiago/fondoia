import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { moneyShort, moneyFull } from "../../format";

const PALETTE = ["#0d9488", "#14b8a6", "#5eead4", "#0f766e", "#99f6e4", "#64748b", "#94a3b8", "#cbd5e1"];

export default function CompositionDonut({
  data,
  height = 240,
}: {
  data: Array<{ category: string; value: number }>;
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value) => moneyFull(Number(value))}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px -6px rgb(16 24 40 / 0.12)",
                fontSize: 13,
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-2">
        {data.map((d, i) => (
          <li key={d.category} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-slate-600">{d.category}</span>
            <span className="font-medium text-ink">{moneyShort(d.value)}</span>
            <span className="w-12 text-right text-xs text-slate-400">
              {total ? ((d.value / total) * 100).toFixed(1) : "0"}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}