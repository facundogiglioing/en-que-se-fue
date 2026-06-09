import { cookies } from "next/headers";
import { addPurchase, updatePurchase } from "@/actions/creditCard";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { Input } from "@/components/Input";
import { Panel } from "@/components/Panel";
import { getDb } from "@/lib/db";
import type { Options } from "@/types/general";

type Props = {
  editId?: string;
};

export async function FormPurchases({ editId }: Props) {
  const db = await getDb();
  const cookieStore = await cookies();
  const cards = db.data.creditCards || [];
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastSelectedCardId = cookieStore.get("lastSelectedCardId")?.value;

  const banks: Options[] = cards.map((c) => ({
    label: `${c.name} (${c.bank})`,
    value: c.id,
  }));
  const hasLastSelectedCard = cards.some((c) => c.id === lastSelectedCardId);

  const editingPurchase = editId
    ? (db.data.transactions || []).find((p) => p.id === editId)
    : undefined;

  const editStartPeriod = editingPurchase
    ? `${editingPurchase.startYear}-${String(editingPurchase.startMonth + 1).padStart(2, "0")}`
    : currentPeriod;

  const defaultCardId = editingPurchase?.cardId
    ?? (hasLastSelectedCard ? lastSelectedCardId : undefined);

  return (
    <Panel title={editingPurchase ? "Editar Consumo" : "Cargar Consumo / Cuotas"}>
      <form action={editingPurchase ? updatePurchase : addPurchase}>
        {editingPurchase && (
          <input type="hidden" name="id" value={editingPurchase.id} />
        )}
        <div className="space-y-4">
          <Dropdown
            name="cardId"
            cards={banks}
            defaultValue={defaultCardId}
          />
          <Input
            name="description"
            placeholder="¿Qué compraste?"
            defaultValue={editingPurchase?.description}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input
                name="amount"
                label="Monto Total"
                type="number"
                step="0.01"
                defaultValue={editingPurchase?.totalAmount}
                required
              />
            </div>
            <div className="space-y-1">
              <Input
                name="installments"
                label="Cuotas"
                type="number"
                defaultValue={editingPurchase?.installments}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Input
              name="startPeriod"
              label="Primer cuota"
              type="month"
              defaultValue={editStartPeriod}
              required
            />
          </div>
          <Button type="submit">
            {editingPurchase ? "Guardar Cambios" : "Cargar al Resumen"}
          </Button>
          {editingPurchase && (
            <a
              href="/admin/cards"
              className="block text-center text-xs text-slate-400 hover:text-slate-600 transition mt-1"
            >
              Cancelar
            </a>
          )}
        </div>
      </form>
    </Panel>
  );
}
