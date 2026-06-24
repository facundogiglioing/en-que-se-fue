import { Infinity as InfinityIcon, Plus } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import type { Transaction } from "@/types";
import { FormPurchase } from "../FormPurchase";

type Props = {
  transactions: Transaction[];
  selectedIndex: number;
  editPurchaseId?: string;
  deletePurchase: (id: string) => Promise<void>;
  activeCardId: string;
  categoryNames: string[];
  month: number;
  currentPeriod: string;
};

export function Grilla({
  transactions,
  selectedIndex,
  editPurchaseId,
  deletePurchase,
  activeCardId,
  categoryNames,
  month,
  currentPeriod,
}: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="sticky top-0 bg-cell text-black text-sm border-b border-slate-100">
            <th className="px-5 py-3">Descripción</th>
            <th>Categoría</th>
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
            const CategoryIcon =
              CATEGORIES.find((c) => c.name === p.category)?.icon || Plus;
            const isEditing = editPurchaseId === p.id;

            if (isEditing) {
              return (
                <tr key={p.id} className="bg-slate-50">
                  <td colSpan={6} className="px-5 py-4">
                    <FormPurchase
                      activeCardId={activeCardId}
                      categoryNames={categoryNames}
                      transaction={p}
                      monthOffset={month}
                      currentPeriod={currentPeriod}
                    />
                  </td>
                </tr>
              );
            }

            return (
              <tr key={p.id} className="group hover:bg-slate-50/60 transition text-slate-500">
                <td className="px-5 py-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                      {p.description}
                    </p>
                    <p className="text-xxs text-slate-400 font-mono">
                      ${p.totalAmount.toLocaleString("es-AR")} total
                    </p>
                  </div>
                  {p.isRecurring && (
                    <span className="bg-blue-100 text-blue-500 rounded-full p-2 flex items-center justify-center">
                      <InfinityIcon size={16} />
                    </span>
                  )}
                </td>
                <td className="text-sm">
                  <span className="inline-flex items-center gap-2">
                    <CategoryIcon size={14} className="text-slate-400" />
                    {p.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs font-medium text-slate-500">
                  {p.startMonth + 1}/{p.startYear}
                </td>
                <td className="px-5 py-4">
                  {p.isRecurring ? (
                    <span className="px-2 py-1 bg-blue-50 text-blue-500 rounded-md text-xxs font-bold uppercase">
                      Mensual
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xxs font-bold uppercase">
                      {currentInstallment} / {installments}
                    </span>
                  )}
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
