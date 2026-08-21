import Link from "next/link";
import { createCard, updateCardDetails } from "@/actions/creditCard";
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import type { CreditCard } from "@/types";

type Props = {
  card?: CreditCard;
  cardId?: string;
  monthOffset?: number;
};

export function CardForm({ card, cardId, monthOffset = 0 }: Props) {
  const isEditing = !!card;
  const action = isEditing ? updateCardDetails : createCard;
  const title = isEditing ? "Editar Tarjeta" : "Registrar Tarjeta";
  const submitLabel = isEditing ? "Actualizar Tarjeta" : "Guardar Tarjeta";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
          {title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {isEditing
            ? "Actualizá los datos de la tarjeta seleccionada."
            : "Agregá una tarjeta para empezar a registrar movimientos."}
        </p>
      </div>

      <form action={action} className="space-y-4">
        {isEditing && <input type="hidden" name="cardId" value={card.id} />}

        <div className="space-y-3">
          <Input
            label="Nombre"
            name="name"
            placeholder="Nombre (Ej: Visa Platinum)"
            defaultValue={card?.name}
            required
          />
          <Input
            label="Banco"
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

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary">
              {submitLabel}
            </Button>
            <Link
              href={`/admin/cards?cardId=${cardId ?? ""}&m=${monthOffset}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
