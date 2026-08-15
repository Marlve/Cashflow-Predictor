import { Occurrence } from "./occurrences";
import { BalanceCheckpoint } from "./types";

export const STARTING_BALANCE = 0; // used until a balance checkpoint is saved

// Days of notice we consider "enough time to act" on an upcoming low point
// (e.g. move money, delay a purchase). Below this, the card flags as urgent.
export const LEAD_TIME_DAYS = 5;

export interface BalancePoint {
  date: string; // ISO YYYY-MM-DD
  balance: number; // running balance immediately after that date's net delta
}

export function walkBalance(
  occurrences: Occurrence[],
  startingBalance: number
): BalancePoint[] {
  const trajectory: BalancePoint[] = [];
  let balance = startingBalance;
  let i = 0;
  while (i < occurrences.length) {
    const date = occurrences[i].date;
    let net = 0;
    while (i < occurrences.length && occurrences[i].date === date) {
      net += occurrences[i].kind === "income" ? occurrences[i].amount : -occurrences[i].amount;
      i++;
    }
    balance += net;
    trajectory.push({ date, balance });
  }
  return trajectory;
}

// A checkpoint is a manually-confirmed balance on some date, treated as
// ground truth. To show real history before it (instead of a flat line),
// walk backward from it: find the balance the month must have started at so
// that replaying every occurrence up to the checkpoint lands exactly on the
// checkpoint's reported balance.
export function anchorStartingBalance(
  occurrences: Occurrence[],
  checkpoint: BalanceCheckpoint
): number {
  const netBeforeCheckpoint = occurrences
    .filter((occ) => occ.date <= checkpoint.date)
    .reduce((sum, occ) => sum + (occ.kind === "income" ? occ.amount : -occ.amount), 0);
  return checkpoint.balance - netBeforeCheckpoint;
}

export function findLocalMinima(
  trajectory: BalancePoint[],
  startingBalance: number
): BalancePoint[] {
  const minima: BalancePoint[] = [];
  let prev = startingBalance;
  let trend: "down" | "up" | "flat" = "flat";
  let plateauStart: BalancePoint | null = null;

  for (const point of trajectory) {
    if (point.balance < prev) {
      trend = "down";
      plateauStart = point;
    } else if (point.balance > prev) {
      if (trend === "down" && plateauStart) minima.push(plateauStart);
      trend = "up";
      plateauStart = null;
    }
    prev = point.balance;
  }
  if (trend === "down" && plateauStart) minima.push(plateauStart);

  return minima;
}

function daysBetween(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / (24 * 60 * 60 * 1000));
}

export interface LeadTimeInsight {
  dip: BalancePoint;
  daysUntil: number;
  isUrgent: boolean; // fewer than LEAD_TIME_DAYS days of notice
}

// Turns "your balance is lowest on the 24th" into "you have N days to act",
// so the UI can lead with lead time instead of a bare date. Only considers
// dips from today onward — a dip that already happened isn't something to
// warn about, but it shouldn't hide a later, still-upcoming dip either.
export function getLeadTimeInsight(
  dips: BalancePoint[],
  today: string
): LeadTimeInsight | null {
  const upcoming = dips.filter((dip) => dip.date >= today);
  if (upcoming.length === 0) return null;
  const worst = upcoming.reduce((lowest, dip) => (dip.balance < lowest.balance ? dip : lowest));
  const daysUntil = daysBetween(today, worst.date);
  return {
    dip: worst,
    daysUntil,
    isUrgent: daysUntil <= LEAD_TIME_DAYS,
  };
}
