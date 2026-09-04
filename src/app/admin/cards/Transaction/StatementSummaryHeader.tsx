import PanelHeader from "@/components/PanelHeader";
import type { StatementSummary } from "@/types";

type Props = {
  summary: StatementSummary;
  onReset?: () => void;
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function StatementSummaryHeader({ summary, onReset }: Props) {
  const fields: Array<{ label: string; value: string }> = [
    { label: "Fecha de cierre", value: formatDate(summary.closingDate) },
    { label: "Fecha de vencimiento", value: formatDate(summary.dueDate) },
    {
      label: "Próxima fecha de cierre",
      value: formatDate(summary.nextClosingDate),
    },
    {
      label: "Próxima fecha de vencimiento",
      value: formatDate(summary.nextDueDate),
    },
  ];

  return (
    <div className="shrink-0">
      <PanelHeader
        title={summary.bank}
        subTitle={summary.ownerName || "Titular no identificado"}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xxs uppercase tracking-widest text-slate-400">
                Total a pagar
              </p>
              <p className="text-base font-black text-slate-800">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition whitespace-nowrap"
              >
                Cargar otro
              </button>
            )}
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-2 border-b border-border-primary px-4 py-4 sm:grid-cols-4">
        {fields.map((field) => (
          <div key={field.label} className="rounded-lg bg-slate-100 px-3 py-2">
            <p className="text-xxs uppercase tracking-wide text-slate-400">
              {field.label}
            </p>
            <p className="text-xs font-bold text-slate-700">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
