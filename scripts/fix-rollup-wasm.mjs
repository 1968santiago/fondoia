import { existsSync, renameSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nm = path.join(root, "node_modules");
const rollup = path.join(nm, "rollup");
const wasm = path.join(nm, "@rollup", "wasm-node");
const backup = path.join(nm, "rollup-native");

if (existsSync(backup)) {
  console.log("[rollup] Ya aplicado el reemplazo por @rollup/wasm-node.");
  process.exit(0);
}
if (!existsSync(rollup) || !existsSync(wasm)) {
  console.log("[rollup] Reemplazo omitido (sin node_modules o sin @rollup/wasm-node).");
  process.exit(0);
}

renameSync(rollup, backup);
cpSync(wasm, rollup, { recursive: true });
console.log(
  "[rollup] Se usó @rollup/wasm-node en lugar del binario nativo para evitar bloqueos de políticas de seguridad de Windows. No afecta el bundle final ni el despliegue en Netlify."
);