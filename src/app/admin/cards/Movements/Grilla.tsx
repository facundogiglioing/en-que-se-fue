import Link from "next/link";
import type { Transaction } from "@/types";

type Props = {
  transactions: Transaction[];
  selectedIndex: number;
  editPurchaseId?: string;
  updatePurchase: (formData: FormData) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  activeCardId: string;
  categoryNames: string[];
  month: number;
};

export function Grilla({
  transactions,
  selectedIndex,
  editPurchaseId,
  updatePurchase,
  deletePurchase,
  activeCardId,
  categoryNames,
  month
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
            <th className="px-5 py-3">Descripción</th>
            <th className="px-5 py-3">Categoría</th>
            <th className="px-5 py-3">Inicio</th>
            <th className="px-5 py-3">Cuotas</th>
            <th className="px-5 py-3 text-right">Monto cuota</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transactions.map((p) => {
            const installments = Math.max(1, p.installments || 1);
            const startIndex = p.startYear * 12 + p.startMonth;
            const currentInstallment = selectedIndex - startIndex + 1;
            const installmentAmount = p.totalAmount / installments;
            const editStartPeriod = `${p.startYear}-${String(p.startMonth + 1).padStart(2, "0")}`;
            const isEditing = editPurchaseId === p.id;

            if (isEditing) {
              return (
                <tr key={p.id} className="bg-slate-50">
                  <td colSpan={6} className="px-5 py-4">
                    <form action={updatePurchase} className="space-y-3">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="cardId" value={activeCardId} />
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input
                          name="description"
                          defaultValue={p.description}
                          required
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm sm:col-span-2 focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                        <input
                          name="amount"
                          type="number"
                          step="0.01"
                          defaultValue={p.totalAmount}
                          required
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                        <input
                          name="installments"
                          type="number"
                          defaultValue={p.installments}
                          min={1}
                          required
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label
                            htmlFor={`edit-start-${p.id}`}
                            className="text-xxs text-slate-500 mb-1 block"
                          >
                            Primer cuota
                          </label>
                          <input
                            id={`edit-start-${p.id}`}
                            name="startPeriod"
                            type="month"
                            defaultValue={editStartPeriod}
                            required
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-cat-${p.id}`}
                            className="text-xxs text-slate-500 mb-1 block"
                          >
                            Categoría
                          </label>
                          <select
                            id={`edit-cat-${p.id}`}
                            name="category"
                            defaultValue={p.category}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
                          >
                            {categoryNames.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition"
                          >
                            Guardar
                          </button>
                          <Link
                            href={`/admin/cards?card=${activeCardId}&m=${month}`}
                            className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition"
                          >
                            Cancelar
                          </Link>
                        </div>
                      </div>
                    </form>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={p.id} className="group hover:bg-slate-50/60 transition">
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-700 text-sm">
                    {p.description}
                  </p>
                  <p className="text-xxs text-slate-400 font-mono">
                    ${p.totalAmount.toLocaleString("es-AR")} total
                  </p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {p.category}
                </td>
                <td className="px-5 py-4 text-xs font-medium text-slate-500">
                  {p.startMonth + 1}/{p.startYear}
                </td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xxs font-bold uppercase">
                    {currentInstallment} / {installments}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                  $
                  {installmentAmount.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                    <Link
                      href={`/admin/cards?card=${activeCardId}&m=${month}&edit=${p.id}`}
                      className="px-2 py-1 text-xxs font-bold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition"
                    >
                      Editar
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deletePurchase(p.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="px-2 py-1 text-xxs font-bold text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
