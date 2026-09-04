const SHORT_MONTHS_ES: Record<string, string> = {
  ene: "01",
  feb: "02",
  mar: "03",
  abr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  ago: "08",
  sep: "09",
  set: "09",
  oct: "10",
  nov: "11",
  dic: "12",
};

// Formato de importe argentino: "1.203.352,60" -> 1203352.6
export function parseArNumber(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

// "08-Jul-26" -> "2026-07-08"
export function parseShortMonthDate(value: string): string | undefined {
  const match = value.trim().match(/^(\d{2})-([A-Za-zÁ-ú]{3})-(\d{2})$/);
  if (!match) return undefined;

  const [, day, monthAbbr, year] = match;
  const month = SHORT_MONTHS_ES[monthAbbr.toLowerCase()];
  if (!month) return undefined;

  return `20${year}-${month}-${day}`;
}

// "05-09-25" -> "2025-09-05"
export function parseNumericDate(value: string): string | undefined {
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;

  const [, day, month, year] = match;
  return `20${year}-${month}-${day}`;
}

// Importes con formato argentino, ej: "89.985,00" o "-1.405.301,42"
export const MONEY_PATTERN = /-?\d{1,3}(?:\.\d{3})*,\d{2}/g;
