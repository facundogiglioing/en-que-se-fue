import type { ParsedStatement, StatementMovement } from "@/types";
import type { StatementParser } from "./types";
import { parseArNumber } from "./utils";

// CUIT propio de Banco Santander, aparece en el encabezado del resumen.
const SANTANDER_CUIT = "30-50000845-4";

// "[dd/mm/yy] Descripción [N de M] [comprobante] $ 1.234,56 [U$S 0,00]"; la fecha
// solo aparece en el primer movimiento de cada día.
const MOVEMENT_PATTERN =
  /^(?:(\d{2}\/\d{2}\/\d{2})\s+)?(.+?)(?:\s+(\d{1,2}) de (\d{1,2}))?(?:\s+(\d{4,}))?\s+((?:-?(?:U\$S|\$)\s*[\d.,]+\s*)+)$/;

// "01/10/26" -> "2026-10-01"
function parseSlashDate(value: string | undefined): string | undefined {
  const match = value?.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  return `20${year}-${month}-${day}`;
}

function pad2(value: string): string {
  return value.padStart(2, "0");
}

function extractOwnerName(text: string): string {
  const match = text.match(/^Resumen Visa N°\s*\d+\n(.+)$/m);
  return match?.[1]?.trim() ?? "";
}

// Las fechas vienen en 3 líneas, ej: "Cierre\nactual\n01/10/26".
function extractLabeledDate(text: string, label: string): string | undefined {
  const match = text.match(
    new RegExp(`^${label}\\s+(\\d{2}\\/\\d{2}\\/\\d{2})$`, "im"),
  );
  return parseSlashDate(match?.[1]);
}

function extractBillingCycle(text: string) {
  return {
    closingDate: extractLabeledDate(text, "Cierre\\nactual"),
    dueDate: extractLabeledDate(text, "Vencimiento\\nactual"),
    nextClosingDate: extractLabeledDate(text, "Pr.ximo\\ncierre"),
    nextDueDate: extractLabeledDate(text, "Pr.ximo\\nvencimiento"),
  };
}

function extractTotalAmount(text: string): number {
  const match = text.match(
    /Total a pagar\s+(?:En pesos\s+)?(-?)\$\s*([\d.,]+)/i,
  );
  if (!match) return 0;
  const amount = parseArNumber(match[2]);
  return match[1] === "-" ? -amount : amount;
}

function parseAmounts(value: string) {
  let amountArs: number | undefined;
  let amountUsd: number | undefined;

  for (const match of value.matchAll(/(-?)(U\$S|\$)\s*([\d.,]+)/g)) {
    const amount = parseArNumber(match[3]) * (match[1] === "-" ? -1 : 1);
    if (match[2] === "$") amountArs = amount;
    else if (amount !== 0) amountUsd = amount;
  }

  return { amountArs, amountUsd };
}

function extractMovements(
  lines: string[],
  closingDate: string | undefined,
): StatementMovement[] {
  const startIndex = lines.findIndex((line) =>
    /^Pago anterior y devoluciones/i.test(line),
  );
  if (startIndex === -1) return [];

  let endIndex = lines.findIndex(
    (line, index) => index > startIndex && /^Total a pagar\b/i.test(line),
  );
  if (endIndex === -1) endIndex = lines.length;

  const movements: StatementMovement[] = [];
  let currentDate: string | undefined;
  let previousBalance: number | undefined;
  let paymentsTotal = 0;
  let lastPaymentDate: string | undefined;

  for (let i = startIndex + 1; i < endIndex; i++) {
    const line = lines[i];
    if (/^(Subtotal de|Saldo del resumen anterior)\b/i.test(line)) continue;

    const match = line.match(MOVEMENT_PATTERN);
    if (!match) continue;

    const [, rawDate, rawDescription, current, total, receipt, rawAmounts] =
      match;
    currentDate = parseSlashDate(rawDate) ?? currentDate;
    if (!currentDate) continue;

    const description = rawDescription.replace(/\s{2,}/g, " ").trim();
    const { amountArs, amountUsd } = parseAmounts(rawAmounts);

    if (/^Saldo anterior$/i.test(description)) {
      previousBalance = amountArs ?? 0;
      continue;
    }
    if (/^Su pago\b/i.test(description)) {
      paymentsTotal += amountArs ?? 0;
      lastPaymentDate = currentDate;
      continue;
    }

    movements.push({
      date: currentDate,
      description,
      installment:
        current && total ? `${pad2(current)}/${pad2(total)}` : undefined,
      amountArs,
      amountUsd,
      receiptNumber: receipt,
    });
  }

  // Lo que quedó del resumen anterior (saldo - pagos) se arrastra a este.
  const carriedBalance =
    previousBalance === undefined
      ? 0
      : Math.round((previousBalance + paymentsTotal) * 100) / 100;
  const carriedDate = lastPaymentDate ?? closingDate;

  if (carriedBalance !== 0 && carriedDate) {
    movements.unshift({
      date: carriedDate,
      description:
        carriedBalance < 0
          ? "Saldo a favor del resumen anterior"
          : "Saldo pendiente del resumen anterior",
      amountArs: carriedBalance,
    });
  }

  return movements;
}

// Un mismo resumen trae los movimientos del titular y de las adicionales; se
// importan todos juntos porque se pagan en un solo resumen.
export const santanderParser: StatementParser = {
  bankId: "santander",
  bankLabel: "Banco Santander",

  matches(text) {
    return text.includes(SANTANDER_CUIT);
  },

  parse(text): ParsedStatement {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const joined = lines.join("\n");
    const billingCycle = extractBillingCycle(joined);

    return {
      bankId: this.bankId,
      summary: {
        bank: this.bankLabel,
        ownerName: extractOwnerName(joined),
        totalAmount: extractTotalAmount(joined),
        ...billingCycle,
      },
      movements: extractMovements(lines, billingCycle.closingDate),
    };
  },
};
