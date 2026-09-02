"use client";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { useState } from "react";
import { deleteCard } from "@/actions/creditCard";
import { BankLogo } from "@/components/BankLogo";
import { EntityListItem } from "@/components/EntityListItem";
import PanelHeader from "@/components/PanelHeader";
import { Sheet } from "@/components/Sheet";
import type { CreditCard } from "@/types";
import { HeaderActions, ItemActions } from "./Actions";
import { CardForm } from "./Form";

type CreditCardListProps = {
  id?: string;
  cards: CreditCard[];
  selectedIndex: number;
};

export default function CreditCardList({ id, cards, selectedIndex }: CreditCardListProps) {
  const router = useRouter();
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const handleEditCard = (
    event: MouseEvent<HTMLButtonElement>,
    card: CreditCard,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setEditingCard(card);
  };

  const handleDeleteCard = async (
    event: MouseEvent<HTMLButtonElement>,
    selectedCardId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tarjeta? Esta acción no se puede deshacer.",
    );
    if (!confirmed) {
      return;
    }
    try {
      "use server";
      await deleteCard(selectedCardId);
    } catch (error) {
      console.error(error);
      alert(
        "Ocurrió un error al eliminar la tarjeta. Por favor, intenta nuevamente.",
      );
    }
  };

  return (
    <div className="flex flex-col">
      <PanelHeader
        title="Tarjetas"
        subTitle="El subtítulo"
        actions={<HeaderActions />}
      />
      <div className="flex flex-col gap-4 p-4">
        {!!cards && cards.length === 0 && <p>No hay tarjetas disponibles.</p>}
        {cards?.map((card) => (
          <EntityListItem
            key={card.id}
            title={`${card.name}`}
            subtitle={`Cierre: ${card.closingDay} -  Vto: ${card.dueDay}${card.paysInArrears ? " · Mes vencido" : ""}`}
            subtitleClassName={card.paysInArrears ? "text-amber-600 font-semibold" : undefined}
            icon={BankLogo(card.bank, 20)}
            value={card.last4Digits}
            isActive={id === card.id}
            onClick={() => {
              router.push(`/admin/cards/${card.id}/${selectedIndex}`);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(`/admin/cards/${card.id}/${selectedIndex}`);
              }
            }}
            actions={
              <ItemActions
                onEdit={(event) => handleEditCard(event, card)}
                onDelete={(event) => handleDeleteCard(event, card.id)}
              />
            }
          />
        ))}
      </div>

      {editingCard && (
        <Sheet
          title="Editar tarjeta"
          description="Actualizá los datos de la tarjeta seleccionada."
          onClose={() => setEditingCard(null)}
        >
          <CardForm
            card={editingCard}
            cardId={id}
            selectedIndex={selectedIndex}
            onCancel={() => setEditingCard(null)}
          />
        </Sheet>
      )}
    </div>
  );
}
