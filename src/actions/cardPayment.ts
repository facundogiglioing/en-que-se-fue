"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-session";
import { db, toCardPayment } from "@/lib/db";
import { ROLES } from "@/lib/roles";
import { cardPayments } from "@/lib/schema";
import type { CardPayment } from "@/types";

export async function getCardPaymentsForYear(
  year: number,
): Promise<CardPayment[]> {
  await requireRoles([ROLES.ADMIN]);
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
  await requireRoles([ROLES.ADMIN]);
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
  await requireRoles([ROLES.ADMIN]);
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
