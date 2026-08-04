import type { Transaction } from "@/types";
import Grilla from "./Grilla";
import Header from "./Header";

type Props = {
  transactions: Transaction[];
  selectedIndex: number;
  deletePurchase: (id: string) => Promise<void>;
  activeCardId: string;
  month: number;
};

export function Movimientos({
  transactions,
  selectedIndex,
  deletePurchase,
  activeCardId,
  month,
}: Props) {
  const totalForPeriod = transactions.reduce(
    (acc, p) => acc + p.totalAmount / Math.max(1, p.installments || 1),
    0,
  );

  function getMonthLabel(month: number, year: number) {
    const label = new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month, 1));

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <>
      <Header
        totalForPeriod={totalForPeriod}
        selectedPeriodLabel={getMonthLabel(month, Math.floor(selectedIndex / 12))}
        activeCardId={activeCardId}
        monthOffset={1}
      />
      <Grilla
        transactions={transactions}
        selectedIndex={selectedIndex}
        deletePurchase={deletePurchase}
        activeCardId={activeCardId}
        month={month}
      />
    </>
  );
}
