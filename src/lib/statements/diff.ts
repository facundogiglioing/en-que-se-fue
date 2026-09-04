import { monthsBetween, shiftIndex } from "@/app/admin/cards/utils";
import type {
  ParsedStatement,
  StatementDiff,
  StatementMovementDiff,
  Transaction,
} from "@/types";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function normalizeDescription(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function descriptionsMatch(a: string, b: string): boolean {
  const na = normalizeDescription(a);
  const nb = normalizeDescription(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function dateToMonthIndex(iso: string): number {
  return Number(iso.slice(0, 4)) * 100 + Number(iso.slice(5, 7));
}

// Proyecta qué le tocaría pagar a una transacción ya cargada en un mes puntual.
function projectTransaction(transaction: Transaction, monthIndex: number) {
  const startIndex = transaction.startYear * 100 + (transaction.startMonth + 1);
  if (monthIndex < startIndex) return null;

  if (transaction.isRecurring) {
    return { installmentLabel: undefined, amount: transaction.totalAmount };
  }

  const installments = Math.max(1, transaction.installments || 1);
  const endIndex = shiftIndex(startIndex, installments - 1);
  if (monthIndex > endIndex) return null;

  const currentInstallment = monthsBetween(startIndex, monthIndex) + 1;
  const installmentLabel =
    installments > 1
      ? `${pad2(currentInstallment)}/${pad2(installments)}`
      : undefined;

  return { installmentLabel, amount: transaction.totalAmount / installments };
}

// Un resumen sigue vigente si hoy está entre su cierre y vencimiento, o si venció
// hace poco (dentro del mismo mes) y todavía no se emitió el siguiente.
export function isCurrentBillingCycle(
  closingDate: string | undefined,
  dueDate: string | undefined,
  today: Date = new Date(),
): boolean {
  if (!closingDate || !dueDate) return false;
  const todayIso = today.toISOString().slice(0, 10);

  if (todayIso >= closingDate && todayIso <= dueDate) return true;

  const sameMonthAsDue = todayIso.slice(0, 7) === dueDate.slice(0, 7);
  return todayIso > dueDate && sameMonthAsDue;
}

export function buildStatementDiff(
  statement: ParsedStatement,
  transactions: Transaction[],
): StatementDiff {
  const usedTransactionIds = new Set<string>();

  const movements: StatementMovementDiff[] = statement.movements.map(
    (movement) => {
      const monthIndex = dateToMonthIndex(movement.date);

      const match = transactions.find((transaction) => {
        if (usedTransactionIds.has(transaction.id)) return false;

        const projected = projectTransaction(transaction, monthIndex);
        if (!projected) return false;

        const bothHaveInstallment =
          !!projected.installmentLabel === !!movement.installment;
        if (!bothHaveInstallment) return false;
        if (
          projected.installmentLabel &&
          movement.installment &&
          projected.installmentLabel !== movement.installment
        ) {
          return false;
        }

        if (!descriptionsMatch(transaction.description, movement.description)) {
          return false;
        }

        const amount = movement.amountArs ?? 0;
        return Math.abs(amount - projected.amount) < 1;
      });

      if (match) usedTransactionIds.add(match.id);

      return { ...movement, exists: !!match };
    },
  );

  return {
    isCurrentCycle: isCurrentBillingCycle(
      statement.summary.closingDate,
      statement.summary.dueDate,
    ),
    movements,
  };
}
