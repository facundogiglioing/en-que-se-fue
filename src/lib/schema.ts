import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import type { CategoryName, Income } from "@/types";

const money = () => numeric({ precision: 14, scale: 2, mode: "number" });
const createdAt = () =>
  timestamp({ withTimezone: true }).notNull().defaultNow();

export const expenses = pgTable("expenses", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  category: text().$type<CategoryName>().notNull(),
  dueDate: integer().notNull(),
  estimatedAmount: money(),
  electronicPaymentCode: text(),
  createdAt: createdAt(),
});

export const payments = pgTable(
  "payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    expenseId: uuid()
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    month: integer().notNull(),
    year: integer().notNull(),
    isPaid: boolean().notNull().default(true),
    paidAt: timestamp({ withTimezone: true }),
    actualAmount: money(),
  },
  (t) => [unique().on(t.expenseId, t.month, t.year)],
);

export const incomes = pgTable("incomes", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  category: text().$type<Income["category"]>().notNull(),
  expectedAmount: money().notNull(),
  expectedDay: integer().notNull(),
  createdAt: createdAt(),
});

export const incomeReceipts = pgTable(
  "income_receipts",
  {
    id: uuid().primaryKey().defaultRandom(),
    incomeId: uuid()
      .notNull()
      .references(() => incomes.id, { onDelete: "cascade" }),
    month: integer().notNull(),
    year: integer().notNull(),
    isReceived: boolean().notNull().default(true),
    receivedAt: timestamp({ withTimezone: true }),
  },
  (t) => [unique().on(t.incomeId, t.month, t.year)],
);

export const creditCards = pgTable("credit_cards", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  bank: text().notNull(),
  closingDay: integer().notNull(),
  dueDay: integer().notNull(),
  order: integer().notNull().default(0),
  last4Digits: text().notNull(),
  paysInArrears: boolean().notNull().default(false),
  createdAt: createdAt(),
});

export const transactions = pgTable(
  "transactions",
  {
    id: uuid().primaryKey().defaultRandom(),
    cardId: uuid()
      .notNull()
      .references(() => creditCards.id, { onDelete: "cascade" }),
    description: text().notNull(),
    totalAmount: money().notNull(),
    installments: integer().notNull().default(1),
    startMonth: integer().notNull(),
    startYear: integer().notNull(),
    category: text().$type<CategoryName>().notNull(),
    receiptNumber: text(),
    movementDate: date({ mode: "string" }),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.cardId)],
);

export const cardPayments = pgTable(
  "card_payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    cardId: uuid()
      .notNull()
      .references(() => creditCards.id, { onDelete: "cascade" }),
    month: integer().notNull(),
    year: integer().notNull(),
    isPaid: boolean().notNull().default(true),
    paidAt: timestamp({ withTimezone: true }),
    actualAmount: money(),
  },
  (t) => [unique().on(t.cardId, t.month, t.year)],
);
