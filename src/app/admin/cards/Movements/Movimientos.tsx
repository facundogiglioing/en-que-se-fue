import type { Transaction } from "@/types";
import { Grilla } from "./Grilla";

type Props = {
  transactions: Transaction[];
  selectedIndex: number;
  editPurchaseId?: string;
  updatePurchase: (formData: FormData) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  activeCardId: string;
  categoryNames: string[];
  month: number;
};

export function Movimientos(props: Props) {
  return <Grilla {...props} />;
}
