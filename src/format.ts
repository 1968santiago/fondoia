const num0 = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const num2 = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2, minimumFractionDigits: 0 });

export function moneyFull(n: number): string {
  return `$ ${num0.format(Math.round(n))}`;
}

export function money(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toLocaleString("es-AR", { maximumFractionDigits: 2 })} MM`;
  if (n >= 1e6) return `$${(n / 1e6).toLocaleString("es-AR", { maximumFractionDigits: 0 })} M`;
  return moneyFull(n);
}

export function moneyShort(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toLocaleString("es-AR", { maximumFractionDigits: 2 })} MM`;
  if (n >= 1e6) return `$${String(Math.round(n / 1e5) / 10).replace(".", ",")} M`;
  return num0.format(n);
}

export function pct(x: number, digits = 1): string {
  const d = num2Format(x, digits);
  return `${x > 0 ? "+" : ""}${d}%`;
}

function num2Format(x: number, digits: number): string {
  return x.toLocaleString("es-AR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function pctPlain(x: number, digits = 1): string {
  return `${num2Format(x, digits)}%`;
}

export function noSign(x: number): string {
  return num2.format(x);
}

export function dateShort(isoDate: string): string {
  if (!isoDate) return "-";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function monthLabel(isoDate: string): string {
  const [y, m] = isoDate.split("-");
  const month = new Date(Date.UTC(Number(y), Number(m) - 1, 1))
    .toLocaleDateString("es-AR", { month: "short" })
    .replace(".", "");
  return `${month} ${String(Number(y)).slice(2)}`;
}

export function monthFull(isoDate: string): string {
  const [y, m] = isoDate.split("-");
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return `${date.toLocaleDateString("es-AR", { month: "long" })} ${y}`;
}

export function shortName(legalName: string): string {
  return legalName;
}