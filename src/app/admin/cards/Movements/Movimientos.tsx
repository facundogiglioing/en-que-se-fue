import type { Transaction } from "@/types";
import { Grilla } from "./Grilla";

type Props = {
  transactions: Transaction[];
  selectedIndex: number;
  deletePurchase: (id: string) => Promise<void>;
  activeCardId: string;
  month: number;
};

export function Movimientos(props: Props) {
  return <Grilla {...props} />;
}
