import { CashFlowItem } from "./types";

const items: CashFlowItem[] = [];

export function addItem(item: CashFlowItem): void {
  items.push(item);
}

export function getItems(): CashFlowItem[] {
  return items;
}

export type SortKey = "date" | "month" | "year";

// Always sort by dates although year and month could be use to sort for the UI later if I may decide so.
export function sortItems(list: CashFlowItem[], key: SortKey): CashFlowItem[] {
  const sorted = [...list];
  switch (key) {
    case "date":
      sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
      break;
    case "year":
      sorted.sort(
        (a, b) => new Date(a.startDate).getFullYear() - new Date(b.startDate).getFullYear()
      );
      break;
    case "month":
      sorted.sort(
        (a, b) => new Date(a.startDate).getMonth() - new Date(b.startDate).getMonth()
      );
      break;
  }
  return sorted;
}
