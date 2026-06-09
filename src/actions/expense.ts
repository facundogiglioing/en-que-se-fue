"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import type { CategoryName, Expense } from "@/types";

export async function getExpenses(): Promise<Expense[]> {
  const db = await getDb();
  return db.data.expenses;
}

export async function getExpenseById(id: string | undefined): Promise<Expense | undefined> {
  if (!id) return undefined;

  const db = await getDb();
  return db.data.expenses.find((e) => e.id === id);
}

export async function createExpense(formData: FormData) {
  const db = await getDb();
  const newExpense: Expense = {
    id: crypto.randomUUID(),
    name: formData.get("name") as string,
    category: formData.get("category") as CategoryName,
    dueDate: Number(formData.get("dueDate")),
    estimatedAmount: Number(formData.get("amount")) || 0,
  };
  db.data.expenses.push(newExpense);
  await db.write();
  revalidatePath("/admin/expenses");
  revalidatePath("/");
}

export async function updateExpense(id: string, formData: FormData) {
  const db = await getDb();
  const index = db.data.expenses.findIndex(e => e.id === id);

  if (index !== -1) {
    db.data.expenses[index] = {
      ...db.data.expenses[index],
      name: formData.get("name") as string,
      category: formData.get("category") as CategoryName,
      dueDate: Number(formData.get("dueDate")),
      estimatedAmount: Number(formData.get("amount")) || 0,
    };
    await db.write();
    revalidatePath("/admin/expenses");
    revalidatePath("/");
  }
}

export async function deleteExpense(id: string) {
  const db = await getDb();
  db.data.expenses = db.data.expenses.filter((e) => e.id !== id);
  db.data.payments = db.data.payments.filter((p) => p.expenseId !== id); // Limpiamos pagos huérfanos
  await db.write();
  revalidatePath("/admin/expenses");
  revalidatePath("/");
}
