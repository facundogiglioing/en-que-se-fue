"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import {
  type DashboardData,
  formatDashboardMoney,
  getMonthlyPayments,
} from "@/lib/dashboard";
import {
  type ModalData,
  PaymentConfirmModal,
  paymentModalData,
} from "./PaymentConfirmModal";

type Props = DashboardData & {
  currentYear: number;
  currentMonthIdx: number;
};

export function PaymentGrid(props: Props) {
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const months = Array.from({ length: 12 }, (_, month) => ({
    month,
    label: new Intl.DateTimeFormat("es-AR", { month: "short" }).format(
      new Date(props.currentYear, month, 1),
    ),
    rows: getMonthlyPayments(props, month, props.currentYear),
  }));
  const concepts = [
    ...props.expenses.map((expense) => ({
      key: `expense-${expense.id}`,
      name: expense.name,
    })),
    ...props.cards.map((card) => ({ key: `card-${card.id}`, name: card.name })),
  ];

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Histórico y proyección de los 12 meses de {props.currentYear}
          </caption>
          <thead className="sticky top-0 z-20 bg-slate-50">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-30 min-w-48 bg-slate-50 px-5 py-4 text-left text-xs text-slate-500"
              >
                Concepto
              </th>
              {months.map(({ month, label }) => (
                <th
                  scope="col"
                  key={month}
                  className={`min-w-32 px-3 py-4 text-center text-xs capitalize ${month === props.currentMonthIdx ? "bg-primary text-primary-text" : "text-slate-500"}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {concepts.map((concept) => (
              <tr key={concept.key} className="border-b border-slate-100">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-5 py-4 text-left font-semibold text-slate-700"
                >
                  {concept.name}
                </th>
                {months.map(({ month, rows }) => {
                  const row = rows.find((item) => item.key === concept.key);
                  const canManage =
                    row &&
                    month <= props.currentMonthIdx &&
                    (row.type === "expense" ||
                      row.isPaid ||
                      (row.amount ?? 0) > 0);
                  return (
                    <td
                      key={month}
                      className={`p-2 text-center ${row?.isPaid ? "bg-success/40" : month === props.currentMonthIdx ? "bg-primary/20" : ""}`}
                    >
                      {row ? (
                        <button
                          type="button"
                          disabled={!canManage}
                          aria-label={`${concept.name}, ${months[month].label}: ${row.isPaid ? "pagado" : "pendiente"}, ${row.amount === null ? "sin monto" : formatDashboardMoney(row.amount)}`}
                          onClick={() =>
                            setModalData(
                              paymentModalData(row, month, props.currentYear),
                            )
                          }
                          className={`inline-flex w-full items-center justify-center gap-1 rounded-lg px-2 py-3 font-mono text-xs transition enabled:hover:bg-slate-100 disabled:cursor-default ${row.isPaid ? "text-success-text" : "text-slate-600"}`}
                        >
                          {row.isPaid && <Check size={12} />}
                          {row.amount === null
                            ? "Sin monto"
                            : formatDashboardMoney(row.amount)}
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {concepts.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-400">
            Todavía no hay conceptos cargados.
          </p>
        )}
      </div>
      <p className="shrink-0 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        ✓ Pagado · Fondo azul: mes actual · Los importes pendientes son
        estimados.
      </p>
      {modalData && (
        <PaymentConfirmModal
          data={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </>
  );
}
