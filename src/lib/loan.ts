import "server-only";

export interface LoanSummary {
  title: string;
  originalCapital: string;
  remainingCapital: string;
  uva: string;
  exchangeRate: string;
  totalArs: string;
  totalUsd: string;
  remainingInstallments: string;
}

export interface LoanInstallment {
  number: string;
  uva: string;
  uvaVariation: string;
  exchangeRate: string;
  capitalBalance: string;
  capital: string;
  interest: string;
  other: string;
  vat: string;
  total: string;
  paid: boolean;
  paymentDate: string;
  arsCapital: string;
  arsInterest: string;
  arsTotal: string;
  totalArs: string;
  totalUsd: string;
}

export interface LoanData {
  summary: LoanSummary;
  installments: LoanInstallment[];
}

/**
 * Parser CSV mínimo que soporta campos entrecomillados
 * con comas y saltos de línea internos (formato export de Google Sheets).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseLoanSheet(csv: string): LoanData {
  const rows = parseCsv(csv);

  // Fila 1: título ("Prestamo Uva - TNA: ... - fecha")
  const title = rows[1]?.[1]?.trim() ?? "Préstamo";

  // Fila 2: resumen (Capital, UVA, TC, totales y cuotas restantes)
  const summaryRow = rows[2] ?? [];
  const summary: LoanSummary = {
    title,
    originalCapital: summaryRow[4] ?? "",
    remainingCapital: summaryRow[5] ?? "",
    uva: summaryRow[7] ?? "",
    exchangeRate: summaryRow[9] ?? "",
    totalArs: summaryRow[11] ?? "",
    totalUsd: summaryRow[13] ?? "",
    remainingInstallments: summaryRow[17] ?? "",
  };

  // Filas 5 en adelante: cuotas (filas 3 y 4 son el encabezado doble)
  const installments: LoanInstallment[] = [];
  for (const row of rows.slice(5)) {
    const number = row[1]?.trim();
    if (!number) continue;
    installments.push({
      number,
      uva: row[2] ?? "",
      uvaVariation: row[3] ?? "",
      exchangeRate: row[4] ?? "",
      capitalBalance: row[5] ?? "",
      capital: row[6] ?? "",
      interest: row[7] ?? "",
      other: row[8] ?? "",
      vat: row[9] ?? "",
      total: row[10] ?? "",
      paid: (row[11] ?? "").trim().toLowerCase() === "si",
      paymentDate: row[12] ?? "",
      arsCapital: row[13] ?? "",
      arsInterest: row[14] ?? "",
      arsTotal: row[15] ?? "",
      totalArs: row[16] ?? "",
      totalUsd: row[17] ?? "",
    });
  }

  return { summary, installments };
}

export async function getLoanData(): Promise<LoanData | null> {
  const sheetId = process.env.LOAN_SHEET_ID;
  const gid = process.env.LOAN_SHEET_GID;
  if (!sheetId || !gid) return null;

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) return null;

  return parseLoanSheet(await response.text());
}
