"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import type { Payment } from "@/types";

export async function getPayments(
  month: number,
  year: number,
): Promise<Payment[]> {
  const db = await getDb();
  return db.data.payments.filter((p) => p.month === month && p.year === year);
}

export async function getPaymentsForYear(year: number): Promise<Payment[]> {
  const db = await getDb();
  return db.data.payments.filter((p) => p.year === year);
}

export async function togglePaymentStatus(
  expenseId: string,
  month: number,
  year: number,
) {
  const db = await getDb();
  const index = db.data.payments.findIndex(
    (p) => p.expenseId === expenseId && p.month === month && p.year === year,
  );

  if (index !== -1) {
    db.data.payments.splice(index, 1);
  } else {
    db.data.payments.push({
      id: crypto.randomUUID(),
      expenseId,
      month,
      year,
      isPaid: true,
      paidAt: new Date().toISOString(),
    });
  }
  await db.write();
  revalidatePath("/");
}

export async function confirmExpensePayment(
  expenseId: string,
  month: number,
  year: number,
  actualAmount: number,
) {
  const db = await getDb();
  const index = db.data.payments.findIndex(
    (p) => p.expenseId === expenseId && p.month === month && p.year === year,
  );

  if (index !== -1) {
    db.data.payments[index] = {
      ...db.data.payments[index],
      isPaid: true,
      paidAt: new Date().toISOString(),
      actualAmount,
    };
  } else {
    db.data.payments.push({
      id: crypto.randomUUID(),
      expenseId,
      month,
      year,
      isPaid: true,
      paidAt: new Date().toISOString(),
      actualAmount,
    });
  }
  await db.write();
  revalidatePath("/");
}

export async function unconfirmExpensePayment(
  expenseId: string,
  month: number,
  year: number,
) {
  const db = await getDb();
  db.data.payments = db.data.payments.filter(
    (p) =>
      !(p.expenseId === expenseId && p.month === month && p.year === year),
  );
  await db.write();
  revalidatePath("/");
}
