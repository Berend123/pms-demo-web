"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DemoBanner() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onReset() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (!res.ok) throw new Error(`Reset failed (${res.status})`);
      setMessage("Demo data reset.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(null), 2500);
    }
  }

  return (
    <div className="border-b bg-amber-50 print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Demo mode</span>
          <span className="text-slate-700">No login, single demo user.</span>
          {message ? <span className="text-slate-900">• {message}</span> : null}
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={busy}
          className="rounded-md border border-amber-200 bg-white px-3 py-1.5 font-medium text-slate-900 hover:bg-amber-100 disabled:opacity-60"
        >
          {busy ? "Resetting…" : "Reset demo data"}
        </button>
      </div>
    </div>
  );
}
