import { CashFlowItem } from "./types";

// Same fields as CashFlowItem, except `id` (an item's own identity) becomes
// `itemId` (a reference back to it), and `startDate` (the recurrence anchor)
// becomes `date` (one computed, expanded instance of that recurrence).
export interface Occurrence extends Omit<CashFlowItem, "id" | "startDate"> {
  date: string; // ISO YYYY-MM-DD
  itemId: string;
}

export interface ForecastWindow {
  start: string; // ISO YYYY-MM-DD, inclusive
  end: string; // ISO YYYY-MM-DD, inclusive
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function parseISO(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

function toISO(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

// month is 1-indexed. Date.UTC's month param is 0-indexed, so passing `month`
// (not month-1) means "day 0 of month+1", i.e. the last day of `month`.
function daysInMonth(y: number, month: number): number {
  return new Date(Date.UTC(y, month, 0)).getUTCDate();
}

function clampDay(day: number, y: number, m: number): number {
  return Math.min(day, daysInMonth(y, m));
}

function makeOccurrence(item: CashFlowItem, date: string): Occurrence {
  return {
    date,
    amount: item.amount,
    name: item.name,
    cycle: item.cycle,
    kind: item.kind,
    itemId: item.id,
  };
}

function inRange(dateStr: string, item: CashFlowItem, window: ForecastWindow): boolean {
  return dateStr >= item.startDate && dateStr >= window.start && dateStr <= window.end;
}

// Loops months and year by converting year into amount of months example, the year 2000 is equal to 24000 months.
// The for loop already ensures that a billingg past the current month window would not create an occurence
// however inRange() also makes sure of this. (Techincally only being used by expandWeeks but kept as it is light regardless.)
function expandMonthly(item: CashFlowItem, window: ForecastWindow): Occurrence[] {
  const start = parseISO(item.startDate);
  const wStart = parseISO(window.start);
  const wEnd = parseISO(window.end);

  const startIdx = start.y * 12 + (start.m - 1);
  const windowStartIdx = wStart.y * 12 + (wStart.m - 1);
  const windowEndIdx = wEnd.y * 12 + (wEnd.m - 1);

  const results: Occurrence[] = [];
  for (let idx = Math.max(startIdx, windowStartIdx); idx <= windowEndIdx; idx++) {
    const y = Math.floor(idx / 12);
    const m = (idx % 12) + 1;
    const dateStr = toISO(y, m, clampDay(start.d, y, m));
    if (inRange(dateStr, item, window)) {
      results.push(makeOccurrence(item, dateStr));
    }
  }
  return results;
}

function expandAnnual(item: CashFlowItem, window: ForecastWindow): Occurrence[] {
  const start = parseISO(item.startDate);
  const wStart = parseISO(window.start);
  const wEnd = parseISO(window.end);

  const results: Occurrence[] = [];
  for (let y = Math.max(start.y, wStart.y); y <= wEnd.y; y++) {
    const dateStr = toISO(y, start.m, clampDay(start.d, y, start.m));
    if (inRange(dateStr, item, window)) {
      results.push(makeOccurrence(item, dateStr));
    }
  }
  return results;
}

function toEpoch(dateStr: string): number {
  const { y, m, d } = parseISO(dateStr);
  return Date.UTC(y, m - 1, d);
}

function epochToISO(epoch: number): string {
  const dt = new Date(epoch);
  return toISO(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

function expandWeekly(item: CashFlowItem, window: ForecastWindow): Occurrence[] {
  const startEpoch = toEpoch(item.startDate);
  const windowStartEpoch = toEpoch(window.start);
  const windowEndEpoch = toEpoch(window.end);

  const n =
    startEpoch < windowStartEpoch
      ? Math.ceil((windowStartEpoch - startEpoch) / WEEK_MS)
      : 0;

  const results: Occurrence[] = [];
  for (let epoch = startEpoch + n * WEEK_MS; epoch <= windowEndEpoch; epoch += WEEK_MS) {
    const dateStr = epochToISO(epoch);
    if (inRange(dateStr, item, window)) {
      results.push(makeOccurrence(item, dateStr));
    }
  }
  return results;
}

export function expandItem(item: CashFlowItem, window: ForecastWindow): Occurrence[] {
  switch (item.cycle) {
    case "monthly":
      return expandMonthly(item, window);
    case "annual":
      return expandAnnual(item, window);
    case "weekly":
      return expandWeekly(item, window);
  }
}

export function expandAll(items: CashFlowItem[], window: ForecastWindow): Occurrence[] {
  const all = items.flatMap((item) => expandItem(item, window));
  all.sort((a, b) => a.date.localeCompare(b.date));
  return all;
}

export function todayISO(): string {
  const now = new Date();
  return toISO(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
}

export function currentMonthWindow(): ForecastWindow {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  return {
    start: toISO(y, m, 1),
    end: toISO(y, m, daysInMonth(y, m)),
  };
}
