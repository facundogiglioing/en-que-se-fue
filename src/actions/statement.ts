"use server";

import { and, count, eq, isNotNull, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { shiftIndex } from "@/app/admin/cards/utils";
import { requireRoles } from "@/lib/auth-session";
import { db, toCreditCard, toTransaction } from "@/lib/db";
import { extractPdfText } from "@/lib/pdf";
import { ROLES } from "@/lib/roles";
import { creditCards, transactions } from "@/lib/schema";
import { parseStatementText } from "@/lib/statements";
import { buildStatementDiff } from "@/lib/statements/diff";
import { resolvePeriodIndex } from "@/lib/statements/period";
import type {
  ParsedStatement,
  StatementAnalysis,
  StatementMovement,
  Transaction,
} from "@/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // "%PDF"

function hasPdfSignature(buffer: ArrayBuffer): boolean {
  const header = new Uint8Array(buffer.slice(0, PDF_MAGIC_BYTES.length));
  return PDF_MAGIC_BYTES.every((byte, index) => header[index] === byte);
}

export async function analyzeStatement(
  formData: FormData,
): Promise<StatementAnalysis> {
  await requireRoles([ROLES.ADMIN]);
  const file = formData.get("file");
  const cardId = formData.get("cardId") as string | null;

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No se recibió ningún archivo.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo es demasiado grande (máx. 15MB).");
  }

  const buffer = await file.arrayBuffer();

  if (!hasPdfSignature(buffer)) {
    throw new Error("El archivo no es un PDF válido.");
  }

  const text = await extractPdfText(buffer);
  if (!text.trim()) {
    throw new Error("No pudimos leer el contenido del PDF.");
  }

  const statement = parseStatementText(text);

  const hasCard = !!cardId && cardId !== "0";
  const [cardRow] = hasCard
    ? await db
        .select({ paysInArrears: creditCards.paysInArrears })
        .from(creditCards)
        .where(eq(creditCards.id, cardId))
    : [];
  const periodIndex = resolvePeriodIndex(
    formData.get("selectedIndex"),
    !!cardRow?.paysInArrears,
  );

  const cardTransactions = hasCard
    ? (
        await db
          .select()
          .from(transactions)
          .where(eq(transactions.cardId, cardId))
      ).map(toTransaction)
    : [];

  return {
    statement,
    diff: buildStatementDiff(statement, cardTransactions, periodIndex),
  };
}

function dayOfMonth(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const day = Number(iso.slice(8, 10));
  return Number.isFinite(day) && day > 0 ? day : undefined;
}

// Convierte un movimiento nuevo del resumen en la transacción equivalente a guardar.
function movementToTransaction(
  cardId: string,
  movement: StatementMovement,
  periodIndex: number,
): Transaction {
  const [currentInstallmentRaw, totalInstallmentsRaw] = movement.installment
    ? movement.installment.split("/").map((n) => Number.parseInt(n, 10))
    : [1, 1];

  const installments =
    Number.isFinite(totalInstallmentsRaw) && totalInstallmentsRaw > 0
      ? totalInstallmentsRaw
      : 1;
  const currentInstallment =
    Number.isFinite(currentInstallmentRaw) && currentInstallmentRaw > 0
      ? currentInstallmentRaw
      : 1;

  const startIndex = shiftIndex(periodIndex, -(currentInstallment - 1));
  const amountArs = movement.amountArs ?? 0;

  return {
    id: crypto.randomUUID(),
    cardId,
    description: movement.description,
    totalAmount: amountArs * installments,
    installments,
    startMonth: (startIndex % 100) - 1,
    startYear: Math.trunc(startIndex / 100),
    category: "Otros",
    receiptNumber: movement.receiptNumber,
    movementDate: movement.date,
  };
}

export async function applyStatement(formData: FormData): Promise<{
  createdCount: number;
  datesUpdated: boolean;
}> {
  await requireRoles([ROLES.ADMIN]);
  const cardId = formData.get("cardId") as string;
  const rawStatement = formData.get("statement") as string;

  if (!cardId || cardId === "0" || !rawStatement) {
    throw new Error("Faltan datos para guardar el resumen.");
  }

  const statement = JSON.parse(rawStatement) as ParsedStatement;

  const [cardRow] = await db
    .select()
    .from(creditCards)
    .where(eq(creditCards.id, cardId));
  if (!cardRow) {
    throw new Error("No encontramos la tarjeta seleccionada.");
  }
  const card = toCreditCard(cardRow);
  const periodIndex = resolvePeriodIndex(
    formData.get("selectedIndex"),
    !!card.paysInArrears,
  );

  const cardTransactions = (
    await db.select().from(transactions).where(eq(transactions.cardId, cardId))
  ).map(toTransaction);
  const diff = buildStatementDiff(statement, cardTransactions, periodIndex);

  let datesUpdated = false;
  if (diff.isCurrentCycle) {
    const nextClosingDay = dayOfMonth(statement.summary.nextClosingDate);
    const nextDueDay = dayOfMonth(statement.summary.nextDueDate);

    if (nextClosingDay && nextClosingDay !== card.closingDay) {
      card.closingDay = nextClosingDay;
      datesUpdated = true;
    }
    if (nextDueDay && nextDueDay !== card.dueDay) {
      card.dueDay = nextDueDay;
      datesUpdated = true;
    }
  }

  const newTransactions = diff.movements
    // Los consumos en dólares por ahora solo se muestran, no se cargan.
    .filter((movement) => !movement.exists && movement.amountArs !== undefined)
    .map((movement) => movementToTransaction(cardId, movement, periodIndex));

  if (newTransactions.length > 0) {
    await db.insert(transactions).values(newTransactions);
  }
  if (datesUpdated) {
    await db
      .update(creditCards)
      .set({ closingDay: card.closingDay, dueDay: card.dueDay })
      .where(eq(creditCards.id, cardId));
  }

  revalidatePath("/admin/cards");
  revalidatePath("/");

  return { createdCount: newTransactions.length, datesUpdated };
}

// Los movimientos importados de un resumen son los únicos con movementDate y,
// al insertarse en un solo INSERT, comparten el mismo createdAt.
const lastImportFilter = (cardId: string) =>
  and(
    eq(transactions.cardId, cardId),
    isNotNull(transactions.movementDate),
    sql`${transactions.createdAt} = (
      select max(${transactions.createdAt}) from ${transactions}
      where ${transactions.cardId} = ${cardId}
        and ${transactions.movementDate} is not null
    )`,
  );

export async function getLastStatementImport(
  cardId: string,
): Promise<{ count: number; importedAt: string } | null> {
  await requireRoles([ROLES.ADMIN]);
  if (!cardId || cardId === "0") return null;

  const [row] = await db
    .select({ count: count(), importedAt: max(transactions.createdAt) })
    .from(transactions)
    .where(lastImportFilter(cardId));

  if (!row || row.count === 0 || !row.importedAt) return null;
  return { count: row.count, importedAt: row.importedAt.toISOString() };
}

export async function deleteLastStatementImport(
  cardId: string,
): Promise<{ deletedCount: number }> {
  await requireRoles([ROLES.ADMIN]);
  if (!cardId || cardId === "0") {
    throw new Error("Seleccioná una tarjeta.");
  }

  const deleted = await db
    .delete(transactions)
    .where(lastImportFilter(cardId))
    .returning({ id: transactions.id });

  revalidatePath("/admin/cards");
  revalidatePath("/");

  return { deletedCount: deleted.length };
}
