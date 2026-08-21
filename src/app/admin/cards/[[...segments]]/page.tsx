import CreditCardPage from "../CreditCardPage";
import { GetPageData, getCurrentIndex, normalizeIndex } from "../utils";

type CardsAdminPageProps = {
  params: Promise<{
    segments?: string[];
  }>;
};

export default async function CardsAdminPage({ params }: CardsAdminPageProps) {
  const { segments } = await params;

  const [segmentCardId, segmentIndex] = segments ?? [];
  const cardId = segmentCardId && segmentCardId !== "0"
    ? segmentCardId
    : undefined;

  const currentIndex = getCurrentIndex();
  const parsedSegmentIndex = Number(segmentIndex);

  const selectedIndex = Number.isFinite(parsedSegmentIndex)
    ? normalizeIndex(Math.trunc(parsedSegmentIndex))
    : currentIndex;

  const { card, cards, transactions } = await GetPageData(cardId, selectedIndex);

  return (
    <CreditCardPage
      id={card?.id}
      cards={cards}
      transactions={transactions}
      selectedIndex={selectedIndex}
    />
  );
}