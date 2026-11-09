"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  Pencil,
  Zap,
} from "lucide-react";
import { useState, useTransition } from "react";
import { confirmCardPayment } from "@/actions/cardPayment";
import { confirmExpensePayment } from "@/actions/payment";
import {
  type DashboardData,
  formatDashboardMoney,
  getMonthlyPayments,
  getMonthlyTotals,
  type MonthlyPayment,
} from "@/lib/dashboard";
import { shiftMonthYear } from "@/lib/utils";
import {
  type ModalData,
  PaymentConfirmModal,
  paymentModalData,
} from "./PaymentConfirmModal";
import { PaymentGrid } from "./PaymentGrid";

type Props = DashboardData & {
  currentYear: number;
  currentMonthIdx: number;
  currentDay: number;
};
type Filter = "all" | "pending" | "paid";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendientes" },
  { id: "paid", label: "Confirmados" },
];

function periodLabel(month: number, year: number) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

function PaymentRow({
  row,
  month,
  year,
  today,
  isProjection,
  onManage,
}: {
  row: MonthlyPayment;
  month: number;
  year: number;
  today: number;
  isProjection: boolean;
  onManage: () => void;
}) {
  const [editing, setEditing] = useState(row.amount === null);
  const [amount, setAmount] = useState(row.amount?.toFixed(2) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const amountValue = editing ? Number(amount) : row.amount;
  const validAmount =
    amountValue !== null &&
    Number.isFinite(amountValue) &&
    amountValue >= 0 &&
    (!editing || amount.trim() !== "");
  const noDebt = row.type === "card" && row.amount !== null && row.amount <= 0;
  const dueLabel =
    row.isPaid || isProjection || noDebt
      ? `Día ${row.dueDay}`
      : row.dueDay < today
        ? `Venció el ${row.dueDay}`
        : row.dueDay === today
          ? "Vence hoy"
          : `Día ${row.dueDay}`;

  function confirm() {
    if (!validAmount || amountValue === null) {
      setError("Ingresá un monto válido, mayor o igual a cero.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (row.type === "expense") {
          await confirmExpensePayment(row.entityId, month, year, amountValue);
        } else {
          await confirmCardPayment(row.entityId, month, year, amountValue);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo confirmar el pago. Reintentá.",
        );
      }
    });
  }

  const Icon = row.type === "card" ? CreditCard : Zap;
  return (
    <tr className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-t border-slate-100 text-sm sm:table-row">
      <th
        scope="row"
        className="col-span-2 px-4 pt-4 pb-2 text-left font-normal sm:px-5 sm:py-4"
      >
        <div className="flex items-center gap-3">
          <span className="hidden rounded-lg bg-slate-50 p-2 text-slate-400 sm:block">
            <Icon size={16} />
          </span>
          <div>
            <span className="font-semibold text-slate-800">{row.name}</span>
            <p className="mt-1 text-xs text-slate-400">{row.detail}</p>
            {row.paymentCode && (
              <details className="mt-2 text-xs font-normal text-slate-500">
                <summary className="cursor-pointer">Código de pago</summary>
                <span className="mt-1 block break-all font-mono text-slate-800 select-all">
                  {row.paymentCode}
                </span>
              </details>
            )}
          </div>
        </div>
      </th>
      <td
        className={`px-4 py-2 whitespace-nowrap text-xs sm:px-3 sm:py-4 ${!row.isPaid && !isProjection && !noDebt && row.dueDay <= today ? "font-semibold text-danger-text" : "text-slate-500"}`}
      >
        {dueLabel}
      </td>
      <td className="px-4 py-2 text-right whitespace-nowrap sm:px-3 sm:py-4">
        {editing && !row.isPaid && !isProjection ? (
          <input
            aria-label={`Monto a pagar de ${row.name}`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            disabled={pending}
            onChange={(event) => setAmount(event.target.value)}
            className="w-32 rounded-lg border border-slate-200 px-2 py-2 text-right font-mono text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        ) : (
          <span className="font-mono font-semibold text-slate-800">
            {row.amount === null
              ? "Sin monto"
              : formatDashboardMoney(row.amount)}
          </span>
        )}
        {!row.isPaid && !isProjection && !editing && !noDebt && (
          <button
            type="button"
            aria-label={`Editar monto de ${row.name}`}
            onClick={() => setEditing(true)}
            className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil size={13} />
          </button>
        )}
      </td>
      <td className="px-4 pt-2 pb-4 text-xs whitespace-nowrap sm:px-3 sm:py-4">
        {row.isPaid ? (
          <span className="inline-flex items-center gap-1 text-success-text">
            <Check size={14} /> Pagado
          </span>
        ) : (
          <span className="text-slate-400">
            {isProjection ? "Proyectado" : noDebt ? "Sin deuda" : "Pendiente"}
          </span>
        )}
      </td>
      <td className="px-4 pt-2 pb-4 text-right sm:px-5 sm:py-4">
        {row.isPaid ? (
          <button
            type="button"
            onClick={onManage}
            className="text-xs font-medium text-slate-500 underline-offset-4 hover:underline"
          >
            Gestionar pago
          </button>
        ) : !isProjection && !noDebt ? (
          <button
            type="button"
            onClick={confirm}
            disabled={pending || !validAmount}
            aria-label={`Confirmar pago de ${row.name}`}
            className="whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-success-text transition hover:bg-success disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Guardando..." : "Confirmar pago"}
          </button>
        ) : (
          <span className="text-slate-300">—</span>
        )}
        {error && (
          <p role="alert" className="mt-2 max-w-56 text-xs text-danger-text">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}

export function Dashboard(props: Props) {
  const [view, setView] = useState<"operational" | "annual">("operational");
  const [nextMonth, setNextMonth] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [collapsed, setCollapsed] = useState<Set<MonthlyPayment["type"]>>(
    new Set(),
  );
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const period = shiftMonthYear(
    props.currentMonthIdx,
    props.currentYear,
    nextMonth ? 1 : 0,
  );
  const rows = getMonthlyPayments(props, period.month, period.year);
  const totals = getMonthlyTotals(rows);
  const filtered = rows.filter(
    (row) => filter === "all" || (filter === "paid" ? row.isPaid : !row.isPaid),
  );
  const groups = (["expense", "card"] as const)
    .map((type) => ({
      type,
      rows: filtered.filter((row) => row.type === type),
    }))
    .filter((group) => group.rows.length > 0)
    .sort(
      (a, b) =>
        (a.rows.find((row) => !row.isPaid)?.dueDay ?? 32) -
        (b.rows.find((row) => !row.isPaid)?.dueDay ?? 32),
    );
  const dueNow = rows.filter(
    (row) =>
      !row.isPaid &&
      row.dueDay <= props.currentDay &&
      (row.amount === null || row.amount > 0),
  );

  return (
    <div className="flex h-full min-h-0 flex-col text-slate-800">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border-primary px-5 pt-4 sm:px-8">
        <div
          className="flex gap-6"
          role="tablist"
          aria-label="Vistas del tablero"
        >
          {(
            [
              { id: "operational", label: "Este mes" },
              { id: "annual", label: "Histórico / Proyección" },
            ] as const
          ).map((tab) => (
            <button
              type="button"
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={view === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={view === tab.id ? 0 : -1}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const target =
                  event.key === "Home"
                    ? "operational"
                    : event.key === "End"
                      ? "annual"
                      : view === "annual"
                        ? "operational"
                        : "annual";
                setView(target);
                document.getElementById(`tab-${target}`)?.focus();
              }}
              onClick={() => setView(tab.id)}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${view === tab.id ? "border-primary-text text-primary-text" : "border-transparent text-slate-400 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="flex items-center gap-2 pb-3 text-xs text-slate-500">
          <CalendarDays size={16} /> {props.currentDay} de{" "}
          {periodLabel(props.currentMonthIdx, props.currentYear)}
        </span>
      </div>

      {view === "annual" ? (
        <section
          role="tabpanel"
          id="panel-annual"
          aria-labelledby="tab-annual"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="px-5 py-4 sm:px-8">
            <h2 className="font-semibold">
              Proyección anual {props.currentYear}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Los 12 meses. Seleccioná un importe para gestionar su pago; los
              meses futuros son una proyección.
            </p>
          </div>
          <PaymentGrid {...props} />
        </section>
      ) : (
        <section
          role="tabpanel"
          id="panel-operational"
          aria-labelledby="tab-operational"
          className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 px-5 py-5 sm:px-8 sm:py-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold capitalize">
              {periodLabel(period.month, period.year)}
            </h2>
            <div
              className="flex rounded-lg border border-slate-200 bg-white p-1"
              role="group"
              aria-label="Mes a consultar"
            >
              {[
                { next: false, label: "Mes actual" },
                { next: true, label: "Próximo mes" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  aria-pressed={nextMonth === item.next}
                  onClick={() => setNextMonth(item.next)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold ${nextMonth === item.next ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total del mes",
                amount: totals.total,
                detail: `${rows.length} conceptos`,
                color: "text-slate-900",
              },
              {
                label: "Pagado hasta hoy",
                amount: totals.paid,
                detail: `${totals.paidCount} confirmados`,
                color: "text-success-text",
              },
              {
                label: "Pendiente por pagar",
                amount: totals.pending,
                detail: `${totals.pendingCount} pendientes`,
                color: "text-primary-text",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <p className="text-xs font-medium text-slate-500">
                  {kpi.label}
                </p>
                <p
                  className={`mt-3 font-mono text-xl font-bold tracking-tight lg:text-2xl ${kpi.color}`}
                >
                  {formatDashboardMoney(kpi.amount)}
                </p>
                <p className="mt-2 text-xs text-slate-400">{kpi.detail}</p>
              </div>
            ))}
          </div>
          <div className="my-5 text-sm text-slate-500" aria-live="polite">
            {nextMonth
              ? "Proyección del próximo mes. Los pagos se confirman cuando comienza el mes."
              : dueNow.length > 0
                ? `${dueNow.length} pago(s) vencido(s) o con vencimiento hoy. Revisalos primero.`
                : "No hay pagos pendientes con vencimiento hoy o anterior."}
            {totals.unknownCount > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                {totals.unknownCount} concepto(s) sin monto. Los totales son
                parciales hasta completarlos.
              </p>
            )}
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Gastos del mes</h3>
            <div
              className="flex gap-1 rounded-lg bg-slate-100 p-1"
              role="group"
              aria-label="Filtrar pagos"
            >
              {filters.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold ${filter === item.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {groups.map((group) => {
              const isCollapsed = collapsed.has(group.type);
              return (
                <section
                  key={group.type}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={!isCollapsed}
                    aria-controls={`payments-${group.type}`}
                    onClick={() =>
                      setCollapsed((previous) => {
                        const updated = new Set(previous);
                        if (updated.has(group.type)) updated.delete(group.type);
                        else updated.add(group.type);
                        return updated;
                      })
                    }
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold">
                      {group.type === "expense"
                        ? "Gastos fijos y servicios"
                        : "Tarjetas de crédito"}{" "}
                      <span className="ml-2 font-normal text-slate-400">
                        ({group.rows.length})
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition ${isCollapsed ? "-rotate-90" : ""}`}
                    />
                  </button>
                  {!isCollapsed && (
                    <div
                      id={`payments-${group.type}`}
                      className="overflow-x-auto"
                    >
                      <table className="block w-full text-left sm:table">
                        <caption className="sr-only">
                          {group.type === "expense"
                            ? "Gastos fijos"
                            : "Tarjetas"}{" "}
                          de {periodLabel(period.month, period.year)}
                        </caption>
                        <thead className="sr-only border-t border-slate-100 bg-slate-50/70 text-xs text-slate-400 sm:not-sr-only">
                          <tr>
                            <th scope="col" className="px-5 py-3 font-medium">
                              Concepto
                            </th>
                            <th scope="col" className="px-3 py-3 font-medium">
                              Vencimiento / Día
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-right font-medium"
                            >
                              Monto
                            </th>
                            <th scope="col" className="px-3 py-3 font-medium">
                              Estado
                            </th>
                            <th
                              scope="col"
                              className="px-5 py-3 text-right font-medium"
                            >
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="block sm:table-row-group">
                          {group.rows.map((row) => (
                            <PaymentRow
                              key={`${period.year}-${period.month}-${row.key}-${row.isPaid}-${row.amount}`}
                              row={row}
                              month={period.month}
                              year={period.year}
                              today={props.currentDay}
                              isProjection={nextMonth}
                              onManage={() =>
                                setModalData(
                                  paymentModalData(
                                    row,
                                    period.month,
                                    period.year,
                                  ),
                                )
                              }
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
            {groups.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
                {rows.length === 0
                  ? "Todavía no hay gastos ni consumos de tarjetas para este mes."
                  : filter === "pending"
                    ? "Todo al día. No quedan pagos pendientes."
                    : "No hay pagos para este filtro."}
              </div>
            )}
          </div>
        </section>
      )}
      {modalData && (
        <PaymentConfirmModal
          data={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}
