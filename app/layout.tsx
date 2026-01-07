import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import DemoBanner from "./ui/DemoBanner";

export const metadata: Metadata = {
  title: "PMS Demo (Web)",
  description: "Demo replacement for Excel PMS templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <DemoBanner />
        <header className="border-b bg-white print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-lg font-semibold">
              PMS Demo
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/">
                Dashboard
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/plan">
                Annual Plan
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/report">
                Annual Report
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/help">
                Help
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
