"use client";

import { useState } from "react";
import { EditButton } from "@/components/base/EditButton";
import { Sheet } from "@/components/Sheet";
import type { Transaction } from "@/types";
import { TransactionForm } from "./Form";

type Props = {
  cardId: string;
  selectedIndex: number;
  transaction: Transaction;
};

export default function EditPurchaseAction({
  cardId,
  selectedIndex,
  transaction,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <EditButton onClick={() => setIsOpen(true)} />

      {isOpen && (
        <Sheet
          title="Editar movimiento"
          description="Actualizá el detalle de la compra y guardá los cambios."
          onClose={() => setIsOpen(false)}
        >
          <TransactionForm
            activeCardId={cardId}
            selectedIndex={selectedIndex}
            transaction={transaction}
            onCancel={() => setIsOpen(false)}
          />
        </Sheet>
      )}
    </>
  );
}
