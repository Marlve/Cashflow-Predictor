import { cookies } from "next/headers";
import { BalanceCheckpoint, CashFlowItem } from "./types";

// A plain in-memory module array only survives within a single long-lived
// Node process (e.g. `next dev`). On Vercel, requests can land on different
// serverless instances that don't share memory, so state would silently
// vanish. A cookie survives across instances without needing a database.
const COOKIE_NAME = "cashflow-data";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface StoredState {
  items: CashFlowItem[];
  checkpoint: BalanceCheckpoint | null;
}

async function readState(): Promise<StoredState> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return { items: [], checkpoint: null };
  try {
    return JSON.parse(raw) as StoredState;
  } catch {
    return { items: [], checkpoint: null };
  }
}

async function writeState(state: StoredState): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(state), {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

export async function addItem(item: CashFlowItem): Promise<void> {
  const state = await readState();
  state.items.push(item);
  await writeState(state);
}

export async function getItems(): Promise<CashFlowItem[]> {
  const state = await readState();
  return state.items;
}

export async function resetItems(newItems: CashFlowItem[]): Promise<void> {
  const state = await readState();
  state.items = newItems;
  await writeState(state);
}

export async function removeItem(id: string): Promise<void> {
  const state = await readState();
  state.items = state.items.filter((item) => item.id !== id);
  await writeState(state);
}

export async function setBalanceCheckpoint(checkpoint: BalanceCheckpoint): Promise<void> {
  const state = await readState();
  state.checkpoint = checkpoint;
  await writeState(state);
}

export async function getBalanceCheckpoint(): Promise<BalanceCheckpoint | null> {
  const state = await readState();
  return state.checkpoint;
}

// Sorted for display in the stored-items list.
export function sortItems(list: CashFlowItem[]): CashFlowItem[] {
  return [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
}
