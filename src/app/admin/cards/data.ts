import { asc, eq } from "drizzle-orm";
import { db, toCreditCard, toTransaction } from "@/lib/db";
import { creditCards, transactions } from "@/lib/schema";
import { shiftIndex } from "./utils";

// Separado de utils.ts porque ese archivo también se importa desde componentes cliente.

export async function GetCreditCardList() {
  const rows = await db
    .select()
    .from(creditCards)
    .orderBy(asc(creditCards.order), asc(creditCards.createdAt));
  return rows.map(toCreditCard);
}

export async function GetAllTransactions() {
  const rows = await db
    .select()
    .from(transactions)
    .orderBy(asc(transactions.createdAt));
  return rows.map(toTransaction);
}

export async function GetPageData(cardId: string | undefined, index: number) {
  const cards = await GetCreditCardList();
  const activeCard = cards.find((c) => c.id === cardId);

  // Si la tarjeta se paga a mes vencido, el resumen de "index" corresponde
  // a los consumos del mes anterior (los movimientos no cambian de fecha).
  const consumptionIndex = activeCard?.paysInArrears
    ? shiftIndex(index, -1)
    : index;

  const purchases = activeCard
    ? (
      await db
        .select()
        .from(transactions)
        .where(eq(transactions.cardId, activeCard.id))
        .orderBy(asc(transactions.createdAt))
    ).map(toTransaction)
    : [];

  const cardTransactions = purchases
    .filter((p) => {
      const startIndex = p.startYear * 100 + (p.startMonth + 1);
      if (consumptionIndex < startIndex) return false;
      const endIndex = shiftIndex(
        startIndex,
        Math.max(1, p.installments || 1) - 1,
      );
      return consumptionIndex <= endIndex;
    })
    .sort((a, b) => {
      const aStartIndex = a.startYear * 100 + (a.startMonth + 1);
      const bStartIndex = b.startYear * 100 + (b.startMonth + 1);

      if (aStartIndex !== bStartIndex) {
        return bStartIndex - aStartIndex;
      }

      return b.id.localeCompare(a.id);
    });

  return {
    cards,
    purchases,
    transactions: cardTransactions,
    consumptionIndex,
  };
}
