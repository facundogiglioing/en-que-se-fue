import { Plus, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "@/actions/expense";

import { Input } from "@/components/base/Input";
import { Categories } from "@/components/Categories";
import { DayPicker } from "@/components/DayPicker";
import { EntityListItem } from "@/components/EntityListItem";
import { CATEGORIES } from "@/lib/constants";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const { edit } = await searchParams;
  const expenses = await getExpenses();

  // Buscamos si estamos editando
  const editingExpense = expenses.find((e) => e.id === edit);

  // Acción que decide si crear o editar
  const handleSubmit = async (formData: FormData) => {
    "use server";
    if (editingExpense) {
      await updateExpense(editingExpense.id, formData);
      redirect("/admin/expenses"); // Limpiamos la URL después de editar
    } else {
      await createExpense(formData);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FORMULARIO DINÁMICO */}
        <div className="lg:col-span-4">
          <form
            action={handleSubmit}
            key={editingExpense?.id || "new"}
            className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">
                {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
              </h2>
              {editingExpense && (
                <Link
                  href="/admin/expenses"
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              <Input
                id="name"
                name="name"
                label="Nombre"
                defaultValue={editingExpense?.name}
                required
              />

              <Categories value={editingExpense?.category} />

              <DayPicker defaultValue={editingExpense?.dueDate} />

              <Input
                id="electronicPaymentCode"
                name="electronicPaymentCode"
                label="Código de pago electrónico"
                defaultValue={editingExpense?.electronicPaymentCode}
              />

              <Input
                id="amount"
                name="amount"
                label="Monto Estimado"
                type="number"
                step="0.01"
                defaultValue={editingExpense?.estimatedAmount}
                required
              />
            </div>

            <button
              type="submit" // <--- Explícito
              className={`w-full py-3 rounded-xl font-semibold transition active:scale-[0.98] ${editingExpense
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
            >
              {editingExpense ? "Actualizar Cambios" : "Guardar Gasto"}
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="lg:col-span-8">
          <div className="grid gap-3">
            {expenses.map((expense) => {
              const Icon =
                CATEGORIES.find((c) => c.name === expense.category)?.icon ||
                Plus;
              const isEditing = expense.id === edit;

              return (
                <Link
                  key={expense.id}
                  href={`/admin/expenses?edit=${expense.id}`}
                >
                  <EntityListItem
                    title={expense.name}
                    subtitle={`${expense.category} • Día ${expense.dueDate}`}
                    icon={<Icon size={20} />}
                    value={`$${expense.estimatedAmount?.toLocaleString()}`}
                    isActive={isEditing}
                    editHref={`/admin/expenses?edit=${expense.id}`}
                    onDelete={async () => {
                      "use server";
                      await deleteExpense(expense.id);
                    }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
