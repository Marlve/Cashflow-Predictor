import { Occurrence } from "./occurrences";

export const STARTING_BALANCE = 5000; // fallback used until a balance checkpoint is saved

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
