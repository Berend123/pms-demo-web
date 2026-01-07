"use client";

import Button from "@/app/ui/Button";

type Row = {
  indicatorName: string;
  objectiveTitle: string;
  unit: string;
  annualTarget: number;
  quarterlyTarget: number;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  totalActual: number;
  annualProgressPct: number | null;
  annualVariancePct: number | null;
  status: { label: string };
};

function toCsvValue(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) return `"${s.replaceAll("\"", "\"\"")}"`;
  return s;
}

export default function ReportActions({ year, rows }: { year: number; rows: Row[] }) {
  function exportCsv() {
    const header = [
      "Objective",
      "Indicator",
      "Unit",
      "Annual target",
      "Quarterly target",
      "Q1 actual",
      "Q2 actual",
      "Q3 actual",
      "Q4 actual",
      "Total actual",
      "Annual progress %",
      "Annual variance %",
      "Status",
    ];

    const lines = [
      header.map(toCsvValue).join(","),
      ...rows.map((r) =>
        [
          r.objectiveTitle,
          r.indicatorName,
          r.unit,
          r.annualTarget,
          r.quarterlyTarget,
          r.q1 ?? "",
          r.q2 ?? "",
          r.q3 ?? "",
          r.q4 ?? "",
          r.totalActual,
          r.annualProgressPct ?? "",
          r.annualVariancePct ?? "",
          r.status.label,
        ]
          .map(toCsvValue)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `annual-report-${year}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    window.print();
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="secondary" onClick={exportPdf}>
        Export to PDF
      </Button>
      <Button type="button" variant="secondary" onClick={exportCsv}>
        Export to CSV
      </Button>
    </div>
  );
}

