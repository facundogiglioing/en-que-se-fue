"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/base/Button";
import { Sheet } from "@/components/Sheet";
import { TransactionForm } from "./Form";

type Props = {
  cardId: string;
  selectedIndex: number;
};

export default function AddPurchaseAction({ cardId, selectedIndex }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const year = Math.trunc(selectedIndex / 100);
  const month = selectedIndex % 100;
  const currentPeriod = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setIsOpen(true)}>
        <Plus size={12} />
        Agregar
      </Button>

      {isOpen && (
        <Sheet
          title="Nuevo movimiento"
          description="Completá los datos para registrar una compra en la tarjeta seleccionada."
          onClose={() => setIsOpen(false)}
        >
          <TransactionForm
            activeCardId={cardId}
            selectedIndex={selectedIndex}
            currentPeriod={currentPeriod}
            onCancel={() => setIsOpen(false)}
          />
        </Sheet>
      )}
    </>
  );
}
