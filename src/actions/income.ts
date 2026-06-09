"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import type { Income, IncomeReceipt } from "@/types";

export async function getIncomes(): Promise<Income[]> {
  const db = await getDb();
  return db.data.incomes || [];
}

export async function createIncome(formData: FormData) {
  const db = await getDb();
  const newIncome: Income = {
    id: crypto.randomUUID(),
    name: formData.get("name") as string,
    category: formData.get("category") as any,
    expectedAmount: Number(formData.get("amount")),
    expectedDay: Number(formData.get("expectedDay")),
  };
  db.data.incomes.push(newIncome);
  await db.write();
  revalidatePath("/admin/income");
}

export async function updateIncome(id: string, formData: FormData) {
  const db = await getDb();
  const index = db.data.incomes.findIndex(i => i.id === id);

  if (index !== -1) {
    db.data.incomes[index] = {
      ...db.data.incomes[index],
      name: formData.get("name") as string,
      category: formData.get("category") as any,
      expectedAmount: Number(formData.get("amount")),
      expectedDay: Number(formData.get("expectedDay")),
    };
    await db.write();
    revalidatePath("/admin/income");
    revalidatePath("/");
  }
}

export async function deleteIncome(id: string) {
  const db = await getDb();
  db.data.incomes = db.data.incomes.filter((i) => i.id !== id);
  await db.write();
  revalidatePath("/admin/expenses");
  revalidatePath("/");
}

// Lógica para marcar como cobrado en el Dashboard
export async function toggleIncomeStatus(incomeId: string, month: number, year: number) {
  const db = await getDb();
  if (!db.data.incomeReceipts) db.data.incomeReceipts = [];

  const index = db.data.incomeReceipts.findIndex(
    r => r.incomeId === incomeId && r.month === month && r.year === year
  );

  if (index !== -1) {
    db.data.incomeReceipts.splice(index, 1);
  } else {
    db.data.incomeReceipts.push({
      id: crypto.randomUUID(),
      incomeId,
      month,
      year,
      isReceived: true,
      receivedAt: new Date().toISOString(),
    });
  }
  await db.write();
  revalidatePath("/");
}

export async function getIncomeReceipts(month: number, year: number): Promise<IncomeReceipt[]> {
  const db = await getDb();
  return (db.data.incomeReceipts || []).filter(r => r.month === month && r.year === year);
}
