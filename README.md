# PMS Demo Web (Next.js)

Proof-of-concept web app that mirrors the workflow of the Excel PMS templates:

- Annual Plan (define indicators + targets)
- Quarterly Reviews (enter actuals + comments for Q1–Q4)
- Annual Report (totals, progress/variance, status badges)

No authentication: the demo user is hardcoded as **“Demo Social Worker”**.

## Requirements

- Node.js 18+

## Run locally

From this folder:

```bash
npm install
npx prisma migrate dev
npm run dev
```

Then open `http://localhost:3000`.

## Demo data

- Seed data is included (2 indicators + Q1 actuals).
- Use the **“Reset demo data”** button in the top banner at any time.

## Pages

- `/` Dashboard/Welcome (year selector + status cards)
- `/plan` Annual Plan (add/edit/delete indicators)
- `/review/q1` `/review/q2` `/review/q3` `/review/q4` Quarterly Reviews (enter actuals + comments; live calculations)
- `/report` Annual Report (read-only summary + Export to PDF/CSV)
- `/help` Help text

## Notes

- Persistence uses SQLite via Prisma (`dev.db`).
- Calculations are “Excel-safe”: divide-by-zero shows `—` (no `#VALUE!`, `#DIV/0!`, etc.).

