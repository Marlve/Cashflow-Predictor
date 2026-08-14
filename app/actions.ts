"use server";

import { revalidatePath } from "next/cache";
import { addItem } from "@/lib/storage";
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
