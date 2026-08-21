import Link from "next/link";
import type { MouseEventHandler } from "react";
import { addPurchase, updatePurchase } from "@/actions/creditCard";
import { Input } from "@/components/base/Input";
import { InputThousands } from "@/components/base/InputWithMask";
import { Categories } from "@/components/Categories";
import type { Transaction } from "@/types";
import { InstallmentAmountFields } from "../InstallmentAmountFields";

type Props = {
  activeCardId: string;
  transaction?: Transaction;
  selectedIndex?: number;
  currentPeriod?: string;
  onCancel?: MouseEventHandler<HTMLButtonElement>;
};

export function TransactionForm({
  activeCardId,
  transaction,
  selectedIndex,
  currentPeriod,
  onCancel,
}: Props) {
  const isEditing = !!transaction;
  const action = isEditing ? updatePurchase : addPurchase;
  const submitLabel = isEditing ? "Guardar" : "Guardar";

  // Para editar: convertir startMonth/startYear a formato YYYY-MM
  const defaultStartPeriod = isEditing
    ? `${transaction.startYear}-${String(transaction.startMonth + 1).padStart(2, "0")}`
    : undefined;

  // Determinar URL de cancelar según el contexto
  const cancelUrl = activeCardId && selectedIndex
    ? `/admin/cards/${activeCardId}/${selectedIndex}`
    : "/admin/cards";

  return (
    <form action={action} className="space-y-3">
      {isEditing && <input type="hidden" name="id" value={transaction.id} />}
      <input type="hidden" name="cardId" value={activeCardId} />
      <input type="hidden" name="selectedIndex" value={selectedIndex ?? ""} />

      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-6 ">
          <Input
            name="description"
            label="Descripción"
            placeholder="Descripción"
            defaultValue={transaction?.description}
            required
          />
        </div>
        <div className="md:col-span-3">
          <InputThousands
            name="installmentAmount"
            label="Monto por cuota"
            defaultValue={0}
            required
          />
        </div>
        <div className="">
          <Input
            name="installments"
            label="Cuotas"
            min={1}
            max={24}
            maxLength={2}
            type="number"
            defaultValue={transaction?.installments ?? 1}
            required
          />
        </div>
      </div>

      <InstallmentAmountFields
        defaultInstallments={transaction?.installments ?? 1}
        defaultAmount={transaction?.totalAmount}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
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
          <Categories value={transaction?.category} />
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
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
          ) : (
            <Link
              href={cancelUrl}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
