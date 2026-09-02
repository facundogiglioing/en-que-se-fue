import Container from "@/components/Container";
import CreditCardList from "../CreditCard/List";
import Transactions from "../Transaction";
import { GetPageData, getCurrentIndex, normalizeIndex } from "../utils";

type CardsAdminPageProps = {
  params: Promise<{
    segments?: string[];
  }>;
};

export default async function CardsAdminPage({ params }: CardsAdminPageProps) {
  const { segments } = await params;

  const [id, index] = segments ?? [];
  const cardId = id && id !== "0" ? id : undefined;

  const currentIndex = getCurrentIndex();
  const parsedSegmentIndex = Number(index);

  const selectedIndex = Number.isFinite(parsedSegmentIndex)
    ? normalizeIndex(Math.trunc(parsedSegmentIndex))
    : currentIndex;

  const { cards, transactions, consumptionIndex } = await GetPageData(
    cardId,
    selectedIndex,
  );

  const activeCard = cards.find((c) => c.id === cardId);

  return (
    <Container className="flex h-full overflow-hidden">
      <div className="grid h-full min-h-0 w-full grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <CreditCardList id={id} cards={cards} selectedIndex={selectedIndex} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col border-l border-border-primary">
          <Transactions
            cardId={id || "0"}
            index={selectedIndex}
            transactionsIndex={consumptionIndex}
            paysInArrears={!!activeCard?.paysInArrears}
            transactions={transactions}
          />
        </div>
      </div>
    </Container>
  );
}
