"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";
import { deleteCard } from "@/actions/creditCard";
import { BankLogo } from "@/components/BankLogo";
import { EntityListItem } from "@/components/EntityListItem";
import PanelHeader from "@/components/PanelHeader";
import type { CreditCard } from "@/types";
import { HeaderActions, ItemActions } from "./Actions";

type CreditCardListProps = {
  cards: CreditCard[];
};

export default function CreditCardList({ cards }: CreditCardListProps) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const pathname = usePathname();
  const router = useRouter();

  const cardId = searchParams.get("card") ?? "";

  const handleCardClick = (cardId: string) => {
    params.set("cardId", cardId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddCard = () => { };

  const handleEditCard = (
    event: MouseEvent<HTMLButtonElement>,
    selectedCardId: string,
  ) => {
    event.stopPropagation();

    params.set("cardId", selectedCardId);
    params.set("editCard", "1");
    router.push(`${pathname}?${params.toString()}`);
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
      ("use server");
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
        actions={<HeaderActions cardId={cardId} />}
      />
      <div className="flex flex-col gap-4 p-4">
        {!!cards && cards.length === 0 && <p>No hay tarjetas disponibles.</p>}
        {cards?.map((card) => (
          <EntityListItem
            key={card.id}
            title={`${card.name}`}
            subtitle={`Cierre: ${card.closingDay} -  Vto: ${card.dueDay}`}
            icon={BankLogo(card.bank, 20)}
            value={card.last4Digits}
            isActive={cardId === card.id}
            actions={
              <ItemActions
                onEdit={(event) => handleEditCard(event, card.id)}
                onDelete={(event) => handleDeleteCard(event, card.id)}
              />
            }
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
