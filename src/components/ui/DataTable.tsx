import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export interface Col<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => number | string;
  className?: string;
}

export default function DataTable<T>({
  cols,
  rows,
  onRowClick,
  empty = "Sin resultados",
  rowKey,
}: {
  cols: Col<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  empty?: string;
  rowKey: (row: T) => string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = cols.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const v = col.sortValue;
    return [...rows].sort((a, b) => {
      const x = v(a);
      const y = v(b);
      const cmp =
        typeof x === "string"
          ? (x as string).localeCompare(y as string, "es")
          : (x as number) - (y as number);
      return cmp * sort.dir;
    });
  }, [rows, sort, cols]);

  const toggle = (key: string) => {
    setSort((prev) =>
      prev && prev.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: 1 }
    );
  };

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center text-sm text-slate-400">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {cols.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 first:pl-0 last:pr-0 ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {c.sortValue ? (
                  <button
                    onClick={() => toggle(c.key)}
                    className={`inline-flex items-center gap-1 hover:text-ink ${
                      sort?.key === c.key ? "text-brand-700" : ""
                    }`}
                  >
                    {c.header}
                    {sort?.key === c.key &&
                      (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    {sort?.key !== c.key && <ArrowUpDown size={12} className="opacity-40" />}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-slate-100 last:border-0 ${
                onRowClick ? "cursor-pointer transition hover:bg-slate-50/80" : ""
              }`}
            >
              {cols.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 py-3.5 align-middle first:pl-0 last:pr-0 ${
                    c.align === "right" ? "text-right" : "text-left"
                  } ${c.className || ""}`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}