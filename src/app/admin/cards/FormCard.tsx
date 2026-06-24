
import Link from "next/link";
import { createCard, updateCardDetails } from "@/actions/creditCard";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Panel } from "@/components/Panel";
import type { CreditCard } from "@/types";

type Props = {
  card?: CreditCard;
  cardId?: string;
  monthOffset?: number;
};

export function FormCard({ card, cardId, monthOffset = 0 }: Props) {
  const isEditing = !!card;
  const action = isEditing ? updateCardDetails : createCard;
  const title = isEditing ? "Editar Tarjeta" : "Registrar Tarjeta";
  const submitLabel = isEditing ? "Actualizar Tarjeta" : "Guardar Tarjeta";

  return (
    <Panel title={title}>
      <form action={action}>
        {isEditing && <input type="hidden" name="cardId" value={card.id} />}

        <div className="space-y-3">
          <Input
            name="name"
            placeholder="Nombre (Ej: Visa Platinum)"
            defaultValue={card?.name}
            required
          />
          <Input
            name="bank"
            placeholder="Banco (Ej: Santander)"
            defaultValue={card?.bank}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Input
                name="closingDay"
                label="Cierre"
                placeholder="Día"
                type="number"
                defaultValue={card?.closingDay}
                required
              />
            </div>
            <div className="space-y-1">
              <Input
                name="dueDay"
                label="Vto."
                placeholder="Día"
                type="number"
                defaultValue={card?.dueDay}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary">{submitLabel}</Button>
            {isEditing && cardId && (
              <Link
                href={`/admin/cards?card=${cardId}&m=${monthOffset}`}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </Link>
            )}
          </div>
        </div>
      </form>
    </Panel>
  );
}