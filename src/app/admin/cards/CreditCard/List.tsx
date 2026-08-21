"use client";
import Link from "next/link";
import type { MouseEvent } from "react";
import { deleteCard } from "@/actions/creditCard";
import { BankLogo } from "@/components/BankLogo";
import { EntityListItem } from "@/components/EntityListItem";
import PanelHeader from "@/components/PanelHeader";
import type { CreditCard } from "@/types";
import { HeaderActions, ItemActions } from "./Actions";

type CreditCardListProps = {
  id?: string;
  cards: CreditCard[];
  selectedIndex: number;
};

export default function CreditCardList({ id, cards, selectedIndex }: CreditCardListProps) {
  const handleEditCard = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();


  };

  const handleDeleteCard = async (
    event: MouseEvent<HTMLButtonElement>,
    selectedCardId: string,
  ) => {
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
          <Link
            key={card.id}
            href={`/admin/cards/${card.id}/${selectedIndex}`}
            className="w-full"
          >
            <EntityListItem
              key={card.id}
              title={`${card.name}`}
              subtitle={`Cierre: ${card.closingDay} -  Vto: ${card.dueDay}`}
              icon={BankLogo(card.bank, 20)}
              value={card.last4Digits}
              isActive={id === card.id}
              actions={
                <ItemActions
                  onEdit={(event) => handleEditCard(event)}
                  onDelete={(event) => handleDeleteCard(event, card.id)}
                />
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
