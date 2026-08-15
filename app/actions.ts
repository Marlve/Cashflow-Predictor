"use server";

import { revalidatePath } from "next/cache";
import { addItem, removeItem, resetItems, setBalanceCheckpoint } from "@/lib/storage";
import { todayISO } from "@/lib/occurrences";
import { sampleItems } from "@/lib/seedData";
import { Cycle, ItemKind } from "@/lib/types";

export async function addItemAction(formData: FormData): Promise<void> {
  addItem({
    id: crypto.randomUUID(),
    name: String(formData.get("name")),
    amount: Number(formData.get("amount")),
    cycle: formData.get("cycle") as Cycle,
    startDate: String(formData.get("startDate")),
    kind: formData.get("kind") as ItemKind,
  });

  revalidatePath("/", "layout");
}

export async function removeItemAction(formData: FormData): Promise<void> {
  removeItem(String(formData.get("id")));

  revalidatePath("/", "layout");
}

export async function resetSampleDataAction(): Promise<void> {
  resetItems(sampleItems());

  revalidatePath("/", "layout");
}

export async function resetToZeroAction(): Promise<void> {
  resetItems([]);
  setBalanceCheckpoint({ date: todayISO(), balance: 0 });

  revalidatePath("/", "layout");
}

export async function setBalanceAction(formData: FormData): Promise<void> {
  const date = String(formData.get("date") || todayISO());
  setBalanceCheckpoint({
    date,
    balance: Number(formData.get("balance")),
  });

  revalidatePath("/", "layout");
}
