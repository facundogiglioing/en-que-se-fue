import assert from "node:assert/strict";
import { test } from "node:test";
import type { ParsedStatement, Transaction } from "@/types";
import { buildStatementDiff } from "./diff";
import { resolvePeriodIndex } from "./period";

test("uses the selected month and adjusts arrears across year boundaries", () => {
  assert.equal(resolvePeriodIndex("202611", false), 202611);
  assert.equal(resolvePeriodIndex("202611", true), 202610);
  assert.equal(resolvePeriodIndex("202701", true), 202612);
});

test("rejects missing or invalid selected periods instead of defaulting to today", () => {
  for (const value of [
    null,
    "",
    "202600",
    "202613",
    "202611.5",
    "NaN",
    new Blob(),
  ]) {
    assert.throws(() => resolvePeriodIndex(value, false), /mes seleccionado/);
  }
});

const statement: ParsedStatement = {
  bankId: "banco-ciudad",
  summary: {
    bank: "Banco Ciudad",
    ownerName: "TEST",
    totalAmount: 100,
    closingDate: "2026-09-25",
    dueDate: "2026-10-05",
  },
  movements: [{ date: "2026-09-01", description: "COMPRA", amountArs: 100 }],
};

const transaction: Transaction = {
  id: "test-purchase",
  cardId: "test-card",
  description: "COMPRA",
  totalAmount: 100,
  installments: 1,
  startMonth: 10,
  startYear: 2026,
  category: "Otros",
};

test("duplicate detection uses the selected period, not the PDF closing date", () => {
  assert.equal(
    buildStatementDiff(statement, [transaction], 202611).movements[0].exists,
    true,
  );
  assert.equal(
    buildStatementDiff(statement, [transaction], 202609).movements[0].exists,
    false,
  );
});

test("duplicate detection projects the installment into the selected period", () => {
  const installmentStatement: ParsedStatement = {
    ...statement,
    movements: [{ ...statement.movements[0], installment: "03/03" }],
  };
  const installmentTransaction: Transaction = {
    ...transaction,
    startMonth: 8,
    totalAmount: 300,
    installments: 3,
  };
  assert.equal(
    buildStatementDiff(installmentStatement, [installmentTransaction], 202611)
      .movements[0].exists,
    true,
  );
  assert.equal(
    buildStatementDiff(installmentStatement, [installmentTransaction], 202610)
      .movements[0].exists,
    false,
  );
});
