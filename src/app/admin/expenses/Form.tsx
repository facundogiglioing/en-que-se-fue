import { redirect } from "next/navigation";
import {
  createExpense,
  // deleteExpense,
  // getExpenses,
  updateExpense,
} from "@/actions/expense";
import { Input } from "@/components/base/Input";
import { Categories } from "@/components/Categories";
import { DayPicker } from "@/components/DayPicker";
import PanelHeader from "@/components/PanelHeader";
import type { Expense } from "@/types";
import { HeaderActions } from "./Actions";

type ExpenseFormProps = {
  expenses: Expense[];
  expenseId: string | undefined;
};

export default async function ExpenseForm({
  expenses,
  expenseId,
}: ExpenseFormProps) {
  // Buscamos si estamos editando
  const editingExpense = expenses.find((e) => e.id === expenseId);

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
    <>
      <PanelHeader
        title="Gasto"
        subTitle={editingExpense ? `Editando: ${editingExpense?.name}` : "Creando un nuevo gasto"}
        actions={<HeaderActions />}
      />
      <form
        action={handleSubmit}
        key={editingExpense?.id || "new"}
        className="space-y-6 p-6  shadow-sm sticky top-6"
      >
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
          className={`w-full py-3 text-white rounded-xl font-semibold transition active: scale-[0.98] ${editingExpense}
            ? "bg-blue-600  hover:bg-blue-700"
            : "bg-slate-900 hover:bg-slate-800"
            `}
        >
          {editingExpense ? "Actualizar Cambios" : "Guardar Gasto"}
        </button>
      </form>
    </>
  );
}
