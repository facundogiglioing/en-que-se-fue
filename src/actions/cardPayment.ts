"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import type { CardPayment } from "@/types";

export async function getCardPaymentsForYear(year: number): Promise<CardPayment[]> {
  const db = await getDb();
  return (db.data.cardPayments ?? []).filter((p) => p.year === year);
}

export async function confirmCardPayment(
  cardId: string,
  month: number,
  year: number,
  actualAmount: number,
) {
  const db = await getDb();
  if (!db.data.cardPayments) db.data.cardPayments = [];

  const index = db.data.cardPayments.findIndex(
    (p) => p.cardId === cardId && p.month === month && p.year === year,
  );

  if (index !== -1) {
    db.data.cardPayments[index] = {
      ...db.data.cardPayments[index],
      isPaid: true,
      paidAt: new Date().toISOString(),
      actualAmount,
    };
  } else {
    db.data.cardPayments.push({
      id: crypto.randomUUID(),
      cardId,
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

export async function unconfirmCardPayment(
  cardId: string,
  month: number,
  year: number,
) {
  const db = await getDb();
  if (!db.data.cardPayments) return;
  db.data.cardPayments = db.data.cardPayments.filter(
    (p) => !(p.cardId === cardId && p.month === month && p.year === year),
  );
  await db.write();
  revalidatePath("/");
}
