export function getCurrentIndex(): number {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

export function normalizeIndex(index: number): number {
  const year = Math.trunc(index / 100);
  const month = index % 100;

  if (month < 1 || month > 12) {
    return getCurrentIndex();
  }

  return year * 100 + month;
}

export function shiftIndex(index: number, monthDelta: number): number {
  const safeIndex = normalizeIndex(index);
  const year = Math.trunc(safeIndex / 100);
  const month = safeIndex % 100;

  const date = new Date(year, month - 1 + monthDelta, 1);

  return date.getFullYear() * 100 + (date.getMonth() + 1);
}

// Diferencia en meses entre dos índices AAAAMM, sin arrastre incorrecto de año
export function monthsBetween(fromIndex: number, toIndex: number): number {
  const fromYear = Math.trunc(fromIndex / 100);
  const fromMonth = fromIndex % 100;
  const toYear = Math.trunc(toIndex / 100);
  const toMonth = toIndex % 100;

  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}