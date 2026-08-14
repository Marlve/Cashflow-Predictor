"use server";

import { revalidatePath } from "next/cache";
import { addItem, setBalanceCheckpoint } from "@/lib/storage";
import { todayISO } from "@/lib/occurrences";
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
  const date = String(formData.get("date") || todayISO());
  setBalanceCheckpoint({
    date,
    balance: Number(formData.get("balance")),
  });

  revalidatePath("/");
}
