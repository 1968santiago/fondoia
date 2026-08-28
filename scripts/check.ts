import { buildSeed } from "../src/data/seed";
import { runRules } from "../src/rules/engine";
import { fundRows, topHoldings } from "../src/data/services/funds";
import { totalPatrimony, totalFlows30, weightedRet30 } from "../src/data/services/kpis";
import { activeAlerts } from "../src/data/services/alerts";

const db = buildSeed();
runRules(db);

console.log("=== VOLUMEN ===");
console.log(
  "txs",
  db.transactions.length,
  "| holdings",
  db.holdings.length,
  "| metrics",
  db.dailyMetrics.length,
  "| investors",
  db.investors.length
);
console.log("patrimonio total:", Math.round(totalPatrimony(db)));
console.log("flows30 net:", Math.round(totalFlows30(db).net), "| weightedRet30:", weightedRet30(db).toFixed(2));

console.log("=== FONDOS ===");
for (const r of fundRows(db)) {
  const top = topHoldings(db, r.fund.id, 1)[0];
  console.log(
    r.fund.id,
    r.fund.shortName.padEnd(18),
    "patr",
    String(Math.round(r.patrimonio)).padStart(12),
    "ret30",
    r.ret30.toFixed(2).padStart(8),
    "ret90",
    r.ret90.toFixed(2).padStart(8),
    "vol30",
    r.vol30.toFixed(2).padStart(6),
    "flow30",
    r.flow.ratio.toFixed(2).padStart(7),
    "inv",
    String(r.investors).padStart(3),
    "top%",
    top ? top.pct.toFixed(1) : "-"
  );
}

console.log("=== ALERTAS ACTIVAS ===");
for (const a of activeAlerts(db)) {
  console.log(a.severity.padEnd(11), a.ruleId.padEnd(9), a.fundId, "|", a.title);
}