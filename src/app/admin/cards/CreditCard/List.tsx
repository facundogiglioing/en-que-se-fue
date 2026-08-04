"use client";

import { CreditCardIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EntityListItem } from "@/components/EntityListItem";
import Header from "@/components/Header";
import type { CreditCard } from "@/types";
import { HeaderActions, ItemActions } from "./Actions";

type CreditCardListProps = {
  cardId: string;
  month: number;
  cards: CreditCard[];
};

type CreditCardListItemProps = {
  card: CreditCard;
  isActive: boolean;
  currentMonth: string;
};

export default function CreditCardList({
  cardId,
  month,
  cards,
}: CreditCardListProps) {
  const searchParams = useSearchParams();
  const currentCardId = searchParams.get("card") ?? "";
  const currentMonth = searchParams.get("m") ?? String(month);

  if (!!cards && cards.length === 0) {
    return <p>No hay tarjetas disponibles.</p>;
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Tarjetas"
        subTitle="El subtítulo"
        actions={<HeaderActions cardId={cardId} month={month} />}
      />
      <div className="flex flex-col gap-4 p-4">
        {cards?.map((card) => (
          <CreditCardListItem
            key={card.id}
            card={card}
            isActive={currentCardId === card.id}
            currentMonth={currentMonth}
          />
        ))}
      </div>
    </div>
  );
}

const CreditCardListItem = ({
  card,
  isActive,
  currentMonth,
}: CreditCardListItemProps) => {
  return (
    <Link href={`/admin/cards?cardId=${card.id}&m=${currentMonth}`}>
      <EntityListItem
        title={card.name}
        subtitle={`Cierre: ${card.closingDay} -  Vencimiento ${card.dueDay}`}
        icon={<CreditCardIcon size={20} />}
        value={card.last4Digits}
        isActive={isActive}
        actions={<ItemActions cardId={card.id} />}
      />
    </Link>
  );
};
