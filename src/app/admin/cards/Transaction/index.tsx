"use server";
import type { Transaction } from "@/types";
import TransactionGrid from "./Grid";
import TransactionHeader from "./Header";

type Props = {
  transactions: Transaction[];
  cardId: string;
  month: number;
};

export default async function Transactions({
  transactions,
  cardId,
  month,
}: Props) {
  const totalForPeriod = transactions.reduce(
    (acc, p) => acc + p.totalAmount / Math.max(1, p.installments || 1),
    0,
  );

  function getMonthLabel(month: number) {
    const currentYear = new Date().getFullYear();
    const label = new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric",
    }).format(new Date(currentYear, month, 1));

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <>
      <TransactionHeader
        totalForPeriod={totalForPeriod}
        selectedPeriodLabel={getMonthLabel(month)}
        cardId={cardId}
        monthOffset={1}
      />
      <TransactionGrid
        transactions={transactions}
        selectedIndex={1}
        activeCardId={cardId}
        month={month}
      />
    </>
  );
}