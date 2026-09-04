"use server";

import { revalidatePath } from "next/cache";
import { shiftIndex } from "@/app/admin/cards/utils";
import { getDb } from "@/lib/db";
import { extractPdfText } from "@/lib/pdf";
import { parseStatementText } from "@/lib/statements";
import { buildStatementDiff } from "@/lib/statements/diff";
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

  const db = await getDb();
  const transactions =
    cardId && cardId !== "0"
      ? (db.data.transactions ?? []).filter((t) => t.cardId === cardId)
      : [];

  return { statement, diff: buildStatementDiff(statement, transactions) };
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
): Transaction {
  const monthIndex =
    Number(movement.date.slice(0, 4)) * 100 + Number(movement.date.slice(5, 7));

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

  const startIndex = shiftIndex(monthIndex, -(currentInstallment - 1));
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
  };
}

export async function applyStatement(formData: FormData): Promise<{
  createdCount: number;
  datesUpdated: boolean;
}> {
  const cardId = formData.get("cardId") as string;
  const rawStatement = formData.get("statement") as string;

  if (!cardId || cardId === "0" || !rawStatement) {
    throw new Error("Faltan datos para guardar el resumen.");
  }

  const statement = JSON.parse(rawStatement) as ParsedStatement;

  const db = await getDb();
  const card = db.data.creditCards.find((c) => c.id === cardId);
  if (!card) {
    throw new Error("No encontramos la tarjeta seleccionada.");
  }

  if (!db.data.transactions) db.data.transactions = [];
  const cardTransactions = db.data.transactions.filter(
    (t) => t.cardId === cardId,
  );
  const diff = buildStatementDiff(statement, cardTransactions);

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
    .filter((movement) => !movement.exists)
    .map((movement) => movementToTransaction(cardId, movement));

  db.data.transactions.push(...newTransactions);

  await db.write();
  revalidatePath("/admin/cards");
  revalidatePath("/");

  return { createdCount: newTransactions.length, datesUpdated };
}
