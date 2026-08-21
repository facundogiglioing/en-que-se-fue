import type { MouseEventHandler } from "react";

import { AddButton } from "@/components/base/AddButton";
import { DeleteButton } from "@/components/base/DeleteButton";
import { EditButton } from "@/components/base/EditButton";

type ItemActionsProps = {
  onDelete?: MouseEventHandler<HTMLButtonElement>;
  onEdit?: MouseEventHandler<HTMLButtonElement>;
};

const HeaderActions = () => {
  return (
    <div className="flex flex-row gap-4">
      <AddButton href="/admin/cards" />
    </div>
  );
};

const ItemActions = ({ onEdit, onDelete }: ItemActionsProps) => {

  return (
    <div className="flex flex-row gap-4">
      <EditButton onClick={onEdit} />
      <DeleteButton onClick={onDelete} />

    </div>
  );
};

export { HeaderActions, ItemActions };
