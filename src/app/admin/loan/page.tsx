import { requireRoles } from "@/lib/auth-session";
import { getLoanData } from "@/lib/loan";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const numCell = "px-3 py-1.5 text-right font-mono whitespace-nowrap";
const groupBorder = "border-l border-border-primary";

export default async function LoanPage() {
  await requireRoles([ROLES.ADMIN]);
  const loan = await getLoanData();

  if (!loan) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-center">
          <p className="font-semibold text-slate-600">
            No se pudo cargar la planilla del préstamo.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Verificá que <code>LOAN_SHEET_ID</code> y{" "}
            <code>LOAN_SHEET_GID</code> estén configuradas y que la hoja sea
            accesible con el enlace.
          </p>
        </div>
      </div>
    );
  }

  const { summary, installments } = loan;

  const summaryItems = [
    { label: "Capital", value: summary.originalCapital },
    { label: "Capital restante", value: summary.remainingCapital },
    { label: "UVA", value: summary.uva },
    { label: "TC", value: summary.exchangeRate },
    { label: "Total ARS", value: summary.totalArs },
    { label: "Total USD", value: summary.totalUsd },
    { label: "Faltan", value: `${summary.remainingInstallments} cuotas` },
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
                Fecha Pago
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
                Total
              </th>
            </tr>
            <tr>
              <th
                className={`px-3 py-1.5 text-right font-medium ${groupBorder}`}
              >
                Capital
              </th>
              <th className="px-3 py-1.5 text-right font-medium">Interés</th>
              <th className="px-3 py-1.5 text-right font-medium">O</th>
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
                <td className={numCell}>{item.uva}</td>
                <td className={numCell}>{item.uvaVariation}</td>
                <td className={numCell}>{item.exchangeRate}</td>
                <td className={numCell}>{item.capitalBalance}</td>
                <td className={`${numCell} ${groupBorder}`}>{item.capital}</td>
                <td className={numCell}>{item.interest}</td>
                <td className={numCell}>{item.other}</td>
                <td className={numCell}>{item.vat}</td>
                <td className={`${numCell} font-semibold`}>{item.total}</td>
                <td className={`px-3 py-1.5 text-center ${groupBorder}`}>
                  {item.paid && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xxs font-bold uppercase text-green-700">
                      Sí
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 font-mono">
                  {item.paymentDate}
                </td>
                <td className={`${numCell} ${groupBorder}`}>
                  {item.arsCapital}
                </td>
                <td className={numCell}>{item.arsInterest}</td>
                <td className={`${numCell} font-semibold`}>{item.arsTotal}</td>
                <td className={`${numCell} ${groupBorder}`}>{item.totalArs}</td>
                <td className={numCell}>{item.totalUsd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
