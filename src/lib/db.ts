import { JSONFilePreset } from "lowdb/node";
import type { DbSchema } from "@/types";

export async function getDb() {
  const defaultData: DbSchema = {
    expenses: [], payments: [],
    incomes: [],
    incomeReceipts: [],
    creditCards: [],
    transactions: [],
    cardPayments: [],
  };
  // Guardamos todo en un solo archivo para facilitar la relación entre gastos y pagos
  const db = await JSONFilePreset<DbSchema>(
    "src/data/database.json",
    defaultData,
  );
  return db;
}
