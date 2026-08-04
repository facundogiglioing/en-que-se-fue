import { deleteCard } from "@/actions/creditCard";
import { AddButton } from "@/components/base/AddButton";
import { DeleteButton } from "@/components/base/DeleteButton";
import { EditButton } from "@/components/base/EditButton";

type HeaderActionsProps = {
  cardId: string;
  month: number;
};

type ItemActionsProps = {
  cardId: string;
};

const HeaderActions = ({ cardId, month }: HeaderActionsProps) => {
  return (
    <div className="flex flex-row gap-4">
      <AddButton
        href={`/admin/cards?card=${cardId}&m=${month}&newCard=1`}
      />
    </div>
  );
};

const ItemActions = ({ cardId }: ItemActionsProps) => {
  const onDelete = async () => {

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tarjeta? Esta acción no se puede deshacer.",
    );
    if (!confirmed) {
      return;
    }
    try {
      "use server";
      await deleteCard(cardId);
    } catch (error) {
      console.error(error);
      alert(
        "Ocurrió un error al eliminar la tarjeta. Por favor, intenta nuevamente.",
      );
    }
  };

  return (
    <div className="flex flex-row gap-4">
      <EditButton href={`/admin/cards?card=${cardId}&m=0&editCard=1`} />
      <form action={onDelete}>
        <DeleteButton />
      </form>
    </div>
  );
};

export { HeaderActions, ItemActions };
