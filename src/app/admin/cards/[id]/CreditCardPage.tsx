import Container from "@/components/Container";
import type { CreditCard, Transaction } from "@/types";
import CreditCardList from "../CreditCard/List";
import Transactions from "../Transaction";

type CreditCardPageProps = {
  id?: string;
  cards: CreditCard[];
  transactions: Transaction[];
};

export default function CreditCardPage({ id, cards, transactions }: CreditCardPageProps) {
  const date = new Date();
  const currentIndex = date.getFullYear() * 100 + date.getMonth();

  return (
    <Container className="flex h-full overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] w-full">
        <div className="min-w-0">
          <CreditCardList id={id} cards={cards} />
        </div>
        <div className="min-w-0 border-l border-border-primary">
          <Transactions
            transactions={transactions}
            cardId={/*activeCard?.id ||*/ "0"}
            month={1}
          />
        </div>
      </div>
    </Container>
  );
}
