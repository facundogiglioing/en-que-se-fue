"use client";

import type { MouseEventHandler } from "react";
import { useState } from "react";
import { AddButton } from "@/components/base/AddButton";
import { DeleteButton } from "@/components/base/DeleteButton";
import { Sheet } from "@/components/Sheet";
import { CardForm } from "../cards/CreditCard/Form";


type ItemActionsProps = {
  onDelete?: MouseEventHandler<HTMLButtonElement>;
  onEdit?: MouseEventHandler<HTMLButtonElement>;
};

const HeaderActions = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-row gap-4">
        <AddButton onClick={() => setIsOpen(true)} />
      </div>

      {isOpen && (
        <Sheet
          title="Nueva tarjeta"
          description="Completá los datos para registrar una nueva tarjeta."
          onClose={() => setIsOpen(false)}
        >
          <CardForm onCancel={() => setIsOpen(false)} />
        </Sheet>
      )}
    </>
  );
};

const ItemActions = ({ onDelete }: ItemActionsProps) => {
  return (
    <div className="flex flex-row gap-4">
      <DeleteButton onClick={onDelete} />
    </div>
  );
};

export { HeaderActions, ItemActions };
