// Carga las cuotas del préstamo UVA ya abonadas según la planilla original.
// Idempotente: si la cuota ya existe no la modifica.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta la variable de entorno DATABASE_URL.");
}

const db = drizzle({ client: neon(databaseUrl), casing: "snake_case" });

// [cuota, fecha de pago, UVA, tipo de cambio] tomados de la planilla.
const PAID: [number, string, number, number][] = [
  [1, "2025-09-10", 1579.75, 1435],
  [2, "2025-10-10", 1609.57, 1435],
  [3, "2025-11-10", 1640.75, 1480],
  [4, "2025-12-10", 1679.85, 1480],
  [5, "2026-01-10", 1721.45, 1485],
  [6, "2026-02-10", 1768.65, 1485],
  [7, "2026-03-10", 1818.52, 1485],
  [8, "2026-04-10", 1872.37, 1485],
  [9, "2026-05-10", 1931.64, 1475],
  [10, "2026-06-10", 1987.49, 1550],
  [11, "2026-07-10", 2029.47, 1550],
  [12, "2026-08-10", 2068.01, 1550],
  [13, "2026-09-10", 2113.2, 1550],
  [14, "2026-10-10", 2150.53, 1550],
];

async function main() {
  const inserted = await db
    .insert(schema.loanPayments)
    .values(
      PAID.map(([installmentNumber, paidAt, uva, exchangeRate]) => ({
        installmentNumber,
        paidAt: new Date(`${paidAt}T12:00:00Z`),
        uva,
        exchangeRate,
      })),
    )
    .onConflictDoNothing({ target: schema.loanPayments.installmentNumber })
    .returning({ installmentNumber: schema.loanPayments.installmentNumber });

  console.log(
    `Cuotas insertadas: ${inserted.length} de ${PAID.length} (el resto ya existía).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
