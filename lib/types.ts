export type Cycle = "weekly" | "monthly" | "annual";
export type ItemKind = "income" | "bill";

export interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  startDate: string; // ISO date, YYYY-MM-DD
  kind: ItemKind;
}
