import CreditCardPage from "../CreditCardPage";
import { GetPageData, getCurrentIndex, normalizeIndex } from "../utils";

type CardsAdminPageProps = {
  params: Promise<{
    segments?: string[];
  }>;
};

export default async function CardsAdminPage({ params }: CardsAdminPageProps) {
  const { segments } = await params;

  const [id, index] = segments ?? [];
  const cardId = id && id !== "0"
    ? id
    : undefined;

  const currentIndex = getCurrentIndex();
  const parsedSegmentIndex = Number(index);

  const selectedIndex = Number.isFinite(parsedSegmentIndex)
    ? normalizeIndex(Math.trunc(parsedSegmentIndex))
    : currentIndex;

  const { card, cards, transactions } = await GetPageData(cardId, selectedIndex);

  return (
    <CreditCardPage
      id={card?.id}
      index={selectedIndex}
      cards={cards}
      transactions={transactions}
    />
  );
}