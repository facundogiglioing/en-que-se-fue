import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type DashboardData,
  getMonthlyPayments,
  getMonthlyTotals,
} from "./dashboard";

function fixture(): DashboardData {
  return {
    expenses: [
      {
        id: "rent",
        name: "Alquiler",
        category: "Otros",
        dueDate: 5,
        estimatedAmount: 1000,
      },
      { id: "service", name: "Servicio", category: "Servicios", dueDate: 31 },
    ],
    cards: [
      {
        id: "card",
        name: "Tarjeta",
        bank: "Ciudad",
        dueDay: 10,
        closingDay: 25,
        order: 0,
        last4Digits: "0000",
      },
      {
        id: "empty",
        name: "Sin consumos",
        bank: "Ciudad",
        dueDay: 20,
        closingDay: 25,
        order: 1,
        last4Digits: "0001",
      },
    ],
    purchases: [
      {
        id: "purchase",
        cardId: "card",
        description: "Compra",
        totalAmount: 600,
        installments: 3,
        startMonth: 9,
        startYear: 2026,
        category: "Otros",
      },
    ],
    payments: [],
    cardPayments: [],
  };
}

test("totals include only the active installment and explicitly report unknown amounts", () => {
  const rows = getMonthlyPayments(fixture(), 10, 2026);
  assert.equal(rows.length, 3);
  assert.deepEqual(getMonthlyTotals(rows), {
    total: 1200,
    paid: 0,
    pending: 1200,
    paidCount: 0,
    pendingCount: 3,
    unknownCount: 1,
  });
});

test("confirmed actual amounts replace estimates, including zero, without double counting", () => {
  const data = fixture();
  data.payments = [
    {
      id: "paid-rent",
      expenseId: "rent",
      month: 10,
      year: 2026,
      actualAmount: 900,
      isPaid: true,
    },
  ];
  data.cardPayments = [
    {
      id: "paid-card",
      cardId: "card",
      month: 10,
      year: 2026,
      actualAmount: 0,
      isPaid: true,
    },
  ];
  const totals = getMonthlyTotals(getMonthlyPayments(data, 10, 2026));
  assert.equal(totals.total, 900);
  assert.equal(totals.paid, 900);
  assert.equal(totals.pending, 0);
  assert.equal(totals.paidCount, 2);
});

test("unconfirmed records do not mark a concept paid or use an actual amount", () => {
  const data = fixture();
  data.payments = [
    {
      id: "unpaid",
      expenseId: "rent",
      month: 10,
      year: 2026,
      actualAmount: 50,
      isPaid: false,
    },
  ];
  const rent = getMonthlyPayments(data, 10, 2026).find(
    (row) => row.entityId === "rent",
  );
  assert.equal(rent?.isPaid, false);
  assert.equal(rent?.amount, 1000);
});

test("due dates clamp to the last day of the month and pending rows sort first", () => {
  const data = fixture();
  data.payments = [
    {
      id: "paid",
      expenseId: "rent",
      month: 1,
      year: 2028,
      isPaid: true,
      actualAmount: 1000,
    },
  ];
  const rows = getMonthlyPayments(data, 1, 2028);
  assert.equal(rows[0].entityId, "service");
  assert.equal(rows[0].dueDay, 29);
  assert.equal(rows.at(-1)?.entityId, "rent");
});

test("arrears projects December consumptions into January and matches payment year", () => {
  const data = fixture();
  data.cards[0].paysInArrears = true;
  data.purchases[0].startMonth = 11;
  data.cardPayments = [
    {
      id: "old",
      cardId: "card",
      month: 0,
      year: 2026,
      isPaid: true,
      actualAmount: 999,
    },
    {
      id: "new",
      cardId: "card",
      month: 0,
      year: 2027,
      isPaid: true,
      actualAmount: 180,
    },
  ];
  const card = getMonthlyPayments(data, 0, 2027).find(
    (row) => row.entityId === "card",
  );
  assert.equal(card?.estimatedAmount, 200);
  assert.equal(card?.amount, 180);
  assert.equal(card?.isPaid, true);
});

test("paid cards remain visible without purchases and credits reduce the pending total", () => {
  const data = fixture();
  data.cardPayments = [
    {
      id: "paid",
      cardId: "empty",
      month: 10,
      year: 2026,
      actualAmount: 75,
      isPaid: true,
    },
  ];
  data.purchases[0].totalAmount = -300;
  const rows = getMonthlyPayments(data, 10, 2026);
  assert.equal(rows.find((row) => row.entityId === "empty")?.amount, 75);
  assert.equal(getMonthlyTotals(rows).pending, 900);
  assert.equal(getMonthlyTotals(rows).paid, 75);
});
