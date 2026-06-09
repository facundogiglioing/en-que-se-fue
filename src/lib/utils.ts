import type { CardPurchase } from "@/types";

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