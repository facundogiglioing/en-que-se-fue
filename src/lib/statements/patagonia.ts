import type { ParsedStatement, StatementMovement } from "@/types";
import type { StatementParser } from "./types";
import { parseArNumber, parseShortMonthDate } from "./utils";

// CUIT propio de Banco Patagonia; en el resumen viene con espacios ("30 50000661 3").
const PATAGONIA_CUIT_PATTERN = /30[\s-]*50000661[\s-]*3/;

// Patagonia indica los créditos con el signo al final, ej: "14.352,89-".
const PATAGONIA_MONEY_PATTERN = /(\d+(?:\.\d{3})*,\d{2})(-?)/g;

// Fechas con espacios, ej: "01 Oct 26".
const SPACED_DATE = String.raw`\d{2} [A-Za-zÁ-ú]{3} \d{2}`;

function parseSpacedDate(value: string | undefined): string | undefined {
  return value ? parseShortMonthDate(value.replace(/\s+/g, "-")) : undefined;
}

// "28.08.26" -> "2026-08-28"
function parseDottedDate(value: string): string | undefined {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  return `20${year}-${month}-${day}`;
}

function parseSignedAmount(value: string, sign: string): number {
  const amount = parseArNumber(value);
  return sign === "-" ? -amount : amount;
}

