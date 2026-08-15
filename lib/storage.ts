import { BalanceCheckpoint, CashFlowItem } from "./types";

const items: CashFlowItem[] = [];
let balanceCheckpoint: BalanceCheckpoint | null = null;

export function addItem(item: CashFlowItem): void {
  items.push(item);
}

export function getItems(): CashFlowItem[] {
  return items;
}

export function resetItems(newItems: CashFlowItem[]): void {
  items.length = 0;
  items.push(...newItems);
}

export function removeItem(id: string): void {
  const index = items.findIndex((item) => item.id === id);
  if (index !== -1) items.splice(index, 1);
}

export function setBalanceCheckpoint(checkpoint: BalanceCheckpoint): void {
  balanceCheckpoint = checkpoint;
}

export function getBalanceCheckpoint(): BalanceCheckpoint | null {
  return balanceCheckpoint;
}

// Sorted for display in the stored-items list.
export function sortItems(list: CashFlowItem[]): CashFlowItem[] {
  return [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
}
