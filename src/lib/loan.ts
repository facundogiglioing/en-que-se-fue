// Motor de cálculo del préstamo UVA.
// El cuadro de amortización en UVA (capital, interés, seguro, IVA por cuota)
// es el oficial del banco y es fijo de por vida: está embebido en
// loan-amortization.ts. Lo que varía es el valor del UVA y el tipo de cambio,
// que se obtienen de APIs públicas. Este módulo replica las fórmulas de la
// planilla original:
// - Saldo: saldo anterior - capital de la cuota (precisión completa).
// - Total cuota: capital + interés + seguro + IVA.
// - ARS: valores en UVA × UVA de la fecha de vencimiento.
// - Saldo ARS/USD: saldo en UVA × UVA, / tipo de cambio.

import { AMORTIZATION } from "./loan-amortization";

export const LOAN = {
  title: "Préstamo UVA - TNA: 6,9% - 20/08/2025",
  /** Fecha de desembolso */
  startDate: "2025-08-20",
  /** Primer vencimiento; las demás cuotas vencen el mismo día de cada mes */
  firstPaymentDate: "2025-09-10",
  months: AMORTIZATION.length,
  tna: 0.069,
  /** Capital otorgado, en UVA */
  capitalUva: 55_778.53,
  uvaAtStart: 1_559.74,
  exchangeRateAtStart: 1_315,
  /** Monto desembolsado en ARS */
  originalArs: 87_000_000,
} as const;

export interface LoanPaymentRecord {
  installmentNumber: number;
  uva: number;
  exchangeRate: number;
  paidAt?: string;
}

export interface LoanInstallment {
  number: number;
  /** Fecha de vencimiento en formato ISO (yyyy-mm-dd) */
  dueDate: string;
  uva: number;
  /** true si el UVA no está publicado aún y se usó el último valor conocido */
  uvaIsEstimated: boolean;
  uvaVariation: number;
  exchangeRate: number;
  /** Saldo de capital en UVA antes de pagar la cuota */
  capitalBalance: number;
  capital: number;
  interest: number;
  other: number;
  vat: number;
  total: number;
  paid: boolean;
  paidAt?: string;
  arsCapital: number;
  arsInterest: number;
  arsOther: number;
  arsVat: number;
  arsTotal: number;
  /** Saldo de capital valuado en ARS (antes de pagar la cuota) */
  totalArs: number;
  totalUsd: number;
}

export interface LoanSummary {
  title: string;
  originalCapital: number;
  /** Capital restante en UVA: original - capital de las cuotas abonadas */
  remainingCapital: number;
  uvaAtStart: number;
  exchangeRateAtStart: number;
  originalArs: number;
  originalUsd: number;
  currentUva: number;
  currentExchangeRate: number;
  paidInstallments: number;
  remainingInstallments: number;
}

export interface LoanData {
  summary: LoanSummary;
  installments: LoanInstallment[];
}

export interface BuildScheduleInput {
  /** Valores UVA publicados, indexados por fecha ISO (yyyy-mm-dd) */
  uvaByDate: Map<string, number>;
  /** Último valor UVA publicado (fallback para fechas futuras) */
  latestUva: number;
  /** Tipo de cambio actual para cuotas no abonadas */
  currentExchangeRate: number;
  /** Cuotas confirmadas como abonadas, con el UVA/TC usados */
  payments: LoanPaymentRecord[];
}

// Redondeo a 2 decimales resistente a errores de punto flotante en empates
// (p. ej. 333,82 × 1579,75 = …,1450 debe redondear hacia arriba como en Sheets).
const round2 = (n: number) =>
  Math.round(Number((n * 100).toPrecision(13))) / 100;

/** Fecha de vencimiento ISO de la cuota k (mismo día del mes que la primera). */
export function installmentDueDate(k: number): string {
  const [year, month, day] = LOAN.firstPaymentDate.split("-").map(Number);
  const due = new Date(Date.UTC(year, month - 1 + (k - 1), day));
  return due.toISOString().slice(0, 10);
}

export function buildLoanSchedule(input: BuildScheduleInput): LoanData {
  const { uvaByDate, latestUva, currentExchangeRate, payments } = input;
  const paymentByNumber = new Map(
    payments.map((p) => [p.installmentNumber, p]),
  );

  const installments: LoanInstallment[] = [];
  let balance = LOAN.capitalUva;
  let previousUva: number | null = null;
  let paidCapital = 0;

  AMORTIZATION.forEach(([capital, interest, other, vat], index) => {
    const k = index + 1;
    const total = capital + interest + other + vat;

    const dueDate = installmentDueDate(k);
    const paid = paymentByNumber.get(k);
    const publishedUva = uvaByDate.get(dueDate);
    const uva = paid?.uva ?? publishedUva ?? latestUva;
    const uvaIsEstimated = !paid && publishedUva === undefined;
    const exchangeRate = paid?.exchangeRate ?? currentExchangeRate;

    installments.push({
      number: k,
      dueDate,
      uva,
      uvaIsEstimated,
      uvaVariation:
        previousUva === null
          ? 0
          : round2(((uva - previousUva) / previousUva) * 100),
      exchangeRate,
      capitalBalance: round2(balance),
      capital: round2(capital),
      interest: round2(interest),
      other: round2(other),
      vat: round2(vat),
      total: round2(total),
      paid: !!paid,
      paidAt: paid?.paidAt,
      arsCapital: round2(capital * uva),
      arsInterest: round2(interest * uva),
      arsOther: round2(other * uva),
      arsVat: round2(vat * uva),
      arsTotal: round2(total * uva),
      totalArs: round2(balance * uva),
      totalUsd: round2((balance * uva) / exchangeRate),
    });

    if (paid) paidCapital += capital;
    previousUva = uva;
    balance -= capital;
  });

  const paidCount = paymentByNumber.size;

  return {
    summary: {
      title: LOAN.title,
      originalCapital: LOAN.capitalUva,
      remainingCapital: round2(LOAN.capitalUva - paidCapital),
      uvaAtStart: LOAN.uvaAtStart,
      exchangeRateAtStart: LOAN.exchangeRateAtStart,
      originalArs: LOAN.originalArs,
      originalUsd: round2(LOAN.originalArs / LOAN.exchangeRateAtStart),
      currentUva: latestUva,
      currentExchangeRate,
      paidInstallments: paidCount,
      remainingInstallments: LOAN.months - paidCount,
    },
    installments,
  };
}
