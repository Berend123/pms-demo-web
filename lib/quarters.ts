export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export const quarterRouteValues = ["q1", "q2", "q3", "q4"] as const;
export type QuarterRoute = (typeof quarterRouteValues)[number];

export function quarterFromRoute(value: string): Quarter | null {
  switch (value) {
    case "q1":
      return "Q1";
    case "q2":
      return "Q2";
    case "q3":
      return "Q3";
    case "q4":
      return "Q4";
    default:
      return null;
  }
}

export function quarterLabel(q: Quarter | QuarterRoute) {
  if (typeof q === "string") return q.toUpperCase();
  return q;
}

export function quarterEndDate(year: number, quarter: Quarter) {
  switch (quarter) {
    case "Q1":
      return new Date(year, 2, 31, 23, 59, 59, 999);
    case "Q2":
      return new Date(year, 5, 30, 23, 59, 59, 999);
    case "Q3":
      return new Date(year, 8, 30, 23, 59, 59, 999);
    case "Q4":
      return new Date(year, 11, 31, 23, 59, 59, 999);
  }
}

export const quarterOrder: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];
