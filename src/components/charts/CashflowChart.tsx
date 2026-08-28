import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { moneyShort, moneyFull, monthLabel, monthFull } from "../../format";

export default function CashflowChart({
  data,
  height = 260,
}: {
  data: Array<{ label: string; subs: number; res: number }>;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
          <XAxis
            dataKey="label"
            tickFormatter={(l) => monthLabel(l)}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => moneyShort(Number(v))}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(value, name) => [
              moneyFull(Number(value)),
              name === "subs" ? "Suscripciones" : "Rescates",
            ]}
            labelFormatter={(l) => monthFull(String(l))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px -6px rgb(16 24 40 / 0.12)",
              fontSize: 13,
            }}
          />
          <Legend
            formatter={(v) => (v === "subs" ? "Suscripciones" : "Rescates")}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="subs" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="res" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}