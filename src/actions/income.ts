"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, toIncome, toIncomeReceipt } from "@/lib/db";
import { incomeReceipts, incomes } from "@/lib/schema";
import type { Income, IncomeReceipt } from "@/types";

export async function getIncomes(): Promise<Income[]> {
  const rows = await db.select().from(incomes).orderBy(asc(incomes.createdAt));
  return rows.map(toIncome);
}

function incomeFromForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as Income["category"]) || "Otros",
    expectedAmount: Number(formData.get("amount")),
    expectedDay: Number(formData.get("expectedDay")),
  };
}

export async function createIncome(formData: FormData) {
  await db.insert(incomes).values(incomeFromForm(formData));
  revalidatePath("/admin/income");
}

export async function updateIncome(id: string, formData: FormData) {
  await db
    .update(incomes)
    .set(incomeFromForm(formData))
    .where(eq(incomes.id, id));
  revalidatePath("/admin/income");
  revalidatePath("/");
}

export async function deleteIncome(id: string) {
  await db.delete(incomes).where(eq(incomes.id, id));
  revalidatePath("/admin/expenses");
  revalidatePath("/");
}

// Lógica para marcar como cobrado en el Dashboard
export async function toggleIncomeStatus(
  incomeId: string,
  month: number,
  year: number,
) {
  const deleted = await db
    .delete(incomeReceipts)
    .where(
      and(
        eq(incomeReceipts.incomeId, incomeId),
        eq(incomeReceipts.month, month),
        eq(incomeReceipts.year, year),
      ),
    )
    .returning({ id: incomeReceipts.id });

  if (deleted.length === 0) {
    await db.insert(incomeReceipts).values({
      incomeId,
      month,
      year,
      isReceived: true,
      receivedAt: new Date(),
    });
  }
  revalidatePath("/");
}

export async function getIncomeReceipts(
  month: number,
  year: number,
): Promise<IncomeReceipt[]> {
  const rows = await db
    .select()
    .from(incomeReceipts)
    .where(and(eq(incomeReceipts.month, month), eq(incomeReceipts.year, year)));
  return rows.map(toIncomeReceipt);
}
