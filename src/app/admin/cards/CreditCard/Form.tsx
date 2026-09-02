import Link from "next/link";
import type { MouseEventHandler } from "react";
import { createCard, updateCardDetails } from "@/actions/creditCard";
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import type { CreditCard } from "@/types";

type Props = {
  card?: CreditCard;
  cardId?: string;
  selectedIndex?: number;
  onCancel?: MouseEventHandler<HTMLButtonElement>;
};

export function CardForm({ card, cardId, selectedIndex, onCancel }: Props) {
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

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="paysInArrears"
              defaultChecked={card?.paysInArrears}
              className="w-4 h-4 border border-slate-300 rounded focus:ring-1 focus:ring-slate-400"
            />
            <span className="text-xxs text-slate-600 font-medium">
              Pago a mes vencido (el resumen del mes se cobra al mes siguiente)
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary">
              {submitLabel}
            </Button>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
            ) : (
              <Link
                href={cardId && selectedIndex ? `/admin/cards/${cardId}/${selectedIndex}` : "/admin/cards"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </Link>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
