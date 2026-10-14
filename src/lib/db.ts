import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type {
  CardPayment,
  CreditCard,
  Expense,
  Income,
  IncomeReceipt,
  Payment,
  Transaction,
} from "@/types";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta la variable de entorno DATABASE_URL.");
}

export const db = drizzle({
  client: neon(databaseUrl),
  schema,
  casing: "snake_case",
});

// Postgres devuelve null en columnas vacías; los tipos de la app usan campos opcionales.
export const toExpense = (
  row: typeof schema.expenses.$inferSelect,
): Expense => ({
  id: row.id,
  name: row.name,
  category: row.category,
  dueDate: row.dueDate,
  estimatedAmount: row.estimatedAmount ?? undefined,
  electronicPaymentCode: row.electronicPaymentCode ?? undefined,
});

export const toPayment = (
  row: typeof schema.payments.$inferSelect,
): Payment => ({
  id: row.id,
  expenseId: row.expenseId,
  month: row.month,
  year: row.year,
  isPaid: row.isPaid,
  paidAt: row.paidAt?.toISOString(),
  actualAmount: row.actualAmount ?? undefined,
});

export const toCardPayment = (
  row: typeof schema.cardPayments.$inferSelect,
): CardPayment => ({
  id: row.id,
  cardId: row.cardId,
  month: row.month,
  year: row.year,
  isPaid: row.isPaid,
  paidAt: row.paidAt?.toISOString(),
  actualAmount: row.actualAmount ?? undefined,
});

export const toIncome = (row: typeof schema.incomes.$inferSelect): Income => ({
  id: row.id,
  name: row.name,
  category: row.category,
  expectedAmount: row.expectedAmount,
  expectedDay: row.expectedDay,
});

export const toIncomeReceipt = (
  row: typeof schema.incomeReceipts.$inferSelect,
): IncomeReceipt => ({
  id: row.id,
  incomeId: row.incomeId,
  month: row.month,
  year: row.year,
  isReceived: row.isReceived,
  receivedAt: row.receivedAt?.toISOString(),
});

export const toCreditCard = (
  row: typeof schema.creditCards.$inferSelect,
): CreditCard => ({
  id: row.id,
  name: row.name,
  bank: row.bank,
  closingDay: row.closingDay,
  dueDay: row.dueDay,
  order: row.order,
  last4Digits: row.last4Digits,
  paysInArrears: row.paysInArrears,
});

export const toTransaction = (
  row: typeof schema.transactions.$inferSelect,
): Transaction => ({
  id: row.id,
  cardId: row.cardId,
  description: row.description,
  totalAmount: row.totalAmount,
  installments: row.installments,
  startMonth: row.startMonth,
  startYear: row.startYear,
  category: row.category,
  receiptNumber: row.receiptNumber ?? undefined,
  movementDate: row.movementDate ?? undefined,
});
