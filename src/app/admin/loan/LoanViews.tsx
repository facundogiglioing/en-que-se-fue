"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Tabs } from "@/components/Tabs";
import { LOAN, type LoanInstallment, type LoanSummary } from "@/lib/loan";
import { formatLoanDate, formatLoanNumber } from "@/lib/loan-format";
import PaidToggle from "./PaidToggle";

type Props = {
  summary: LoanSummary;
  installments: LoanInstallment[];
  currentUvaDate: string;
  children: ReactNode;
};

function InstallmentCard({ item }: { item: LoanInstallment }) {
  const details = [
    { label: "Interés", value: item.interest, ars: item.arsInterest },
    { label: "Seguro", value: item.other, ars: item.arsOther },
    { label: "IVA", value: item.vat, ars: item.arsVat },
  ];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-primary-text">
            Cuota N.º {item.number}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Vencimiento: {formatLoanDate(item.dueDate)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{item.paid ? "Pagada" : "Pendiente"}</span>
          <PaidToggle
            installmentNumber={item.number}
            paid={item.paid}
            dueDateLabel={formatLoanDate(item.dueDate)}
            totalArsLabel={`$${formatLoanNumber(item.arsTotal)}`}
          />
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 border-y border-slate-200 py-4 sm:grid-cols-2">
        {details.map(({ label, value, ars }) => (
          <div key={label} className="flex justify-between gap-2 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-mono text-slate-700">
              <span className="block">${formatLoanNumber(ars)}</span>
              <span className="block text-xs text-slate-500">
                {formatLoanNumber(value)} UVA
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-slate-600">Capital</dt>
          <dd className="text-right font-mono font-semibold text-primary-text">
            <span className="block">${formatLoanNumber(item.arsCapital)}</span>
            <span className="block text-xs">
              {formatLoanNumber(item.capital)} UVA
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-slate-600">Importe cuota</dt>
          <dd className="text-right font-mono font-semibold text-primary-text">
            <span className="block">${formatLoanNumber(item.arsTotal)}</span>
            <span className="block text-xs">
              {formatLoanNumber(item.total)} UVA
            </span>
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        UVA{" "}
        {item.uvaIsEstimated
          ? "estimado"
          : item.paid
            ? "registrado"
            : "del vencimiento"}
        : ${formatLoanNumber(item.uva)}
        {item.uvaIsEstimated && ". Los importes en pesos son estimados."}
      </p>
    </article>
  );
}

function LoanOverview({
  summary,
  installments,
  currentUvaDate,
}: Omit<Props, "children">) {
  const [filter, setFilter] = useState<"pending" | "paid">("pending");
  const next = installments.find((item) => !item.paid);
  const filtered = installments.filter((item) =>
    filter === "paid" ? item.paid : !item.paid,
  );
  const capitalPaid = summary.originalCapital - summary.remainingCapital;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-900">Préstamo UVA</h2>
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Próxima cuota
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-primary-text">
              {next ? `$${formatLoanNumber(next.arsTotal)}` : "Sin cuotas"}
            </p>
            {next && (
              <>
                <p className="mt-1 font-mono text-sm text-slate-700">
                  {formatLoanNumber(next.total)} UVA
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Vencimiento: {formatLoanDate(next.dueDate)}
                  {next.uvaIsEstimated && " · Importe en pesos estimado"}
                </p>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-slate-500">
              TNA
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-primary-text">
              {(LOAN.tna * 100).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
              %
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Cuotas pagadas
            </p>
            <p className="mt-1 text-lg font-bold text-primary-text">
              {summary.paidInstallments} de {installments.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-slate-500">
              N.º próxima cuota
            </p>
            <p className="mt-1 text-lg font-bold text-primary-text">
              {next?.number ?? "—"}
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-2 rounded-xl bg-slate-100 p-4 text-sm">
          {[
            { label: "Capital original", value: summary.originalCapital },
            { label: "Capital cancelado", value: capitalPaid },
            { label: "Saldo", value: summary.remainingCapital },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-slate-600">{label}</dt>
              <dd className="text-right font-mono font-semibold text-primary-text">
                <span className="block">
                  ${formatLoanNumber(value * summary.currentUva)}
                </span>
                <span className="block text-xs">
                  {formatLoanNumber(value)} UVA
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate-500">
          Capitales en pesos valuados al último UVA informado: $
          {formatLoanNumber(summary.currentUva)} al{" "}
          {formatLoanDate(currentUvaDate)}. No representan los pesos
          desembolsados o pagados históricamente.
        </p>

        <div className="mt-6 border-b border-border-primary">
          <Tabs
            id="loan-installments"
            label="Cuotas del préstamo"
            tabs={[
              { id: "pending", label: "Próximas cuotas" },
              { id: "paid", label: "Cuotas pagadas" },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>
        <section
          role="tabpanel"
          id={`loan-installments-panel-${filter}`}
          aria-labelledby={`loan-installments-tab-${filter}`}
          className="mt-5 space-y-4"
        >
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <InstallmentCard key={item.number} item={item} />
            ))
          ) : (
            <p className="py-6 text-sm text-slate-500">
              {filter === "paid"
                ? "Todavía no hay cuotas pagadas."
                : "No hay cuotas pendientes."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export function LoanViews({
  summary,
  installments,
  currentUvaDate,
  children,
}: Props) {
  const [view, setView] = useState<"detail" | "summary">("detail");

  return (
    <div className="flex h-full min-h-0 flex-col text-slate-800">
      <div className="shrink-0 border-b border-border-primary px-5 pt-4 sm:px-8">
        <Tabs
          id="loan"
          label="Vistas del préstamo"
          tabs={[
            { id: "detail", label: "Todas las cuotas" },
            { id: "summary", label: "Resumen" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>
      {view === "detail" ? (
        <section
          role="tabpanel"
          id="loan-panel-detail"
          aria-labelledby="loan-tab-detail"
          className="flex min-h-0 flex-1 flex-col"
        >
          {children}
        </section>
      ) : (
        <section
          role="tabpanel"
          id="loan-panel-summary"
          aria-labelledby="loan-tab-summary"
          className="flex min-h-0 flex-1 flex-col"
        >
          <LoanOverview
            summary={summary}
            installments={installments}
            currentUvaDate={currentUvaDate}
          />
        </section>
      )}
    </div>
  );
}
