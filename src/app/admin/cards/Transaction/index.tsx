"use server";
import type { Transaction } from "@/types";
import { normalizeIndex } from "../utils";
import TransactionGrid from "./Grid";
import TransactionHeader from "./Header";

type Props = {
  transactions: Transaction[];
  cardId: string;
  selectedIndex: number;
};

export default async function Transactions({
  transactions,
  cardId,
  selectedIndex,
}: Props) {
  const totalForPeriod = transactions.reduce(
    (acc, p) => acc + p.totalAmount / Math.max(1, p.installments || 1),
    0,
  );

  function getMonthLabel(index: number) {
    const safeIndex = Number.isFinite(index)
      ? normalizeIndex(Math.trunc(index))
      : normalizeIndex(0);
    const year = Math.trunc(safeIndex / 100);
    const month = safeIndex % 100;
    const label = new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <>
      <TransactionHeader
        totalForPeriod={totalForPeriod}
        selectedPeriodLabel={getMonthLabel(selectedIndex)}
        cardId={cardId}
        selectedIndex={selectedIndex}
      />
      <TransactionGrid
        transactions={transactions}
        selectedIndex={selectedIndex}
        activeCardId={cardId}
        index={selectedIndex}
      />
    </>
  );
}
