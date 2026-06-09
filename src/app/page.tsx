import { getCardPaymentsForYear } from "@/actions/cardPayment";
import { getExpenses } from "@/actions/expense";
import { getPaymentsForYear } from "@/actions/payment";
import { PaymentGrid } from "@/components/PaymentGrid";
import { getDb } from "@/lib/db";

export default async function DashboardPage() {
  const db = await getDb();
  const expenses = await getExpenses();
  const cards = db.data.creditCards || [];
  const purchases = db.data.transactions || [];

  const currentYear = 2026;
  const currentMonthIdx = new Date().getMonth();

  const payments = await getPaymentsForYear(currentYear);
  const cardPayments = await getCardPaymentsForYear(currentYear);

  return (
    <div className="space-y-8">
      {/* HEADER DE BIENVENIDA O RESUMEN RÁPIDO */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            Flujo de Caja
          </h2>
          <p className="text-xxs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Proyección Anual {currentYear}
          </p>
        </div>
      </div>

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
