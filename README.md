# Cash-Flow Forecaster

A small forecasting tool that takes your income and recurring bills and tells you the *exact day* your balance is going to be tightest this month — with enough lead time to actually do something about it.

Built as a take-home assessment: the goal wasn't feature volume, it was getting one hard part — overlapping weekly/monthly/annual billing cycles — right.

> [!IMPORTANT]
> This app predicts your **floor**, not your future. It assumes no spending beyond the recurring items you've entered — no groceries, no coffee, no one-off purchases. Think of it as "the lowest your balance can guarantee to be," not "what your balance will actually be."

## How it works

1. Every income/bill is stored as a rule: `{ name, amount, cycle, startDate }`.
2. Each rule is **expanded** into its concrete occurrences inside the current month (a weekly item → ~4 dates, monthly → 1, annual → 0 or 1).
3. All occurrences are merged into one list and sorted chronologically.
4. The list is walked once, tracking a running balance — recording every **local minimum**, not just the lowest point, since balance can dip, recover, and dip again later in the month.
5. The worst *upcoming* dip is turned into a lead-time insight: "N days from now, on the 24th," flagged urgent if that's fewer than 5 days out.

The trickiest part is step 2 — getting occurrence generation right for:

- Monthly items due on a day that doesn't exist every month (e.g. the 31st) — clamped to the month's actual last day.
- Weekly items anchored to a specific weekday, so which other bills they collide with shifts month to month.
- Annual items that may or may not fall inside the current forecast window.
- Items that start partway through the window (no occurrence generated before their start date).

This logic lives in [`lib/occurrences.ts`](lib/occurrences.ts) and [`lib/forecast.ts`](lib/forecast.ts), and is covered by [`lib/occurrences.test.ts`](lib/occurrences.test.ts) and [`lib/forecast.test.ts`](lib/forecast.test.ts).

## Features

- **Reports** — current balance, "when it gets tight," a revenue-forecast line chart, and a bills breakdown.
- **Calendar** — every income/bill occurrence laid out on a month grid.
- **List** — remaining income vs. bills this month, with running balance per item.
- **Inputs** — add/remove recurring items and set a balance checkpoint to anchor the forecast to reality.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com) with [shadcn/ui](https://ui.shadcn.com) components
- [Recharts](https://recharts.org) for the balance and breakdown charts
- [Vitest](https://vitest.dev) for the occurrence-generation and balance-walk test suites

No database — items and the balance checkpoint are persisted in a browser cookie (see [`lib/storage.ts`](lib/storage.ts)), which is enough for a single-user demo and keeps state working across Vercel's stateless serverless instances without provisioning anything.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Inputs → Reset to sample data** to load a demo set of income and bills, or add your own.

### Other scripts

```bash
npm test    # run the occurrence/forecast test suites
npm run lint
npm run build
```

## Project structure

```
app/                  Routes: reports (/), calendar, list, inputs
components/           UI components (charts, forms, tables, calendar grid)
lib/
  types.ts            CashFlowItem, BalanceCheckpoint
  occurrences.ts       Expands recurring items into dated occurrences
  forecast.ts          Walks balance, finds dips, builds the lead-time insight
  dashboardData.ts     Assembles everything each page needs from storage
  storage.ts           Cookie-backed persistence
```

## Documentation

Planning notes, architecture, and key technical decisions are written up in [`docs/documentation.pdf`](docs/documentation.pdf).
