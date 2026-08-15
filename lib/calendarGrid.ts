import { ForecastWindow } from "./occurrences";

export interface CalendarCell {
  date: string; // ISO YYYY-MM-DD
  day: number;
  inMonth: boolean;
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Builds a full-week grid (Sun-Sat rows) covering the given month window,
// padded with the trailing days of the previous/next month so every row has 7 cells.
export function buildMonthGrid(window: ForecastWindow): CalendarCell[] {
  const [sy, sm] = window.start.split("-").map(Number);
  const [, , ed] = window.end.split("-").map(Number);

  const firstOfMonth = new Date(Date.UTC(sy, sm - 1, 1));
  const leadingDays = firstOfMonth.getUTCDay(); // 0 = Sunday
  const lastOfMonth = new Date(Date.UTC(sy, sm - 1, ed));
  const trailingDays = 6 - lastOfMonth.getUTCDay();

  const cells: CalendarCell[] = [];

  for (let i = leadingDays; i > 0; i--) {
    const d = new Date(Date.UTC(sy, sm - 1, 1 - i));
    cells.push({ date: toISO(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()), day: d.getUTCDate(), inMonth: false });
  }

  for (let day = 1; day <= ed; day++) {
    cells.push({ date: toISO(sy, sm, day), day, inMonth: true });
  }

  for (let i = 1; i <= trailingDays; i++) {
    const d = new Date(Date.UTC(sy, sm - 1, ed + i));
    cells.push({ date: toISO(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()), day: d.getUTCDate(), inMonth: false });
  }

  return cells;
}
