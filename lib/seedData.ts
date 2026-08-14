import { CashFlowItem } from "./types";

// Fixed, well-past start dates so recurrence lands on the same day-of-month /
// weekday regardless of when this is run. Only the day-of-month (monthly),
// weekday (weekly), and month/day (annual) matter once expanded.
//
// Deliberately spread across the month (rather than one big paycheck vs. one
// rent bill) so the balance walk produces several local minima instead of one
// smooth slope — this is what the "find every dip, not just the lowest"
// behavior actually looks like in the UI. The weekly income (Mondays) and
// weekly bill (Thursdays) land on different weekdays every month regardless
// of how the calendar falls, so they alone produce a recurring zigzag; the
// monthly items layer bigger swings on top at fixed points in the month.
export function sampleItems(): CashFlowItem[] {
  // Pin the annual item to the current month/day so it's guaranteed to show
  // up in the forecast window no matter when this seed data is loaded.
  const now = new Date();
  const annualMonth = String(now.getUTCMonth() + 1).padStart(2, "0");

  return [
    { id: crypto.randomUUID(), name: "Salary", amount: 3200, cycle: "monthly", startDate: "2024-01-15", kind: "income" },
    { id: crypto.randomUUID(), name: "Freelance retainer", amount: 220, cycle: "weekly", startDate: "2024-01-01", kind: "income" }, // Mondays
    { id: crypto.randomUUID(), name: "Side gig payout", amount: 600, cycle: "monthly", startDate: "2024-01-28", kind: "income" },
    { id: crypto.randomUUID(), name: "Rent", amount: 1400, cycle: "monthly", startDate: "2024-01-01", kind: "bill" },
    { id: crypto.randomUUID(), name: "Groceries", amount: 130, cycle: "weekly", startDate: "2024-01-04", kind: "bill" }, // Thursdays
    { id: crypto.randomUUID(), name: "Subscriptions", amount: 70, cycle: "monthly", startDate: "2024-01-10", kind: "bill" },
    { id: crypto.randomUUID(), name: "Utilities", amount: 260, cycle: "monthly", startDate: "2024-01-18", kind: "bill" },
    { id: crypto.randomUUID(), name: "Credit card", amount: 700, cycle: "monthly", startDate: "2024-01-24", kind: "bill" },
    { id: crypto.randomUUID(), name: "Insurance renewal", amount: 900, cycle: "annual", startDate: `2022-${annualMonth}-20`, kind: "bill" },
  ];
}
