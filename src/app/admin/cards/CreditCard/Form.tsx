"use client";

import Link from "next/link";
import type { MouseEventHandler } from "react";
import { createCard, updateCardDetails } from "@/actions/creditCard";
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import { Dropdown } from "@/components/Dropdown";
import { BANK_OPTIONS } from "@/lib/constants";
import type { CreditCard } from "@/types";

type Props = {
  card?: CreditCard;
  cardId?: string;
  selectedIndex?: number;
  onCancel?: MouseEventHandler<HTMLButtonElement>;
  onSuccess?: () => void;
};

export function CardForm({ card, cardId, selectedIndex, onCancel, onSuccess }: Props) {
  const isEditing = !!card;
  const action = isEditing ? updateCardDetails : createCard;
  const submitLabel = isEditing ? "Actualizar Tarjeta" : "Guardar Tarjeta";

  // updateCardDetails no redirige, así que avisamos al padre para cerrar el panel
  async function handleAction(formData: FormData) {
    await action(formData);
    onSuccess?.();
  }

  return (
    <div className="space-y-4">
      <form action={handleAction} className="space-y-4">
        {isEditing && <input type="hidden" name="cardId" value={card.id} />}

        <div className="space-y-3">
          <Input
            label="Nombre"
            name="name"
            placeholder="Nombre (Ej: Visa Platinum)"
            defaultValue={card?.name}
            required
          />
          <Dropdown
            name="bank"
            label="Banco"
            placeholder="Seleccionar Banco..."
            cards={BANK_OPTIONS}
            defaultValue={card?.bank}
          />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Input
                label="Últimos 4 dígitos"
                name="last4Digits"
                placeholder="1234"
                type="numeric"
                maxLength={4}
                defaultValue={card?.last4Digits}
                required
              />
            </div>
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
