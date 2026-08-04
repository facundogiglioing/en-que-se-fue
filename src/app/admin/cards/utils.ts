import { getDb } from "@/lib/db";

export async function GetPageData(cardId: string | undefined, date: Date) {
  const db = await getDb();
  const cards = db.data.creditCards || [];
  const purchases = db.data.transactions || [];

  const selectedMonth = date.getMonth();
  const selectedYear = date.getFullYear();
  const selectedIndex = selectedYear * 12 + selectedMonth;

  const card = cardId ? cards.find((c) => c.id === cardId) : cards[0];

  const transactions = card
    ? purchases
      .filter((p) => {
        if (p.cardId !== card.id) return false;
        const startIndex = p.startYear * 12 + p.startMonth;
        // Si es recurrente, no tiene fin; si no, termina con las cuotas
        const endIndex = p.isRecurring
          ? Infinity
          : startIndex + Math.max(1, p.installments || 1) - 1;
        return selectedIndex >= startIndex && selectedIndex <= endIndex;
      })
      .sort((a, b) => {
        const aStartIndex = a.startYear * 12 + a.startMonth;
        const bStartIndex = b.startYear * 12 + b.startMonth;

        if (aStartIndex !== bStartIndex) {
          return bStartIndex - aStartIndex;
        }

        return b.id.localeCompare(a.id);
      })
    : [];

  return {
    cards,
    card,
    purchases,
    transactions
  }

}