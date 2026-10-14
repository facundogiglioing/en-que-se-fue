"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, toCardPayment } from "@/lib/db";
import { cardPayments } from "@/lib/schema";
import type { CardPayment } from "@/types";

export async function getCardPaymentsForYear(
  year: number,
): Promise<CardPayment[]> {
  const rows = await db
    .select()
    .from(cardPayments)
    .where(eq(cardPayments.year, year));
  return rows.map(toCardPayment);
}

export async function confirmCardPayment(
  cardId: string,
  month: number,
  year: number,
  actualAmount: number,
) {
  const paidAt = new Date();
  await db
    .insert(cardPayments)
    .values({ cardId, month, year, isPaid: true, paidAt, actualAmount })
    .onConflictDoUpdate({
      target: [cardPayments.cardId, cardPayments.month, cardPayments.year],
      set: { isPaid: true, paidAt, actualAmount },
    });
  revalidatePath("/");
}

export async function unconfirmCardPayment(
  cardId: string,
  month: number,
  year: number,
) {
  await db
    .delete(cardPayments)
    .where(
      and(
        eq(cardPayments.cardId, cardId),
        eq(cardPayments.month, month),
        eq(cardPayments.year, year),
      ),
    );
  revalidatePath("/");
}
