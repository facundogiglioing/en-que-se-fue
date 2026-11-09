import type {
  CardPayment,
  CreditCard,
  Expense,
  Payment,
  Transaction,
} from "@/types";
import { getInstallmentInfo, shiftMonthYear } from "./utils";

export interface DashboardData {
  expenses: Expense[];
  cards: CreditCard[];
  purchases: Transaction[];
  payments: Payment[];
  cardPayments: CardPayment[];
}

export interface MonthlyPayment {
  key: string;
  type: "expense" | "card";
  entityId: string;
  name: string;
  detail: string;
  dueDay: number;
  estimatedAmount: number | null;
  amount: number | null;
  isPaid: boolean;
  paymentCode?: string;
  paidAt?: string;
}

export function getMonthlyPayments(
  data: DashboardData,
  month: number,
  year: number,
): MonthlyPayment[] {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const rows: MonthlyPayment[] = data.expenses.map((expense) => {
    const payment = data.payments.find(
      (item) =>
        item.expenseId === expense.id &&
        item.month === month &&
        item.year === year,
    );
    const isPaid = payment?.isPaid === true;
    return {
      key: `expense-${expense.id}`,
      type: "expense",
      entityId: expense.id,
      name: expense.name,
      detail: expense.category,
      dueDay: Math.min(lastDay, Math.max(1, expense.dueDate)),
      estimatedAmount: expense.estimatedAmount ?? null,
      amount:
        (isPaid ? payment.actualAmount : undefined) ??
        expense.estimatedAmount ??
        null,
      isPaid,
      paidAt: isPaid ? payment.paidAt : undefined,
      paymentCode: expense.electronicPaymentCode,
    };
  });

  for (const card of data.cards) {
    const consumption = card.paysInArrears
      ? shiftMonthYear(month, year, -1)
      : { month, year };
    const estimatedAmount = data.purchases
      .filter((purchase) => purchase.cardId === card.id)
      .reduce(
        (sum, purchase) =>
          sum +
          (getInstallmentInfo(purchase, consumption.month, consumption.year)
            ?.amount ?? 0),
        0,
      );
    const payment = data.cardPayments.find(
      (item) =>
        item.cardId === card.id && item.month === month && item.year === year,
    );
    const isPaid = payment?.isPaid === true;
    if (estimatedAmount === 0 && !isPaid) continue;
    rows.push({
      key: `card-${card.id}`,
      type: "card",
      entityId: card.id,
      name: card.name,
      detail: card.bank,
      dueDay: Math.min(lastDay, Math.max(1, card.dueDay)),
      estimatedAmount,
      amount: (isPaid ? payment.actualAmount : undefined) ?? estimatedAmount,
      isPaid,
      paidAt: isPaid ? payment.paidAt : undefined,
    });
  }

  return rows.sort(
    (a, b) =>
      Number(a.isPaid) - Number(b.isPaid) ||
      a.dueDay - b.dueDay ||
      a.name.localeCompare(b.name, "es"),
  );
}

export function getMonthlyTotals(rows: MonthlyPayment[]) {
  const paid = rows.reduce(
    (sum, row) => sum + (row.isPaid ? (row.amount ?? 0) : 0),
    0,
  );
  const pending = rows.reduce(
    (sum, row) => sum + (!row.isPaid ? (row.amount ?? 0) : 0),
    0,
  );
  return {
    total: paid + pending,
    paid,
    pending,
    paidCount: rows.filter((row) => row.isPaid).length,
    pendingCount: rows.filter((row) => !row.isPaid).length,
    unknownCount: rows.filter((row) => row.amount === null).length,
  };
}

export function formatDashboardMoney(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
