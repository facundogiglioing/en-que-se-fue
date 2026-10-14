"use server";

import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { creditCards, transactions } from "@/lib/schema";
import type { CategoryName } from "@/types";

export async function createCard(formData: FormData) {
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(creditCards.order) })
    .from(creditCards);

  const [newCard] = await db
    .insert(creditCards)
    .values({
      name: formData.get("name") as string,
      bank: formData.get("bank") as string,
      last4Digits: formData.get("last4Digits") as string,
      closingDay: Number(formData.get("closingDay")),
      dueDay: Number(formData.get("dueDay")),
      order: Math.max(maxOrder ?? 0, 0) + 1,
      paysInArrears: formData.get("paysInArrears") === "on",
    })
    .returning({ id: creditCards.id });

  revalidatePath("/admin/cards");
  const now = new Date();
  const currentIndex = now.getFullYear() * 100 + (now.getMonth() + 1);
  redirect(`/admin/cards/${newCard.id}/${currentIndex}`);
}

export async function updateCardDetails(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const name = (formData.get("name") as string)?.trim();
  const bank = (formData.get("bank") as string)?.trim();
  const last4Digits = (formData.get("last4Digits") as string)?.trim();

  if (!cardId || !name || !bank) return;

  // Los campos en undefined no se actualizan y conservan el valor anterior.
  await db
    .update(creditCards)
    .set({
      name,
      bank,
      last4Digits: last4Digits || undefined,
      closingDay: Number(formData.get("closingDay")) || undefined,
      dueDay: Number(formData.get("dueDay")) || undefined,
      paysInArrears: formData.get("paysInArrears") === "on",
    })
    .where(eq(creditCards.id, cardId));
  revalidatePath("/admin/cards");
  revalidatePath("/");
}

export async function deleteCard(id: string) {
  // Los consumos y pagos de la tarjeta se borran en cascada.
  await db.delete(creditCards).where(eq(creditCards.id, id));
  revalidatePath("/admin/cards");
  revalidatePath("/");
}

// --- ACCIONES DE CONSUMOS ---

export async function addPurchase(formData: FormData) {
  const cardId = formData.get("cardId") as string;
  const selectedIndex = Number(formData.get("selectedIndex"));
  const installments = Math.max(1, Number(formData.get("installments")) || 1);
  const amountFromForm = Number(formData.get("amount"));
  const installmentAmount = Number(formData.get("installmentAmount"));

  const totalAmount =
    Number.isFinite(amountFromForm) && amountFromForm > 0
      ? amountFromForm
      : Number.isFinite(installmentAmount) && installmentAmount > 0
        ? installmentAmount * installments
        : 0;

  const startPeriod = formData.get("startPeriod") as string;
  let startMonth = new Date().getMonth();
  let startYear = new Date().getFullYear();

  if (startPeriod) {
    const [year, month] = startPeriod.split("-");
    startYear = parseInt(year, 10);
    startMonth = parseInt(month, 10) - 1; // Ajuste 0-11
  }

  const receiptNumber = (formData.get("receiptNumber") as string)?.trim();

  await db.insert(transactions).values({
    cardId,
    description: formData.get("description") as string,
    totalAmount,
    installments,
    startMonth,
    startYear,
    category: (formData.get("category") as CategoryName) || "Otros",
    receiptNumber: receiptNumber || null,
  });

  const cookieStore = await cookies();
  cookieStore.set("lastSelectedCardId", cardId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/admin/cards");
  revalidatePath("/");

  const now = new Date();
  const fallbackIndex = now.getFullYear() * 100 + (now.getMonth() + 1);
  const safeIndex = Number.isFinite(selectedIndex)
    ? Math.trunc(selectedIndex)
    : fallbackIndex;

  redirect(`/admin/cards/${cardId}/${safeIndex}`);
}

export async function updatePurchase(formData: FormData) {
  const id = formData.get("id") as string;
  const cardId = formData.get("cardId") as string;
  const selectedIndex = formData.get("selectedIndex") as string;
  const installments = Math.max(1, Number(formData.get("installments")) || 1);
  const amountFromForm = Number(formData.get("amount"));
  const installmentAmount = Number(formData.get("installmentAmount"));

  const totalAmount =
    Number.isFinite(amountFromForm) && amountFromForm > 0
      ? amountFromForm
      : Number.isFinite(installmentAmount) && installmentAmount > 0
        ? installmentAmount * installments
        : 0;

  const startPeriod = formData.get("startPeriod") as string;
  let startMonth = new Date().getMonth();
  let startYear = new Date().getFullYear();

  if (startPeriod) {
    const [year, month] = startPeriod.split("-");
    startYear = parseInt(year, 10);
    startMonth = parseInt(month, 10) - 1;
  }

  const receiptNumber = (formData.get("receiptNumber") as string)?.trim();

  const updated = await db
    .update(transactions)
    .set({
      cardId,
      description: formData.get("description") as string,
      totalAmount,
      installments,
      startMonth,
      startYear,
      // Sin categoría en el form se conserva la existente.
      category: (formData.get("category") as CategoryName) || undefined,
      receiptNumber: receiptNumber || null,
    })
    .where(eq(transactions.id, id))
    .returning({ id: transactions.id });
  if (updated.length === 0) return;

  const cookieStore = await cookies();
  cookieStore.set("lastSelectedCardId", cardId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/admin/cards");
  revalidatePath("/");

  const parsedIndex = Number(selectedIndex);
  const now = new Date();
  const fallbackIndex = now.getFullYear() * 100 + (now.getMonth() + 1);
  const safeIndex = Number.isFinite(parsedIndex) ? Math.trunc(parsedIndex) : fallbackIndex;
  redirect(`/admin/cards/${cardId}/${safeIndex}`);
}

export async function deletePurchase(id: string) {
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/admin/cards");
  revalidatePath("/");
}
