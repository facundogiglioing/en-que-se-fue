"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { getOficialExchangeRate, getUvaIndex } from "@/lib/indices";
import { installmentDueDate, LOAN, type LoanPaymentRecord } from "@/lib/loan";
import { ROLES } from "@/lib/roles";
import { loanPayments } from "@/lib/schema";

function assertValidInstallment(installmentNumber: number) {
  if (
    !Number.isInteger(installmentNumber) ||
    installmentNumber < 1 ||
    installmentNumber > LOAN.months
  ) {
    throw new Error(`Número de cuota inválido: ${installmentNumber}`);
  }
}

export async function getLoanPayments(): Promise<LoanPaymentRecord[]> {
  await requireRoles([ROLES.ADMIN]);
  const rows = await db.select().from(loanPayments);
  return rows.map((row) => ({
    installmentNumber: row.installmentNumber,
    uva: row.uva,
    exchangeRate: row.exchangeRate,
    paidAt: row.paidAt?.toISOString(),
  }));
}

export async function confirmLoanInstallment(installmentNumber: number) {
  await requireRoles([ROLES.ADMIN]);
  assertValidInstallment(installmentNumber);

  // El UVA se toma de la fecha de vencimiento de la cuota (se publica con
  // unos días de anticipación); si todavía no está, se usa el último valor.
  const uvaIndex = await getUvaIndex();
  if (!uvaIndex) {
    throw new Error("No se pudo obtener el valor UVA. Reintentá más tarde.");
  }
  const dueDate = installmentDueDate(installmentNumber);
  const uva = uvaIndex.byDate.get(dueDate) ?? uvaIndex.latestValue;

  const exchangeRate =
    (await getOficialExchangeRate()) ?? (await lastKnownExchangeRate());

  await db
    .insert(loanPayments)
    .values({ installmentNumber, uva, exchangeRate, paidAt: new Date() })
    .onConflictDoUpdate({
      target: loanPayments.installmentNumber,
      set: { uva, exchangeRate, paidAt: new Date() },
    });
  revalidatePath("/admin/loan");
}

export async function unconfirmLoanInstallment(installmentNumber: number) {
  await requireRoles([ROLES.ADMIN]);
  assertValidInstallment(installmentNumber);
  await db
    .delete(loanPayments)
    .where(eq(loanPayments.installmentNumber, installmentNumber));
  revalidatePath("/admin/loan");
}

async function lastKnownExchangeRate(): Promise<number> {
  const [last] = await db
    .select({ exchangeRate: loanPayments.exchangeRate })
    .from(loanPayments)
    .orderBy(desc(loanPayments.installmentNumber))
    .limit(1);
  return last?.exchangeRate ?? LOAN.exchangeRateAtStart;
}