function extractOwnerName(text: string): string {
  // El titular aparece justo debajo del número de resumen (ej: "0068196 - 05 - 1 - CR1002").
  const match = text.match(
    /\d+ - \d+ - \d+ - [A-Z0-9]+\n([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ'.\- ]+)\n/,
  );
  if (match) return match[1].trim();

  const fallback = text.match(/Total Consumos de ([A-ZÁÉÍÓÚÑ' ]+?)\s+\d/);
  return fallback?.[1]?.trim() ?? "";
}

function extractBillingCycle(text: string) {
  const closing = text.match(new RegExp(`CIERRE ACTUAL:\\s*(${SPACED_DATE})`));
  const due = text.match(
    new RegExp(`VENCIMIENTO\\s+SALDO \\$[^\\n]*\\n(${SPACED_DATE})`),
  );
  // Fila "VTO. ANTERIOR | SALDO ANTERIOR $ | U$S | PROXIMO CIERRE".
  const nextClosing = text.match(
    new RegExp(
      `^${SPACED_DATE}\\s+[\\d.,]+\\s+[\\d.,]+\\s+(${SPACED_DATE})$`,
      "m",
    ),
  );
  // Fila "CIERRE ANTERIOR | PAGO MIN. ANT. $ | PROXIMO VTO.".
  const nextDue = text.match(
    new RegExp(`^${SPACED_DATE}\\s+[\\d.,]+\\s+(${SPACED_DATE})$`, "m"),
  );

  return {
    closingDate: parseSpacedDate(closing?.[1]),
    dueDate: parseSpacedDate(due?.[1]),
    nextClosingDate: parseSpacedDate(nextClosing?.[1]),
    nextDueDate: parseSpacedDate(nextDue?.[1]),
  };
}

function extractTotalAmount(text: string): number {
  // Un saldo acreedor viene con "-" al final (ej: "29.849,99-").
  const match = text.match(/SALDO ACTUAL\s+\$\s*([\d.,]+)(-?)/i);
  return match ? parseSignedAmount(match[1], match[2]) : 0;
}

function parseMovementLine(line: string): StatementMovement | null {
  const dateMatch = line.match(/^(\d{2}\.\d{2}\.\d{2})\s+(.*)$/);
  if (!dateMatch) return null;

  const date = parseDottedDate(dateMatch[1]);
  if (!date) return null;

  let rest = dateMatch[2].replace(/\s*_\s*$/, "");

  // Cuota, ej: "Cuota 01/03"
  const installmentMatch = rest.match(/\bCuota\s+(\d{2}\/\d{2})\b/i);
  const installment = installmentMatch?.[1];
  if (installmentMatch && typeof installmentMatch.index === "number") {
    rest =
      rest.slice(0, installmentMatch.index) +
      rest.slice(installmentMatch.index + installmentMatch[0].length);
  }

  const amounts = [...rest.matchAll(PATAGONIA_MONEY_PATTERN)];
  if (amounts.length === 0) return null;

  // El importe del movimiento es siempre el último; los anteriores son bases
  // de cálculo (ej. "DB IVA $ 21% 136.694,22 28.705,79").
  const lastAmount = amounts[amounts.length - 1];
  const amountValue = parseSignedAmount(lastAmount[1], lastAmount[2]);
  const isUsd = /\b(USD|U\$S)\b/i.test(rest);

  let description = rest.slice(0, amounts[0].index).trim();
  // Comprobante al inicio, ej: "002630* AEROLINEAS ARGENTINAS S.A"
  const receiptMatch = description.match(/^(\d{4,})\*?\s+/);
  const receiptNumber = receiptMatch?.[1];
  if (receiptMatch) description = description.slice(receiptMatch[0].length);
  description = description.replace(/\s{2,}/g, " ").trim();

  return {
    date,
    description: description || rest.trim(),
    installment,
    amountArs: isUsd ? undefined : amountValue,
    amountUsd: isUsd ? amountValue : undefined,
    receiptNumber,
  };
}

// Ej: "EN PESOS 125.111,39 TC1535,000 122.056,74- 1,99-": el total abonado se
// reparte entre la deuda en pesos (1er crédito) y la de dólares (2do crédito).
function parsePaymentPesos(rest: string): number {
  if (/D[OÓ]LARES|U\$S|USD/i.test(rest) && !/PESOS/i.test(rest)) return 0;

  const amounts = [
    ...rest.replace(/TC\s*[\d.,]+/gi, "").matchAll(PATAGONIA_MONEY_PATTERN),
  ];
  const pesosCredit = amounts.find((amount) => amount[2] === "-");
  const pesos = pesosCredit ?? amounts[amounts.length - 1];
  return pesos ? parseSignedAmount(pesos[1], pesos[2]) : 0;
}

function extractMovements(
  lines: string[],
  closingDate: string | undefined,
): StatementMovement[] {
  const startIndex = lines.findIndex((line) =>
    /DETALLE DE TRANSACCION/i.test(line),
  );
  if (startIndex === -1) return [];

  let endIndex = lines.findIndex(
    (line, index) => index > startIndex && /^SALDO ACTUAL\b/i.test(line),
  );
  if (endIndex === -1) endIndex = lines.length;

  const movements: StatementMovement[] = [];
  let previousBalance: number | undefined;
  let paymentsTotal = 0;
  let lastPaymentDate: string | undefined;

  for (let i = startIndex + 1; i < endIndex; i++) {
    const previousMatch = lines[i].match(/^SALDO ANTERIOR\s+([\d.,]+)(-?)/i);
    if (previousMatch) {
      previousBalance = parseSignedAmount(previousMatch[1], previousMatch[2]);
      continue;
    }

    const paymentMatch = lines[i].match(
      /^(\d{2}\.\d{2}\.\d{2})\s+SU PAGO\b(.*)$/i,
    );
    if (paymentMatch) {
      paymentsTotal += parsePaymentPesos(paymentMatch[2]);
      lastPaymentDate = parseDottedDate(paymentMatch[1]) ?? lastPaymentDate;
      continue;
    }

    const movement = parseMovementLine(lines[i]);
    if (movement) movements.push(movement);
  }

  // Lo que quedó del resumen anterior (saldo - pagos) se arrastra a este, así
  // la suma de movimientos coincide con el SALDO ACTUAL.
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

export const patagoniaParser: StatementParser = {
  bankId: "patagonia",
  bankLabel: "Banco Patagonia",

  matches(text) {
    return PATAGONIA_CUIT_PATTERN.test(text) || /bancopatagonia/i.test(text);
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
