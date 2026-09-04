import type { StatementMovementDiff } from "@/types";

type Props = {
  movements: StatementMovementDiff[];
};

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function StatementMovementsGrid({ movements }: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="sticky top-0 bg-cell text-black text-sm border-b border-slate-100">
            <th className="px-5 py-3">Fecha</th>
            <th className="px-2 py-3">Descripción</th>
            <th className="px-2 py-3 text-center">Cuota</th>
            <th className="px-2 py-3 text-right">Pesos</th>
            <th className="px-5 py-3 text-right">Dólares</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {movements.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-5 text-center text-slate-400 italic text-sm"
              >
                No se encontraron movimientos en este resumen.
              </td>
            </tr>
          )}
          {movements.map((movement, index) => (
            <tr
              key={`${movement.date}-${movement.description}-${index}`}
              title={
                movement.exists
                  ? "Ya existe un movimiento cargado igual a este"
                  : undefined
              }
              className={
                movement.exists
                  ? "bg-danger/40 text-danger-text hover:bg-danger/50"
                  : "text-slate-500 hover:bg-slate-50/60"
              }
            >
              <td className="px-5 py-3 text-xs font-medium whitespace-nowrap">
                {formatDate(movement.date)}
              </td>
              <td className="px-2 py-3 text-sm font-bold">
                {movement.description}
              </td>
              <td className="px-2 py-3 text-center">
                {movement.installment ? (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xxs font-bold uppercase">
                    {movement.installment}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
              <td className="px-2 py-3 text-right font-mono text-sm whitespace-nowrap">
                {movement.amountArs !== undefined
                  ? `$${formatMoney(movement.amountArs)}`
                  : "—"}
              </td>
              <td className="px-5 py-3 text-right font-mono text-sm whitespace-nowrap">
                {movement.amountUsd !== undefined
                  ? `US$${formatMoney(movement.amountUsd)}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
