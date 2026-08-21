import Container from "@/components/Container";
import type { CreditCard, Transaction } from "@/types";
import CreditCardList from "./CreditCard/List";
import Transactions from "./Transaction";

type CreditCardPageProps = {
  id?: string;
  index: number;
  cards: CreditCard[];
  transactions: Transaction[];
};

export default function CreditCardPage({ id, cards, transactions, index }: CreditCardPageProps) {
  return (
    <Container className="flex h-full overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] w-full">
        <div className="min-w-0">
          <CreditCardList id={id} cards={cards} selectedIndex={index} />
        </div>
        <div className="min-w-0 border-l border-border-primary">
          <Transactions
            cardId={id || "0"}
            index={index}
            transactions={transactions}
          />
        </div>
      </div>
    </Container>
  );
}
