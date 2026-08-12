import { getCardPaymentsForYear } from "@/actions/cardPayment";
import { getExpenses } from "@/actions/expense";
import { getPaymentsForYear } from "@/actions/payment";
import PanelHeader from "@/components/PanelHeader";
import { PaymentGrid } from "@/components/PaymentGrid";
import { getDb } from "@/lib/db";

export default async function DashboardPage() {
  const db = await getDb();
  const expenses = await getExpenses();
  const cards = db.data.creditCards || [];
  const purchases = db.data.transactions || [];

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  const payments = await getPaymentsForYear(currentYear);
  const cardPayments = await getCardPaymentsForYear(currentYear);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader
        title="Flujo de Caja"
        subTitle={`Proyección Anual ${currentYear}`}
        actions={
          <div className="text-right">
            <p className="text-xxs font-bold uppercase tracking-[0.2em] text-slate-400">
              Mes actual
            </p>
            <p className="text-lg font-black text-slate-900">
              {new Intl.DateTimeFormat("es", { month: "long" }).format(
                new Date(),
              )}
            </p>
          </div>
        }
      />


      <PaymentGrid
        expenses={expenses}
        cards={cards}
        purchases={purchases}
        payments={payments}
        cardPayments={cardPayments}
        currentYear={currentYear}
        currentMonthIdx={currentMonthIdx}
      />

    </div>
  );
}
