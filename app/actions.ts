"use server";

import { revalidatePath } from "next/cache";
import { addItem, getItems, setBalanceCheckpoint } from "@/lib/storage";
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

  revalidatePath("/");
}

export async function setBalanceAction(formData: FormData): Promise<void> {
  setBalanceCheckpoint({
    date: todayISO(),
    balance: Number(formData.get("balance")),
  });

  revalidatePath("/");
}

export async function seedAction(): Promise<void> {
  if (getItems().length === 0) {
    sampleItems().forEach(addItem);
  }

  revalidatePath("/");
}
