"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { CategoryName, CreditCard, Transaction } from "@/types";

export async function createCard(formData: FormData) {
  const db = await getDb();
  const maxOrder = Math.max(
    ...(db.data.creditCards?.map((c) => c.order) ?? [0]),
    0,
  );

  const newCard: CreditCard = {
    id: crypto.randomUUID(),
    name: formData.get("name") as string,
    bank: formData.get("bank") as string,
    last4Digits: formData.get("last4Digits") as string,
    closingDay: Number(formData.get("closingDay")),
    dueDay: Number(formData.get("dueDay")),
    order: maxOrder + 1,
  };

  if (!db.data.creditCards) db.data.creditCards = [];
  db.data.creditCards.push(newCard);
  await db.write();
  revalidatePath("/admin/cards");
  redirect(`/admin/cards?card=${newCard.id}`);
}

export async function updateCardDetails(formData: FormData) {
  const db = await getDb();
  const cardId = formData.get("cardId") as string;
  const name = (formData.get("name") as string)?.trim();
  const bank = (formData.get("bank") as string)?.trim();

  console.log(formData);

  if (!cardId || !name || !bank) return;

  const card = db.data.creditCards.find((c) => c.id === cardId);
  if (!card) return;

  card.name = name;
  card.bank = bank;
  await db.write();
  revalidatePath("/admin/cards");
  revalidatePath("/");
}

export async function deleteCard(id: string) {
  const db = await getDb();
  // Borramos la tarjeta
  db.data.creditCards = db.data.creditCards.filter((c) => c.id !== id);
  // IMPORTANTE: También borramos sus consumos asociados para no dejar basura
  db.data.transactions = db.data.transactions.filter((p) => p.cardId !== id);

  await db.write();
  revalidatePath("/admin/cards");
  revalidatePath("/");
}

// --- ACCIONES DE CONSUMOS ---

export async function addPurchase(formData: FormData) {
  const db = await getDb();
  const cardId = formData.get("cardId") as string;

  const startPeriod = formData.get("startPeriod") as string;
  let startMonth = new Date().getMonth();
  let startYear = new Date().getFullYear();

  if (startPeriod) {
    const [year, month] = startPeriod.split("-");
    startYear = parseInt(year, 10);
    startMonth = parseInt(month, 10) - 1; // Ajuste 0-11
  }

  const newPurchase: Transaction = {
    id: crypto.randomUUID(),
    cardId,
    description: formData.get("description") as string,
    totalAmount: Number(formData.get("amount")),
    installments: Number(formData.get("installments")) || 1,
    startMonth,
    startYear,
    category: (formData.get("category") as CategoryName) || "Otros",
  };

  if (!db.data.transactions) db.data.transactions = [];
  db.data.transactions.push(newPurchase);

  const cookieStore = await cookies();
  cookieStore.set("lastSelectedCardId", cardId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  await db.write();
  revalidatePath("/admin/cards");
  revalidatePath("/");
}

export async function updatePurchase(formData: FormData) {
  const db = await getDb();
  const id = formData.get("id") as string;
  const cardId = formData.get("cardId") as string;

  const startPeriod = formData.get("startPeriod") as string;
  let startMonth = new Date().getMonth();
  let startYear = new Date().getFullYear();

  if (startPeriod) {
    const [year, month] = startPeriod.split("-");
    startYear = parseInt(year, 10);
    startMonth = parseInt(month, 10) - 1;
  }

  const index = db.data.transactions.findIndex((p) => p.id === id);
  if (index === -1) return;

  db.data.transactions[index] = {
    ...db.data.transactions[index],
    cardId,
    description: formData.get("description") as string,
    totalAmount: Number(formData.get("amount")),
    installments: Number(formData.get("installments")) || 1,
    startMonth,
    startYear,
    category:
      (formData.get("category") as CategoryName) ||
      db.data.transactions[index].category ||
      "Otros",
  };

  const cookieStore = await cookies();
  cookieStore.set("lastSelectedCardId", cardId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  await db.write();
  revalidatePath("/admin/cards");
  revalidatePath("/");
}

export async function deletePurchase(id: string) {
  const db = await getDb();
  db.data.transactions = db.data.transactions.filter((p) => p.id !== id);
  await db.write();
  revalidatePath("/admin/cards");
  revalidatePath("/");
}
