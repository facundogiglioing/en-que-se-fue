import type { ParsedStatement, StatementMovement } from "@/types";
import type { StatementParser } from "./types";
import {
  MONEY_PATTERN,
  parseArNumber,
  parseNumericDate,
  parseShortMonthDate,
} from "./utils";

// CUIT propio de Banco Galicia, aparece en todos los resúmenes de tarjeta.
const GALICIA_CUIT = "30-50000173-5";

function extractOwnerName(text: string): string {
  const match = text.match(
    /^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ' ]+?)\s+(Monotributo|Responsable Inscripto|Consumidor Final|Exento)\b/m,
  );
  return match?.[1]?.trim() ?? "";
}

function extractBillingCycle(text: string) {
  // Los 6 hitos del ciclo: cierre y vto. anterior, cierre y vto. actual, próximo cierre y vto.
  const match = text.match(
    /(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})\s+(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})\s+(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})\s+(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})\s+(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})\s+(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})/,
  );

  if (!match) {
    return {
      closingDate: undefined,
      dueDate: undefined,
      nextClosingDate: undefined,
      nextDueDate: undefined,
    };
  }

  return {
    closingDate: parseShortMonthDate(match[3]),
    dueDate: parseShortMonthDate(match[4]),
    nextClosingDate: parseShortMonthDate(match[5]),
    nextDueDate: parseShortMonthDate(match[6]),
  };
}

function extractTotalAmount(text: string): number {
  const match = text.match(/TOTAL A PAGAR\s+([\d.,]+)/i);
  return match ? parseArNumber(match[1]) : 0;
}

function parseMovementLine(line: string): StatementMovement | null {
  const dateMatch = line.match(/^(\d{2}-\d{2}-\d{2})\s+(.*)$/);
  if (!dateMatch) return null;

  const date = parseNumericDate(dateMatch[1]);
  if (!date) return null;

  let rest = dateMatch[2];

  // Cuota, ej: "12/12"
  const installmentMatch = rest.match(/\b(\d{2}\/\d{2})\b/);
  const installment = installmentMatch?.[1];
  if (installmentMatch && typeof installmentMatch.index === "number") {
    rest =
      rest.slice(0, installmentMatch.index) +
      rest.slice(installmentMatch.index + installmentMatch[0].length);
  }

  const amounts = [...rest.matchAll(MONEY_PATTERN)];
  if (amounts.length === 0) return null;

  const lastAmount = amounts[amounts.length - 1];
  const isUsd = /USD/i.test(rest);
  const amountValue = parseArNumber(lastAmount[0]);

  let description = rest.slice(0, lastAmount.index).trim();
  description = description.replace(/\b\d{5,}\b\s*$/, "").trim();
  description = description.replace(/^[*KFW]{1,2}\s+/, "").trim();
  description = description.replace(/\s{2,}/g, " ");

  return {
    date,
    description: description || rest.trim(),
    installment,
    amountArs: isUsd ? undefined : amountValue,
    amountUsd: isUsd ? amountValue : undefined,
  };
}

function extractMovements(lines: string[]): StatementMovement[] {
  const startIndex = lines.findIndex((line) =>
    /DETALLE DEL CONSUMO/i.test(line),
  );
  if (startIndex === -1) return [];

  let endIndex = lines.findIndex(
    (line, index) => index > startIndex && /^TARJETA\b/i.test(line),
  );
  if (endIndex === -1) endIndex = lines.length;

  const movements: StatementMovement[] = [];
  for (let i = startIndex + 1; i < endIndex; i++) {
    const movement = parseMovementLine(lines[i]);
    if (movement) movements.push(movement);
  }

  return movements;
}

export const galiciaVisaParser: StatementParser = {
  bankId: "galicia",
  bankLabel: "Banco Galicia",

  matches(text) {
    return text.includes(GALICIA_CUIT) || /galicia/i.test(text);
  },

  parse(text): ParsedStatement {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const joined = lines.join("\n");

    return {
      bankId: this.bankId,
      summary: {
        bank: this.bankLabel,
        ownerName: extractOwnerName(joined),
        totalAmount: extractTotalAmount(joined),
        ...extractBillingCycle(joined),
      },
      movements: extractMovements(lines),
    };
  },
};
