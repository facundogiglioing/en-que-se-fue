import type { ParsedStatement, StatementMovement } from "@/types";
import type { StatementParser } from "./types";
import { MONEY_PATTERN, parseArNumber, parseShortMonthDate } from "./utils";

// CUIT propio de Banco Ciudad, aparece en todos los resúmenes de tarjeta.
const BANCO_CIUDAD_CUIT = "30-99903208-3";

function extractOwnerName(text: string): string {
  // El titular aparece justo debajo del código de sucursal/cuenta (ej: "036 . 029").
  const match = text.match(
    /\d{3}\s*\.\s*\d{3}\s*\n([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ'.\- ]+)\n/,
  );
  return match?.[1]?.trim() ?? "";
}

function extractLabeledDate(text: string, label: RegExp): string | undefined {
  const match = text.match(label);
  return match ? parseShortMonthDate(match[1]) : undefined;
}

function extractBillingCycle(text: string) {
  return {
    closingDate: extractLabeledDate(
      text,
      /Estado de cuenta al:\s*(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})/i,
    ),
    dueDate: extractLabeledDate(
      text,
      /Vencimiento actual:\s*(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})/i,
    ),
    // Usamos "." en vez de "ó" porque algunos resúmenes traen la tilde corrupta.
    nextClosingDate: extractLabeledDate(
      text,
      /Pr.ximo Cierre:\s*(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})/i,
    ),
    nextDueDate: extractLabeledDate(
      text,
      /Pr.ximo Vencimiento:\s*(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})/i,
    ),
  };
}

function extractTotalAmount(text: string): number {
  const match = text.match(/Saldo actual:\s*\$?\s*([\d.,]+)/i);
  return match ? parseArNumber(match[1]) : 0;
}

function parseMovementLine(line: string): StatementMovement | null {
  const dateMatch = line.match(/^(\d{2}-[A-Za-zÁ-ú]{3}-\d{2})\s+(.*)$/);
  if (!dateMatch) return null;

  const date = parseShortMonthDate(dateMatch[1]);
  if (!date) return null;

  let rest = dateMatch[2];

  // Cuota, ej: "03/03"
  const installmentMatch = rest.match(/\b(\d{2}\/\d{2})\b/);
  const installment = installmentMatch?.[1];
  if (installmentMatch && typeof installmentMatch.index === "number") {
    rest =
      rest.slice(0, installmentMatch.index) +
      rest.slice(installmentMatch.index + installmentMatch[0].length);
  }

  const amounts = [...rest.matchAll(MONEY_PATTERN)];
  if (amounts.length === 0) return null;

  // Orden de columnas: PESOS y, si el consumo fue en dólares, DOLARES.
  const [pesosMatch, dolaresMatch] = amounts;

  let description = rest.slice(0, pesosMatch.index).trim();
  // El número de cupón queda pegado justo antes del importe.
  description = description.replace(/\s*\d{4,}\s*$/, "").trim();
  description = description.replace(/\s{2,}/g, " ");

  return {
    date,
    description: description || rest.trim(),
    installment,
    amountArs: parseArNumber(pesosMatch[0]),
    amountUsd: dolaresMatch ? parseArNumber(dolaresMatch[0]) : undefined,
  };
}

function extractMovements(lines: string[]): StatementMovement[] {
  const startIndex = lines.findIndex((line) => /DETALLE DEL MES/i.test(line));
  if (startIndex === -1) return [];

  let endIndex = lines.findIndex(
    (line, index) => index > startIndex && /^TOTAL TITULAR/i.test(line),
  );
  if (endIndex === -1) endIndex = lines.length;

  const movements: StatementMovement[] = [];
  for (let i = startIndex + 1; i < endIndex; i++) {
    const movement = parseMovementLine(lines[i]);
    if (movement) movements.push(movement);
  }

  return movements;
}

export const bancoCiudadParser: StatementParser = {
  bankId: "banco-ciudad",
  bankLabel: "Banco Ciudad",

  matches(text) {
    return text.includes(BANCO_CIUDAD_CUIT);
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
