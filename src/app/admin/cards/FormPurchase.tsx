import Link from "next/link";
import { addPurchase, updatePurchase } from "@/actions/creditCard";
import type { Transaction } from "@/types";
import { InstallmentAmountFields } from "./InstallmentAmountFields";

type Props = {
  activeCardId: string;
  categoryNames: string[];
  transaction?: Transaction;
  monthOffset?: number;
  currentPeriod?: string;
};

export function FormPurchase({
  activeCardId,
  categoryNames,
  transaction,
  monthOffset = 0,
  currentPeriod,
}: Props) {
  const isEditing = !!transaction;
  const action = isEditing ? updatePurchase : addPurchase;
  const submitLabel = isEditing ? "Guardar" : "Guardar";

  // Para editar: convertir startMonth/startYear a formato YYYY-MM
  const defaultStartPeriod = isEditing
    ? `${transaction.startYear}-${String(transaction.startMonth + 1).padStart(2, "0")}`
    : undefined;

  // Determinar URL de cancelar según el contexto
  const cancelUrl = isEditing
    ? `/admin/cards?card=${activeCardId}&m=${monthOffset}`
    : `/admin/cards?card=${activeCardId}&m=${monthOffset}`;

  return (
    <form action={action} className="space-y-3">
      {isEditing && <input type="hidden" name="id" value={transaction.id} />}
      <input type="hidden" name="cardId" value={activeCardId} />
      <input type="hidden" name="monthOffset" value={monthOffset} />

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label
            htmlFor="description"
            className="text-xxs text-slate-500 mb-1 block"
          >
            Descripción
          </label>
          <input
            id="description"
            name="description"
            placeholder="Descripción"
            defaultValue={transaction?.description}
            required
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      <InstallmentAmountFields
        defaultInstallments={transaction?.installments ?? 1}
        defaultAmount={transaction?.totalAmount}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label
            htmlFor="start-period"
            className="text-xxs text-slate-500 mb-1 block"
          >
            Primer cuota
          </label>
          <input
            id="start-period"
            name="startPeriod"
            type="month"
            defaultValue={defaultStartPeriod || currentPeriod}
            required
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="text-xxs text-slate-500 mb-1 block"
          >
            Categoría
          </label>
          <select
            id="category"
            name="category"
            defaultValue={transaction?.category}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            {categoryNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isRecurring"
              defaultChecked={transaction?.isRecurring}
              className="w-4 h-4 border border-slate-300 rounded focus:ring-1 focus:ring-slate-400"
            />
            <span className="text-xxs text-slate-600 font-medium">
              Gasto recurrente
            </span>
          </label>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition"
          >
            {submitLabel}
          </button>
          <Link
            href={cancelUrl}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
