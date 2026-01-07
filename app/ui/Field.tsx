import { ReactNode } from "react";

export default function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-800">{label}</div>
      {children}
      {error ? <div className="mt-1 text-sm text-red-600">{error}</div> : null}
    </label>
  );
}

