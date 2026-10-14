"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, toExpense } from "@/lib/db";
import { expenses } from "@/lib/schema";
import type { CategoryName, Expense } from "@/types";

export async function getExpenses(): Promise<Expense[]> {
  const rows = await db
    .select()
    .from(expenses)
    .orderBy(asc(expenses.createdAt));
  return rows.map(toExpense);
}

export async function getExpenseById(
  id: string | undefined,
): Promise<Expense | undefined> {
  if (!id) return undefined;

  const [row] = await db.select().from(expenses).where(eq(expenses.id, id));
  return row ? toExpense(row) : undefined;
}

function expenseFromForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: formData.get("category") as CategoryName,
    dueDate: Number(formData.get("dueDate")),
    estimatedAmount: Number(formData.get("amount")) || 0,
    electronicPaymentCode:
      (formData.get("electronicPaymentCode") as string)?.trim() || null,
  };
}

export async function createExpense(formData: FormData) {
  await db.insert(expenses).values(expenseFromForm(formData));
  revalidatePath("/admin/expenses");
  revalidatePath("/");
}

export async function updateExpense(id: string, formData: FormData) {
  await db
    .update(expenses)
    .set(expenseFromForm(formData))
    .where(eq(expenses.id, id));
  revalidatePath("/admin/expenses");
  revalidatePath("/");
}

export async function deleteExpense(id: string) {
  // Los pagos asociados se borran en cascada.
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/admin/expenses");
  revalidatePath("/");
}
