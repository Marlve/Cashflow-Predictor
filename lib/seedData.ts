import { CashFlowItem } from "./types";

// Fixed, well-past start dates so recurrence lands on the same day-of-month /
// weekday regardless of when this is run. Only the day-of-month (monthly),
// weekday (weekly), and month/day (annual) matter once expanded.
export function sampleItems(): CashFlowItem[] {
  return [
    { id: crypto.randomUUID(), name: "Salary", amount: 3000, cycle: "monthly", startDate: "2024-01-25", kind: "income" },
    { id: crypto.randomUUID(), name: "Freelance", amount: 150, cycle: "weekly", startDate: "2024-01-01", kind: "income" },
    { id: crypto.randomUUID(), name: "Rent", amount: 1200, cycle: "monthly", startDate: "2024-01-01", kind: "bill" },
    { id: crypto.randomUUID(), name: "Netflix", amount: 55, cycle: "monthly", startDate: "2024-01-15", kind: "bill" },
    { id: crypto.randomUUID(), name: "Gym", amount: 40, cycle: "weekly", startDate: "2024-01-03", kind: "bill" },
    { id: crypto.randomUUID(), name: "Car insurance", amount: 1200, cycle: "annual", startDate: "2024-03-10", kind: "bill" },
  ];
}
