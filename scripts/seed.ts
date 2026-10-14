// Copia los datos de src/data/database.json (lowdb) a Postgres. Se puede correr más de una vez.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/schema";
import type { DbSchema } from "../src/types";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta la variable de entorno DATABASE_URL.");
}

const db = drizzle({ client: neon(databaseUrl), casing: "snake_case" });
const data = JSON.parse(
  readFileSync("src/data/database.json", "utf8"),
) as DbSchema;

// La app mostraba los registros en el orden del JSON; createdAt lo preserva.
const seedStart = Date.now() - 24 * 60 * 60 * 1000;
const orderedAt = (position: number) => new Date(seedStart + position * 1000);
const toDate = (iso: string | undefined) => (iso ? new Date(iso) : null);

async function main() {
  const { expenses, payments, incomes, incomeReceipts, creditCards } = data;
  const { transactions, cardPayments } = data;

  if (expenses.length > 0) {
    await db
      .insert(schema.expenses)
      .values(
        expenses.map((e, i) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          dueDate: e.dueDate,
          estimatedAmount: e.estimatedAmount ?? null,
          electronicPaymentCode: e.electronicPaymentCode ?? null,
          createdAt: orderedAt(i),
        })),
      )
      .onConflictDoNothing();
  }

  if (payments.length > 0) {
    await db
      .insert(schema.payments)
      .values(
        payments.map((p) => ({
          id: p.id,
          expenseId: p.expenseId,
          month: p.month,
          year: p.year,
          isPaid: p.isPaid,
          paidAt: toDate(p.paidAt),
          actualAmount: p.actualAmount ?? null,
        })),
      )
      .onConflictDoNothing();
  }

  if (incomes.length > 0) {
    await db
      .insert(schema.incomes)
      .values(
        incomes.map((income, i) => ({
          id: income.id,
          name: income.name,
          category: income.category,
          expectedAmount: income.expectedAmount,
          expectedDay: income.expectedDay,
          createdAt: orderedAt(i),
        })),
      )
      .onConflictDoNothing();
  }

  if (incomeReceipts.length > 0) {
    await db
      .insert(schema.incomeReceipts)
      .values(
        incomeReceipts.map((r) => ({
          id: r.id,
          incomeId: r.incomeId,
          month: r.month,
          year: r.year,
          isReceived: r.isReceived,
          receivedAt: toDate(r.receivedAt),
        })),
      )
      .onConflictDoNothing();
  }

  if (creditCards.length > 0) {
    await db
      .insert(schema.creditCards)
      .values(
        creditCards.map((c, i) => ({
          id: c.id,
          name: c.name,
          bank: c.bank,
          closingDay: c.closingDay,
          dueDay: c.dueDay,
          order: i + 1,
          last4Digits: c.last4Digits,
          paysInArrears: !!c.paysInArrears,
          createdAt: orderedAt(i),
        })),
      )
      .onConflictDoNothing();
  }

  if (transactions.length > 0) {
    await db
      .insert(schema.transactions)
      .values(
        transactions.map((t, i) => ({
          id: t.id,
          cardId: t.cardId,
          description: t.description,
          totalAmount: t.totalAmount,
          installments: t.installments,
          startMonth: t.startMonth,
          startYear: t.startYear,
          category: t.category,
          receiptNumber: t.receiptNumber ?? null,
          movementDate: t.movementDate ?? null,
          createdAt: orderedAt(i),
        })),
      )
      .onConflictDoNothing();
  }

  if (cardPayments.length > 0) {
    await db
      .insert(schema.cardPayments)
      .values(
        cardPayments.map((p) => ({
          id: p.id,
          cardId: p.cardId,
          month: p.month,
          year: p.year,
          isPaid: p.isPaid,
          paidAt: toDate(p.paidAt),
          actualAmount: p.actualAmount ?? null,
        })),
      )
      .onConflictDoNothing();
  }

  console.log(
    `Migrados: ${expenses.length} gastos, ${payments.length} pagos, ${incomes.length} ingresos, ` +
    `${incomeReceipts.length} cobros, ${creditCards.length} tarjetas, ` +
    `${transactions.length} consumos, ${cardPayments.length} pagos de tarjeta.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
