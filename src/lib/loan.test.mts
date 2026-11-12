import assert from "node:assert/strict";
import { test } from "node:test";
import { buildLoanSchedule, installmentDueDate, LOAN } from "./loan";

// Valores UVA publicados, según la planilla original.
const SHEET_UVA: Record<string, number> = {
  "2025-09-10": 1579.75,
  "2025-10-10": 1609.57,
  "2025-11-10": 1640.75,
  "2025-12-10": 1679.85,
  "2026-01-10": 1721.45,
  "2026-10-10": 2150.53,
  "2026-11-10": 2185.48,
};

function schedule(paidCount = 0) {
  const payments = Object.entries(SHEET_UVA)
    .slice(0, paidCount)
    .map(([date, uva], index) => ({
      installmentNumber: index + 1,
      uva,
      exchangeRate: 1435,
      paidAt: `${date}T12:00:00Z`,
    }));
  return buildLoanSchedule({
    uvaByDate: new Map(Object.entries(SHEET_UVA)),
    latestUva: 2185.48,
    currentExchangeRate: 1640,
    payments,
  });
}

test("los vencimientos van el día 10 de cada mes desde 09/2025", () => {
  assert.equal(installmentDueDate(1), "2025-09-10");
  assert.equal(installmentDueDate(5), "2026-01-10");
  assert.equal(installmentDueDate(240), "2045-08-10");
});

test("la primera cuota replica la planilla (interés prorrateado del banco)", () => {
  // Abonada con el UVA/TC históricos de la planilla.
  const [first] = schedule(1).installments;
  assert.equal(first.interest, 224.51);
  assert.equal(first.capital, 108.38);
  assert.equal(first.other, 0.78);
  assert.equal(first.vat, 0.15);
  assert.equal(first.total, 333.82);
  assert.equal(first.capitalBalance, 55778.53);
  assert.equal(first.uva, 1579.75);
  assert.equal(first.uvaVariation, 0);
  assert.equal(first.arsCapital, 171213.31);
  assert.equal(first.arsInterest, 354669.67);
  assert.equal(first.arsOther, 1232.21);
  assert.equal(first.arsVat, 236.96);
  assert.equal(first.arsTotal, 527352.15);
  assert.equal(first.totalArs, 88116132.77);
  assert.equal(first.totalUsd, 61404.97);
});

test("las demás cuotas replican el cuadro de amortización de la planilla", () => {
  const { installments } = schedule();

  const second = installments[1];
  assert.equal(second.capital, 109.01);
  assert.equal(second.interest, 320.1);
  assert.equal(second.total, 430.04);
  assert.equal(second.capitalBalance, 55670.15);
  assert.equal(second.uvaVariation, 1.89);
  assert.equal(second.arsCapital, 175451.87);
  assert.equal(second.arsInterest, 515229.69);

  // Desde la cuota 5 bajan los cargos fijos (0,48 + 0,10 de IVA).
  const fifth = installments[4];
  assert.equal(fifth.capital, 110.9);
  assert.equal(fifth.interest, 318.21);
  assert.equal(fifth.other, 0.48);
  assert.equal(fifth.vat, 0.1);
  assert.equal(fifth.total, 429.69);
  assert.equal(fifth.capitalBalance, 55341.25);

  assert.equal(installments[14].capitalBalance, 54203.14);
  assert.equal(installments[210].capitalBalance, 11793.01);

  const last = installments[239];
  assert.equal(last.capitalBalance, 426.56);
  assert.equal(last.capital, 426.66);
  assert.equal(last.interest, 2.45);
  assert.equal(last.total, 429.69);
});

test("usa el último UVA publicado para vencimientos sin dato", () => {
  const { installments } = schedule();
  const future = installments[20];
  assert.equal(future.uva, 2185.48);
  assert.equal(future.uvaIsEstimated, true);
  const published = installments[0];
  assert.equal(published.uva, 1579.75);
  assert.equal(published.uvaIsEstimated, false);
});

test("las cuotas abonadas usan los valores guardados y ajustan el resumen", () => {
  const { summary, installments } = schedule(3);
  assert.equal(installments[0].paid, true);
  assert.equal(installments[0].exchangeRate, 1435);
  assert.equal(installments[3].paid, false);
  assert.equal(installments[3].exchangeRate, 1640);
  assert.equal(summary.paidInstallments, 3);
  assert.equal(summary.remainingInstallments, LOAN.months - 3);
  // Capital restante = original - capital de las cuotas pagas, según planilla.
  assert.equal(summary.remainingCapital, 55451.51);
  assert.equal(summary.originalArs, 87_000_000);
  assert.equal(summary.originalUsd, 66159.7);
});
