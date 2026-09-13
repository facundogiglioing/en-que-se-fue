import { RotateCcw, Trash2 } from "lucide-react";
import type { StatementMovementDiff } from "@/types";

type Props = {
  movements: StatementMovementDiff[];
  expectedTotal?: number;
  excludedIndices: Set<number>;
  onToggleExclude: (index: number) => void;
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

export function StatementMovementsGrid({
  movements,
  expectedTotal,
  excludedIndices,
  onToggleExclude,
}: Props) {
  const calculatedTotalArs = movements.reduce(
    (sum, movement, index) =>
      excludedIndices.has(index) ? sum : sum + (movement.amountArs ?? 0),
    0,
  );
  const calculatedTotalUsd = movements.reduce(
    (sum, movement, index) =>
      excludedIndices.has(index) ? sum : sum + (movement.amountUsd ?? 0),
    0,
  );
  const matchesExpectedTotal =
    expectedTotal === undefined ||
    Math.abs(calculatedTotalArs - expectedTotal) < 0.01;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="sticky top-0 bg-cell text-black text-sm border-b border-slate-100">
              <th className="px-5 py-3">Fecha</th>
              <th className="px-2 py-3">Descripción</th>
              <th className="px-2 py-3 text-center">Cuota</th>
              <th className="px-2 py-3 text-right">Pesos</th>
              <th className="px-5 py-3 text-right">Dólares</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {movements.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-5 text-center text-slate-400 italic text-sm"
                >
                  No se encontraron movimientos en este resumen.
                </td>
              </tr>
            )}
            {movements.map((movement, index) => {
              const isExcluded = excludedIndices.has(index);
              return (
                <tr
                  key={`${movement.date}-${movement.description}-${index}`}
                  title={
                    movement.exists
                      ? "Ya existe un movimiento cargado igual a este"
                      : undefined
                  }
                  className={`group ${isExcluded
                    ? "opacity-40"
                    : movement.exists
                      ? "bg-danger/40 text-danger-text hover:bg-danger/50"
                      : "text-slate-500 hover:bg-slate-50/60"
                    }`}
                >
                  <td className="px-5 py-3 text-xs font-medium whitespace-nowrap">
                    {formatDate(movement.date)}
                  </td>
                  <td
                    className={`px-2 py-3 text-sm font-bold ${isExcluded ? "line-through" : ""}`}
                  >
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
                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleExclude(index)}
                      title={
                        isExcluded
                          ? "Volver a incluir este movimiento"
                          : "No cargar este movimiento"
                      }
                      className={`rounded-md p-1 transition opacity-0 group-hover:opacity-100 ${isExcluded
                        ? "text-success-text hover:bg-success"
                        : "text-danger-text hover:bg-danger"
                        }`}
                    >
                      {isExcluded ? (
                        <RotateCcw size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {movements.length > 0 && (
        <table className="w-full text-left">
          <tfoot>
            <tr
              className={`border-t-2 font-bold ${matchesExpectedTotal
                ? "border-success bg-success text-success-text"
                : "border-danger bg-danger text-danger-text"
                }`}
            >
              <td className="px-5 py-3" colSpan={3}>
                Total
                {expectedTotal !== undefined &&
                  !matchesExpectedTotal &&
                  ` (no coincide con el total a pagar del resumen: $${formatMoney(expectedTotal)})`}
              </td>
              <td className="px-2 py-3 text-right font-mono text-sm whitespace-nowrap w-[1%]">
                ${formatMoney(calculatedTotalArs)}
              </td>
              <td className="px-5 py-3 text-right font-mono text-sm whitespace-nowrap w-[1%]">
                US${formatMoney(calculatedTotalUsd)}
              </td>
              <td className="w-10 px-2 py-3" />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
