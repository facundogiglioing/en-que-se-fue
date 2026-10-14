"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, toPayment } from "@/lib/db";
import { payments } from "@/lib/schema";
import type { Payment } from "@/types";

const paymentFor = (expenseId: string, month: number, year: number) =>
  and(
    eq(payments.expenseId, expenseId),
    eq(payments.month, month),
    eq(payments.year, year),
  );

export async function getPayments(
  month: number,
  year: number,
): Promise<Payment[]> {
  const rows = await db
    .select()
    .from(payments)
    .where(and(eq(payments.month, month), eq(payments.year, year)));
  return rows.map(toPayment);
}

export async function getPaymentsForYear(year: number): Promise<Payment[]> {
  const rows = await db.select().from(payments).where(eq(payments.year, year));
  return rows.map(toPayment);
}

export async function togglePaymentStatus(
  expenseId: string,
  month: number,
  year: number,
) {
  const deleted = await db
    .delete(payments)
    .where(paymentFor(expenseId, month, year))
    .returning({ id: payments.id });

  if (deleted.length === 0) {
    await db
      .insert(payments)
      .values({ expenseId, month, year, isPaid: true, paidAt: new Date() });
  }
  revalidatePath("/");
}

export async function confirmExpensePayment(
  expenseId: string,
  month: number,
  year: number,
  actualAmount: number,
) {
  const paidAt = new Date();
  await db
    .insert(payments)
    .values({ expenseId, month, year, isPaid: true, paidAt, actualAmount })
    .onConflictDoUpdate({
      target: [payments.expenseId, payments.month, payments.year],
      set: { isPaid: true, paidAt, actualAmount },
    });
  revalidatePath("/");
}

export async function unconfirmExpensePayment(
  expenseId: string,
  month: number,
  year: number,
) {
  await db.delete(payments).where(paymentFor(expenseId, month, year));
  revalidatePath("/");
}
