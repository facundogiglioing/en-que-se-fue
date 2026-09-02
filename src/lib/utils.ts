interface CardPurchase {
  startYear: number;
  startMonth: number;
  installments: number;
  totalAmount: number;
}

// Desplaza (mes 0-11, año) por `delta` meses, respetando el cambio de año.
export function shiftMonthYear(
  month: number,
  year: number,
  delta: number,
): { month: number; year: number } {
  const date = new Date(year, month + delta, 1);
  return { month: date.getMonth(), year: date.getFullYear() };
}

export function getInstallmentInfo(
  purchase: CardPurchase,
  targetMonth: number,
  targetYear: number,
) {
  // Calculamos la diferencia total en meses
  const monthsDiff =
    (targetYear - purchase.startYear) * 12 +
    (targetMonth - purchase.startMonth);

  // Si la diferencia es negativa, el cobro aún no empieza
  // Si la diferencia es >= installments, el cobro ya terminó
  if (monthsDiff >= 0 && monthsDiff < purchase.installments) {
    return {
      currentInstallment: monthsDiff + 1,
      amount: purchase.totalAmount / purchase.installments,
    };
  }

  return null;
}

/**
 * Formatea un número con separadores de miles
 * Ej: 1000 → "1.000", 1000000 → "1.000.000"
 */
export function formatNumberWithThousandsSeparator(value: string): string {
  // Eliminar caracteres no numéricos excepto el punto decimal
  const numericValue = value.replace(/\D/g, "");

  // Aplicar separador de miles cada 3 dígitos
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Remueve los separadores de miles de un número formateado
 * Ej: "1.000" → "1000", "1.000.000" → "1000000"
 */
export function removeThousandsSeparators(value: string): string {
  return value.replace(/\./g, "");
}

/**
 * Formatea un número con separadores de miles y 2 decimales
 * Ej: 1000 → "1.000,00", 1234567 → "1.234.567,89"
 */
export function formatNumberWithDecimals(value: string): string {
  // Eliminar caracteres no numéricos
  let numericValue = value.replace(/\D/g, "");

  if (numericValue.length === 0) return "0,00";

  // Asegurar que tenga al menos 3 caracteres (para los 2 decimales)
  while (numericValue.length < 3) {
    numericValue = `0${numericValue}`;
  }

  // Separar enteros y decimales
  const integerPart = numericValue.slice(0, -2);
  const decimalPart = numericValue.slice(-2);

  // Remover ceros al principio del integer part, manteniendo al menos un dígito
  const trimmedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";

  // Aplicar separador de miles al entero
  const formattedInteger = trimmedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedInteger},${decimalPart}`;
}

/**
 * Remueve el formato de un número con decimales
 * Ej: "1.000,00" → "100000", "1.234.567,89" → "123456789"
 */
export function removeDecimalFormatting(value: string): string {
  // Remover puntos (separadores de miles) y reemplazar coma por nada
  return value.replace(/\./g, "").replace(/,/g, "");
}

/**
 * Formatea un número de teléfono con espacios
 * Separa en 4 y 4 o 3 y 4 según la cantidad de dígitos
 * Ej: 55545454 → "5554 5454", 5554545 → "555 4545"
 */
export function formatPhoneNumber(value: string): string {
  const numericValue = value.replace(/\D/g, "").slice(0, 8);

  if (numericValue.length <= 4) {
    return numericValue;
  }

  if (numericValue.length === 8) {
    return `${numericValue.slice(0, 4)} ${numericValue.slice(4)}`;
  }

  // Para 5, 6, 7 caracteres: 3 y el resto
  return `${numericValue.slice(0, 3)} ${numericValue.slice(3)}`;
}

/**
 * Remueve espacios del número de teléfono formateado
 * Ej: "5554 5454" → "55545454", "555 4545" → "5554545"
 */
export function removePhoneNumberFormatting(value: string): string {
  return value.replace(/\s/g, "");
}

/**
 * Remueve el formato de una fecha
 * Ej: "15/01/2024" → "15012024", "15/01" → "1501"
 */
export function removeDateFormatting(value: string): string {
  return value.replace(/\//g, "");
}

/**
 * Valida si una fecha en formato DD/MM/YYYY es válida
 * Ej: "32/13/2024" → false, "15/01/2024" → true
 */
export function isValidDate(value: string): boolean {
  const cleanedValue = removeDateFormatting(value);

  if (cleanedValue.length !== 8) return false;

  const day = parseInt(cleanedValue.slice(0, 2), 10);
  const month = parseInt(cleanedValue.slice(2, 4), 10);
  const year = parseInt(cleanedValue.slice(4, 8), 10);

  if (day < 1 || day > 31 || month < 1 || month > 12) return false;

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Formatea un CUIT con guiones
 * Formato: XX-XXXXXXXX-X (11 dígitos)
 * Ej: 20123456784 → "20-12345678-4"
 */
export function formatCUIT(value: string): string {
  const numericValue = value.replace(/\D/g, "").slice(0, 11);

  if (numericValue.length <= 2) {
    return numericValue;
  }

  if (numericValue.length <= 10) {
    return `${numericValue.slice(0, 2)}-${numericValue.slice(2)}`;
  }

  return `${numericValue.slice(0, 2)}-${numericValue.slice(
    2,
    10,
  )}-${numericValue.slice(10)}`;
}

/**
 * Remueve los guiones del CUIT formateado
 * Ej: "20-12345678-4" → "20123456784"
 */
export function removeCUITFormatting(value: string): string {
  return value.replace(/\D/g, "");
}
