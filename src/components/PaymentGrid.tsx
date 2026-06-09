"use client";

import { CheckCircle2, CreditCard, Zap } from "lucide-react";
import { useState } from "react";
import {
  type ModalData,
  PaymentConfirmModal,
} from "@/components/PaymentConfirmModal";
import { getInstallmentInfo } from "@/lib/utils";
import type {
  CardPayment,
  CreditCard as CreditCardType,
  Expense,
  Payment,
  Transaction,
} from "@/types";

interface Props {
  expenses: Expense[];
  cards: CreditCardType[];
  purchases: Transaction[];
  payments: Payment[];
  cardPayments: CardPayment[];
  currentYear: number;
  currentMonthIdx: number;
}

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function PaymentGrid({
  expenses,
  cards,
  purchases,
  payments,
  cardPayments,
  currentYear,
  currentMonthIdx,
}: Props) {
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const findExpensePayment = (expenseId: string, monthIdx: number) =>
    payments.find(
      (p) =>
        p.expenseId === expenseId &&
        p.month === monthIdx &&
        p.year === currentYear,
    );

  const findCardPayment = (cardId: string, monthIdx: number) =>
    cardPayments.find(
      (p) =>
        p.cardId === cardId && p.month === monthIdx && p.year === currentYear,
    );

  const openExpenseModal = (exp: Expense, monthIdx: number) => {
    if (monthIdx > currentMonthIdx) return; // no confirmar futuro
    const existing = findExpensePayment(exp.id, monthIdx);
    setModalData({
      type: "expense",
      entityId: exp.id,
      entityName: exp.name,
      month: monthIdx,
      year: currentYear,
      estimatedAmount: exp.estimatedAmount ?? 0,
      existingPayment: existing
        ? { actualAmount: existing.actualAmount, paidAt: existing.paidAt }
        : undefined,
    });
  };

  const openCardModal = (
    card: CreditCardType,
    monthIdx: number,
    monthlyTotal: number,
  ) => {
    if (monthIdx > currentMonthIdx) return;
    if (monthlyTotal === 0) return;
    const existing = findCardPayment(card.id, monthIdx);
    setModalData({
      type: "card",
      entityId: card.id,
      entityName: `${card.name} · ${card.bank}`,
      month: monthIdx,
      year: currentYear,
      estimatedAmount: monthlyTotal,
      existingPayment: existing
        ? { actualAmount: existing.actualAmount, paidAt: existing.paidAt }
        : undefined,
    });
  };

  return (
    <>
      <div className="bg-white rounded-4xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-5 text-left min-w-55 sticky left-0 bg-slate-50/80 backdrop-blur-md z-10">
                  <span className="text-xxs font-black uppercase tracking-widest text-slate-400">
                    Concepto
                  </span>
                </th>
                {MONTH_NAMES.map((m, i) => (
                  <th
                    key={m}
                    className={`p-4 text-center min-w-25 ${i === currentMonthIdx ? "bg-blue-600/5" : ""}`}
                  >
                    <span
                      className={`text-xxs font-black uppercase tracking-widest ${i === currentMonthIdx ? "text-blue-600" : "text-slate-400"}`}
                    >
                      {m}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* --- SECCIÓN: SERVICIOS --- */}
              <tr className="bg-slate-50/30">
                <td
                  colSpan={13}
                  className="px-5 py-2 font-black text-[9px] uppercase tracking-[0.3em] text-blue-600 border-y border-slate-100"
                >
                  Gastos Fijos y Servicios
                </td>
              </tr>
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 border-r border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-slate-900 transition-colors">
                        <Zap size={14} />
                      </div>
                      <span className="font-bold text-slate-700 tracking-tight">
                        {exp.name}
                      </span>
                    </div>
                  </td>
                  {MONTH_NAMES.map((m, i) => {
                    const payment = findExpensePayment(exp.id, i);
                    const isPaid = !!payment;
                    const isCurrent = i === currentMonthIdx;
                    const isPast = i < currentMonthIdx;
                    const isClickable = i <= currentMonthIdx;
                    const displayAmount =
                      isPaid && payment.actualAmount != null
                        ? payment.actualAmount
                        : exp.estimatedAmount;

                    return (
                      <td
                        key={m}
                        onClick={() => openExpenseModal(exp, i)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && openExpenseModal(exp, i)
                        }
                        className={[
                          "p-3 text-center transition-colors",
                          isClickable ? "cursor-pointer" : "",
                          isPaid
                            ? "bg-emerald-50/70 hover:bg-emerald-50"
                            : isCurrent
                              ? "bg-blue-600/2 hover:bg-blue-600/5"
                              : isPast
                                ? "hover:bg-amber-50/40"
                                : "",
                        ].join(" ")}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          {isPaid ? (
                            <>
                              <CheckCircle2
                                size={12}
                                className="text-emerald-500"
                              />
                              <span className="font-mono font-bold text-emerald-700 text-sm">
                                ${displayAmount?.toLocaleString("es-AR")}
                              </span>
                              {payment.actualAmount != null &&
                                payment.actualAmount !==
                                exp.estimatedAmount && (
                                  <span className="text-[9px] font-bold text-emerald-400 line-through">
                                    $
                                    {exp.estimatedAmount?.toLocaleString(
                                      "es-AR",
                                    )}
                                  </span>
                                )}
                            </>
                          ) : (
                            <>
                              <span
                                className={`text-[9px] font-black uppercase tracking-tighter ${isCurrent ? "text-blue-400" : isPast ? "text-amber-400" : "text-slate-300"}`}
                              >
                                {isCurrent
                                  ? "Confirmar"
                                  : isPast
                                    ? "Sin pagar"
                                    : `Día ${exp.dueDate}`}
                              </span>
                              <span
                                className={`font-mono font-bold ${isCurrent ? "text-slate-900" : isPast ? "text-slate-500" : "text-slate-900"}`}
                              >
                                ${exp.estimatedAmount?.toLocaleString("es-AR")}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* --- SECCIÓN: TARJETAS --- */}
              <tr className="bg-slate-50/30">
                <td
                  colSpan={13}
                  className="px-5 py-2 font-black text-[9px] uppercase tracking-[0.3em] text-green-600 border-y border-slate-100"
                >
                  Tarjetas de Crédito
                </td>
              </tr>
              {cards.map((card) => {
                const transactionsList = purchases.filter(
                  (p) => p.cardId === card.id,
                );
                return (
                  <tr
                    key={card.id}
                    className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 border-r border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-slate-900 transition-colors">
                          <CreditCard size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 tracking-tight leading-none">
                            {card.name}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                            {card.bank}
                          </p>
                        </div>
                      </div>
                    </td>
                    {MONTH_NAMES.map((m, i) => {
                      let monthlyTotal = 0;
                      for (const p of transactionsList) {
                        const info = getInstallmentInfo(p, i, currentYear);
                        monthlyTotal += info ? info.amount : 0;
                      }

                      const cardPayment = findCardPayment(card.id, i);
                      const isPaid = !!cardPayment;
                      const isCurrent = i === currentMonthIdx;
                      const isPast = i < currentMonthIdx;
                      const isClickable =
                        i <= currentMonthIdx && monthlyTotal > 0;
                      const displayAmount =
                        isPaid && cardPayment.actualAmount != null
                          ? cardPayment.actualAmount
                          : monthlyTotal;

                      return (
                        <td
                          key={m}
                          onClick={() => openCardModal(card, i, monthlyTotal)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            openCardModal(card, i, monthlyTotal)
                          }
                          className={[
                            "p-3 text-center transition-colors",
                            isClickable ? "cursor-pointer" : "",
                            isPaid
                              ? "bg-emerald-50/70 hover:bg-emerald-50"
                              : isCurrent && monthlyTotal > 0
                                ? "bg-blue-600/2 hover:bg-blue-600/5"
                                : isPast && monthlyTotal > 0
                                  ? "hover:bg-amber-50/40"
                                  : "",
                          ].join(" ")}
                        >
                          {monthlyTotal > 0 || isPaid ? (
                            <div className="flex flex-col items-center gap-0.5">
                              {isPaid ? (
                                <>
                                  <CheckCircle2
                                    size={12}
                                    className="text-emerald-500"
                                  />
                                  <span className="font-mono font-bold text-emerald-700 text-sm">
                                    $
                                    {displayAmount.toLocaleString("es-AR", {
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                  {cardPayment.actualAmount != null &&
                                    Math.round(cardPayment.actualAmount) !==
                                    Math.round(monthlyTotal) && (
                                      <span className="text-[9px] font-bold text-emerald-400 line-through">
                                        $
                                        {monthlyTotal.toLocaleString("es-AR", {
                                          maximumFractionDigits: 0,
                                        })}
                                      </span>
                                    )}
                                </>
                              ) : (
                                <>
                                  <span
                                    className={`text-[9px] font-black uppercase tracking-tighter ${isCurrent ? "text-blue-400" : isPast ? "text-amber-400" : "text-green-400"}`}
                                  >
                                    {isCurrent
                                      ? "Confirmar"
                                      : isPast
                                        ? "Sin pagar"
                                        : `Vto ${card.dueDay}`}
                                  </span>
                                  <span
                                    className={`font-mono font-bold ${isCurrent ? "text-slate-900" : isPast ? "text-slate-500" : "text-green-700"}`}
                                  >
                                    $
                                    {monthlyTotal.toLocaleString("es-AR", {
                                      maximumFractionDigits: 0,
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-100 italic">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER LEGEND */}
      <div className="flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600/10 rounded-sm" />
          <span className="text-xxs font-bold uppercase text-slate-400">
            Mes Actual
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-100 rounded-sm border border-emerald-200" />
          <span className="text-xxs font-bold uppercase text-slate-400">
            Pago Confirmado
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 rounded-sm border border-green-100" />
          <span className="text-xxs font-bold uppercase text-slate-400">
            Consumo de Tarjeta
          </span>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalData && (
        <PaymentConfirmModal
          data={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </>
  );
}
