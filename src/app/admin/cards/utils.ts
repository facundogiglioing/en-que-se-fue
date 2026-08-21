
import { getDb } from "@/lib/db";

export async function GetPageData(cardId: string | undefined, index: number) {
  'use server'

  const db = await getDb();
  const cards = db.data.creditCards || [];
  const purchases = db.data.transactions || [];
  const card = cardId ? cards.find((c) => c.id === cardId) : cards[0];

  const transactions = card
    ? purchases
      .filter((p) => {
        if (p.cardId !== card.id) return false;
        const startIndex = p.startYear * 100 + (p.startMonth + 1);
        // Si es recurrente, no tiene fin; si no, termina con las cuotas
        const endIndex = p.isRecurring
          ? Infinity
          : startIndex + Math.max(1, p.installments || 1) - 1;
        return index >= startIndex && index <= endIndex;
      })
      .sort((a, b) => {
        const aStartIndex = a.startYear * 100 + (a.startMonth + 1);
        const bStartIndex = b.startYear * 100 + (b.startMonth + 1);

        if (aStartIndex !== bStartIndex) {
          return bStartIndex - aStartIndex;
        }

        return b.id.localeCompare(a.id);
      })
    : [];

  return {
    card,
    cards,
    purchases,
    transactions
  }

}

export async function GetCreditCardList() {
  'use server'

  const db = await getDb();
  const cards = db.data.creditCards || [];

  return cards
}

export function getCurrentIndex(): number {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

export function normalizeIndex(index: number): number {
  const year = Math.trunc(index / 100);
  const month = index % 100;

  if (month < 1 || month > 12) {
    return getCurrentIndex();
  }

  return year * 100 + month;
}

export function shiftIndex(index: number, monthDelta: number): number {
  const safeIndex = normalizeIndex(index);
  const year = Math.trunc(safeIndex / 100);
  const month = safeIndex % 100;

  const date = new Date(year, month - 1 + monthDelta, 1);

  return date.getFullYear() * 100 + (date.getMonth() + 1);
}