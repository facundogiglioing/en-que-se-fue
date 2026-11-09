import { getLoanPayments } from "@/actions/loanPayment";
import { requireRoles } from "@/lib/auth-session";
import { getOficialExchangeRate, getUvaIndex } from "@/lib/indices";
import { buildLoanSchedule, LOAN } from "@/lib/loan";
import { ROLES } from "@/lib/roles";
import PaidToggle from "./PaidToggle";

export const dynamic = "force-dynamic";

const numCell = "px-3 py-1.5 text-right font-mono whitespace-nowrap";
const groupBorder = "border-l border-border-primary";

const fmt = (n: number) =>
  n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

export default async function LoanPage() {
  await requireRoles([ROLES.ADMIN]);

  const [uvaIndex, oficialRate, payments] = await Promise.all([
    getUvaIndex(),
    getOficialExchangeRate(),
    getLoanPayments(),
  ]);

  if (!uvaIndex) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-center">
          <p className="font-semibold text-slate-600">
            No se pudo obtener el índice UVA.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            El cálculo del préstamo necesita el valor UVA publicado por el BCRA.
            Reintentá en unos minutos.
          </p>
        </div>
      </div>
    );
  }

  const currentExchangeRate =
    oficialRate ?? payments.at(-1)?.exchangeRate ?? LOAN.exchangeRateAtStart;

  const { summary, installments } = buildLoanSchedule({
    uvaByDate: uvaIndex.byDate,
    latestUva: uvaIndex.latestValue,
    currentExchangeRate,
    payments,
  });

  const hasEstimatedUva = installments.some((item) => item.uvaIsEstimated);

  const summaryItems = [
    { label: "Capital (UVA)", value: fmt(summary.originalCapital) },
    { label: "Capital restante (UVA)", value: fmt(summary.remainingCapital) },
    { label: "UVA inicio", value: fmt(summary.uvaAtStart) },
    { label: "TC inicio", value: fmt(summary.exchangeRateAtStart) },
    { label: "Total ARS", value: fmt(summary.originalArs) },
    { label: "Total USD", value: fmt(summary.originalUsd) },
    { label: "UVA actual", value: fmt(summary.currentUva) },
    { label: "TC actual", value: fmt(summary.currentExchangeRate) },
    { label: "Pagadas", value: `${summary.paidInstallments}` },
    { label: "Faltan", value: `${summary.remainingInstallments}` },
  ];

  return (
    <div className="flex min-h-0 flex-col lg:h-full">
      {/* Resumen */}
      <div className="shrink-0 border-b border-border-primary bg-white px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {summary.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {summaryItems.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5"
            >
              <span className="block text-xxs font-bold uppercase tracking-wide text-slate-400">
                {label}
              </span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {value}
              </span>
            </div>
          ))}
        </div>
        {hasEstimatedUva && (
          <p className="mt-2 text-xs text-slate-400">
            * UVA estimado: para vencimientos sin valor publicado se usa el
            último UVA informado ({fmt(uvaIndex.latestValue)} al{" "}
            {fmtDate(uvaIndex.latestDate)}).
          </p>
        )}
      </div>

      {/* Tabla de cuotas */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-900 text-white">
            <tr>
              <th rowSpan={2} className="px-3 py-2 text-right font-semibold">
                #
              </th>
              <th rowSpan={2} className="px-3 py-2 text-right font-semibold">
                UVA
              </th>
              <th rowSpan={2} className="px-3 py-2 text-right font-semibold">
                Δ%
              </th>
              <th rowSpan={2} className="px-3 py-2 text-right font-semibold">
                TC
              </th>
              <th rowSpan={2} className="px-3 py-2 text-right font-semibold">
                Capital
              </th>
              <th
                colSpan={5}
                className={`px-3 py-1.5 text-center font-semibold ${groupBorder}`}
              >
                Cuota (UVA)
              </th>
              <th
                rowSpan={2}
                className={`px-3 py-2 font-semibold ${groupBorder}`}
              >
                P
              </th>
              <th rowSpan={2} className="px-3 py-2 text-left font-semibold">
                Vencimiento
              </th>
              <th
                colSpan={3}
                className={`px-3 py-1.5 text-center font-semibold ${groupBorder}`}
              >
                ARS
              </th>
              <th
                colSpan={2}
                className={`px-3 py-1.5 text-center font-semibold ${groupBorder}`}
              >
                Saldo
              </th>
            </tr>
            <tr>
              <th
                className={`px-3 py-1.5 text-right font-medium ${groupBorder}`}
              >
                Capital
              </th>
              <th className="px-3 py-1.5 text-right font-medium">Interés</th>
              <th className="px-3 py-1.5 text-right font-medium">Seguro</th>
              <th className="px-3 py-1.5 text-right font-medium">IVA</th>
              <th className="px-3 py-1.5 text-right font-medium">Total</th>
              <th
                className={`px-3 py-1.5 text-right font-medium ${groupBorder}`}
              >
                Capital
              </th>
              <th className="px-3 py-1.5 text-right font-medium">Interés</th>
              <th className="px-3 py-1.5 text-right font-medium">Total</th>
              <th
                className={`px-3 py-1.5 text-right font-medium ${groupBorder}`}
              >
                ARS
              </th>
              <th className="px-3 py-1.5 text-right font-medium">USD</th>
            </tr>
          </thead>
          <tbody>
            {installments.map((item) => (
              <tr
                key={item.number}
                className={`border-b border-slate-100 ${
                  item.paid ? "bg-green-50/60 text-slate-400" : "text-slate-700"
                }`}
              >
                <td className={numCell}>{item.number}</td>
                <td className={numCell}>
                  {fmt(item.uva)}
                  {item.uvaIsEstimated && "*"}
                </td>
                <td className={numCell}>{fmt(item.uvaVariation)}</td>
                <td className={numCell}>{fmt(item.exchangeRate)}</td>
                <td className={numCell}>{fmt(item.capitalBalance)}</td>
                <td className={`${numCell} ${groupBorder}`}>
                  {fmt(item.capital)}
                </td>
                <td className={numCell}>{fmt(item.interest)}</td>
                <td className={numCell}>{fmt(item.other)}</td>
                <td className={numCell}>{fmt(item.vat)}</td>
                <td className={`${numCell} font-semibold`}>
                  {fmt(item.total)}
                </td>
                <td className={`px-2 py-1.5 text-center ${groupBorder}`}>
                  <PaidToggle
                    installmentNumber={item.number}
                    paid={item.paid}
                    dueDateLabel={fmtDate(item.dueDate)}
                    totalArsLabel={`$${fmt(item.arsTotal)}`}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 font-mono">
                  {fmtDate(item.dueDate)}
                </td>
                <td className={`${numCell} ${groupBorder}`}>
                  {fmt(item.arsCapital)}
                </td>
                <td className={numCell}>{fmt(item.arsInterest)}</td>
                <td className={`${numCell} font-semibold`}>
                  {fmt(item.arsTotal)}
                </td>
                <td className={`${numCell} ${groupBorder}`}>
                  {fmt(item.totalArs)}
                </td>
                <td className={numCell}>{fmt(item.totalUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
