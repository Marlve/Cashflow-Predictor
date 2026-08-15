import { getBalanceCheckpoint, getItems, sortItems } from "./storage";
import { currentMonthWindow, expandAll, ForecastWindow, Occurrence, todayISO } from "./occurrences";
import {
  BalancePoint,
  LeadTimeInsight,
  STARTING_BALANCE,
  anchorStartingBalance,
  findLocalMinima,
  getLeadTimeInsight,
  walkBalance,
} from "./forecast";
import { BalanceCheckpoint, CashFlowItem } from "./types";

export interface DashboardData {
  items: CashFlowItem[];
  window: ForecastWindow;
  allOccurrences: Occurrence[];
  occurrences: Occurrence[];
  checkpoint: BalanceCheckpoint | null;
  currentBalance: number;
  monthStartBalance: number;
  trajectory: BalancePoint[];
  dips: BalancePoint[];
  leadTimeInsight: LeadTimeInsight | null;
  balanceByDate: Map<string, number>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [rawItems, checkpoint] = await Promise.all([getItems(), getBalanceCheckpoint()]);
  const items = sortItems(rawItems);
  const window = currentMonthWindow();
  const allOccurrences = expandAll(rawItems, window);

  const currentBalance = checkpoint ? checkpoint.balance : STARTING_BALANCE;
  const monthStartBalance = checkpoint
    ? anchorStartingBalance(allOccurrences, checkpoint)
    : STARTING_BALANCE;

  // "Upcoming activity" only ever needs what's still ahead of the checkpoint.
  const occurrences = checkpoint
    ? allOccurrences.filter((occ) => occ.date > checkpoint.date)
    : allOccurrences;

  // Walk the whole month, anchored so it lands exactly on the checkpoint's
  // reported balance at checkpoint.date - this is what lets the chart show
  // real history before the checkpoint instead of a flat line.
  const trajectory = walkBalance(allOccurrences, monthStartBalance);
  const dips = findLocalMinima(trajectory, monthStartBalance);
  const balanceByDate = new Map(trajectory.map((point) => [point.date, point.balance]));
  const leadTimeInsight = getLeadTimeInsight(dips, todayISO());

  return {
    items,
    window,
    allOccurrences,
    occurrences,
    checkpoint,
    currentBalance,
    monthStartBalance,
    trajectory,
    dips,
    leadTimeInsight,
    balanceByDate,
  };
}
