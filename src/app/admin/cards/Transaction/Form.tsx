import Link from "next/link";
import type { MouseEventHandler } from "react";
import { addPurchase, updatePurchase } from "@/actions/creditCard";
import { Input } from "@/components/base/Input";
import { Categories } from "@/components/Categories";
import type { Transaction } from "@/types";
import { InstallmentAmountFields } from "./InstallmentFields";

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
        <div className="col-span-1 sm:col-span-6">
          <Input
            name="description"
            label="Descripción"
            placeholder="Descripción"
            defaultValue={transaction?.description}
            required
          />
        </div>
        <div className="col-span-1 sm:col-span-6">
          <InstallmentAmountFields
            defaultInstallments={transaction?.installments ?? 1}
            defaultAmount={transaction?.totalAmount}
          />
        </div>
        <div className="col-span-1 sm:col-span-3">
          <Input
            id="start-period"
            name="startPeriod"
            label="Primer período"
            type="month"
            defaultValue={defaultStartPeriod || currentPeriod}
            required
          />
        </div>
        <div className="col-span-1 sm:col-span-3">
          <Categories value={transaction?.category} />
        </div>
        <div className="col-span-1 sm:col-span-3">
          <Input
            name="receiptNumber"
            label="Comprobante"
            placeholder="Número de comprobante"
            defaultValue={transaction?.receiptNumber}
          />
        </div>

        <div className="col-span-1 flex flex-wrap items-center justify-end gap-3 sm:col-span-6 sm:gap-10">
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
