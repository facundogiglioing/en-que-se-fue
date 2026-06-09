import Link from "next/link";
import type { CreditCard as CreditCardType } from "@/types";

type Props = {
  cards: CreditCardType[];
  month: number;
  cardId: string;
};
export function Pagination({ cards, month, cardId }: Props) {
  if (cards.length <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      {cards.map((c) => (
        <Link
          key={c.id}
          href={`/admin/cards?card=${c.id}&m=${month}`}
          className={`w-2 h-2 rounded-full transition ${c.id === cardId
            ? "bg-slate-700"
            : "bg-slate-300 hover:bg-slate-400"
            }`}
        />
      ))}
    </div>
  );
}
