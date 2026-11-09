import { getCardPaymentsForYear } from "@/actions/cardPayment";
import { getExpenses } from "@/actions/expense";
import { getPaymentsForYear } from "@/actions/payment";
import { GetAllTransactions, GetCreditCardList } from "@/app/admin/cards/data";
import { Dashboard } from "@/components/Dashboard";
import { requireRoles } from "@/lib/auth-session";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireRoles([ROLES.ADMIN]);
  const [expenses, cards, purchases] = await Promise.all([
    getExpenses(),
    GetCreditCardList(),
    GetAllTransactions(),
  ]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const years =
    currentMonthIdx === 11 ? [currentYear, currentYear + 1] : [currentYear];
  const [paymentsByYear, cardPaymentsByYear] = await Promise.all([
    Promise.all(years.map(getPaymentsForYear)),
    Promise.all(years.map(getCardPaymentsForYear)),
  ]);

  return (
    <Dashboard
      expenses={expenses}
      cards={cards}
      purchases={purchases}
      payments={paymentsByYear.flat()}
      cardPayments={cardPaymentsByYear.flat()}
      currentYear={currentYear}
      currentMonthIdx={currentMonthIdx}
      currentDay={today.getDate()}
    />
  );
}
