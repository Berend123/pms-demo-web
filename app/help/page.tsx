import Card from "@/app/ui/Card";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help</h1>
        <p className="text-slate-700">A simple guided flow replacing the Excel macros and protected sheets.</p>
      </div>

      <Card title="Workflow">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Go to <span className="font-medium">Annual Plan</span> and add your indicators for the year (targets, units, notes).
          </li>
          <li>
            Use <span className="font-medium">Quarterly Review</span> pages (Q1–Q4) to enter actuals and short comments.
          </li>
          <li>
            Open <span className="font-medium">Annual Report</span> to see totals, progress/variance, and simple status badges.
          </li>
        </ol>
      </Card>

      <Card title="Why this is easier than Excel">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>No passwords/macros: the app shows only what you can edit on each page.</li>
          <li>No spreadsheet errors: calculations show friendly “—” when targets are 0.</li>
          <li>Demo reset: use the banner button to restore sample data at any time.</li>
        </ul>
      </Card>
    </div>
  );
}

