import { ReactNode } from "react";

export default function Card({
  title,
  children,
  actions,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {(title || actions) && (
        <div className="mb-3 flex items-start justify-between gap-4">
          {title ? <h2 className="text-base font-semibold">{title}</h2> : <div />}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

