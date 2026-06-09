import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import type { CreditCard as CreditCardType } from "@/types";
import { Card } from "./Card";
import { NoCard } from "./NoCard";
import { Pagination } from "./Pagination";

type Props = {
  card: CreditCardType | null;
  allCards: CreditCardType[];
  month: number;
};

export async function CreditCard({ card, allCards, month }: Props) {
  if (!card) return <NoCard />;

  // Obtener tarjeta anterior y siguiente según order
  const sortedCards = [...allCards].sort((a, b) => a.order - b.order);
  const currentIndex = sortedCards.findIndex((c) => c.id === card.id);
  const prevCard = sortedCards[currentIndex - 1];
  const nextCard = sortedCards[currentIndex + 1];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex gap-4 w-full">
        <div className="flex-1 flex items-center justify-center">
          <IconButton
            show={!!prevCard}
            href={`/admin/cards?card=${prevCard?.id || ""}&m=${month}`}
            icon={ChevronLeft}
          />
        </div>
        <div className="flex-4 flex items-center justify-center">
          <Card card={card} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <IconButton
            show={!!nextCard}
            href={`/admin/cards?card=${nextCard?.id || ""}&m=${month}`}
            icon={ChevronRight}
          />
        </div>
      </div>
      <Pagination cards={sortedCards} month={month} cardId={card.id} />
    </div>
  );
}
