import { Edit3, PiggyBank, Trash2, Wallet, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome,
} from "@/actions/income";
import { DayPicker } from "@/components/DayPicker";

export const dynamic = "force-dynamic";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  // Manejo asíncrono de params para Next 16
  const { edit } = await searchParams;
  const incomes = await getIncomes();
  const editingIncome = incomes.find((i) => i.id === edit);

  const handleSubmit = async (formData: FormData) => {
    "use server";
    if (editingIncome) {
      await updateIncome(editingIncome.id, formData);
    } else {
      await createIncome(formData);
    }
    redirect("/admin/income");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div className="lg:col-span-4">
        <form
          key={editingIncome?.id || "new-income-form"}
          action={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingIncome ? "Editar Ingreso" : "Nuevo Ingreso"}
            </h2>
            {editingIncome && (
              <Link
                href="/admin/income"
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </Link>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase text-slate-500 mb-1"
              >
                Fuente de Ingreso
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={editingIncome?.name || ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                placeholder="Ej: Sueldo, Freelance, Alquiler..."
                required
              />
            </div>

            <div>
              <span className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Categoría
              </span>
              <div className="grid grid-cols-2 gap-2">
                {["Sueldo", "Inversión", "Extra", "Otros"].map((cat) => (
                  <label
                    key={cat}
                    htmlFor={`cat-${cat}`}
                    className="relative cursor-pointer group"
                  >
                    <input
                      type="radio"
                      id={`cat-${cat}`}
                      name="category"
                      value={cat}
                      defaultChecked={
                        editingIncome
                          ? editingIncome.category === cat
                          : cat === "Sueldo"
                      }
                      className="peer sr-only"
                      required
                    />
                    <div className="flex items-center justify-center p-2 text-xs border border-slate-200 rounded-lg peer-checked:border-blue-600 peer-checked:bg-blue-50 transition hover:bg-slate-50 font-medium text-slate-600 peer-checked:text-blue-700">
                      {cat}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reutilizamos el DayPicker para el día estimado de cobro */}
            <DayPicker defaultValue={editingIncome?.expectedDay || 1} />

            <div>
              <label
                htmlFor="amount"
                className="block text-xs font-bold uppercase text-slate-500 mb-1"
              >
                Monto Estimado
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">
                  $
                </span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={editingIncome?.expectedAmount || ""}
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 transition font-mono"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-semibold transition active:scale-[0.98] ${editingIncome
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 shadow-lg"
              : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
          >
            {editingIncome ? "Actualizar Ingreso" : "Guardar Ingreso"}
          </button>
        </form>
      </div>

      {/* COLUMNA DERECHA: LISTADO */}
      <div className="lg:col-span-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 text-center">
            Fuentes de Ingreso Configuradas
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
            Recurrente
          </span>
        </div>

        <div className="grid gap-3">
          {incomes.map((income) => (
            <div
              key={income.id}
              className={`group bg-white border p-4 rounded-xl flex items-center justify-between transition-all ${income.id === edit
                ? "border-blue-500 ring-2 ring-blue-500/10 shadow-lg"
                : "border-slate-200 hover:shadow-md"
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${income.id === edit ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"}`}
                >
                  <PiggyBank size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {income.name}
                  </h3>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    {income.category} • Día estimado: {income.expectedDay}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black text-green-600 mr-2">
                  +${income.expectedAmount?.toLocaleString()}
                </span>

                <Link
                  href={`/admin/income?edit=${income.id}`}
                  className="p-2 text-slate-300 hover:text-blue-600 transition"
                >
                  <Edit3 size={18} />
                </Link>

                <form
                  action={async () => {
                    "use server";
                    await deleteIncome(income.id);
                  }}
                >
                  <button
                    type="submit"
                    className="p-2 text-slate-200 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            </div>
          ))}

          {incomes.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Wallet size={24} />
              </div>
              <p className="text-slate-400 font-medium italic">
                No hay ingresos configurados aún.
              </p>
              <p className="text-slate-300 text-xs mt-1">
                Cargá tu sueldo o ingresos extras para calcular el saldo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
