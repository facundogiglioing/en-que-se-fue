import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/base/Button";
import HeaderBase from "@/components/PanelHeader";
import { shiftIndex } from "../utils";
import AddPurchaseAction from "./AddPurchaseAction";

type HeaderProps = {
  totalForPeriod: number;
  selectedPeriodLabel: string;
  cardId: string;
  selectedIndex: number;
};

export default function TransactionHeader({
  totalForPeriod,
  selectedPeriodLabel,
  cardId,
  selectedIndex,
}: HeaderProps) {
  const formattedTotal = totalForPeriod.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const Actions = () => {
    const basePath =
      cardId && cardId !== "0" ? `/admin/cards/${cardId}` : "/admin/cards";
    const prevIndex = shiftIndex(selectedIndex, -1);
    const nextIndex = shiftIndex(selectedIndex, 1);

    return (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="danger"
          href={`${basePath}/${prevIndex}`}
        >
          <ArrowLeft size={18} />
        </Button>
        <span className="px-3 py-2 text-xs uppercase text-slate-900 bg-slate-100 rounded-lg whitespace-nowrap w-40 text-center">
          {selectedPeriodLabel}
        </span>
        <Button
          type="button"
          variant="danger"
          href={`${basePath}/${nextIndex}`}
        >
          <ArrowRight size={18} />
        </Button>
        <AddPurchaseAction cardId={cardId} selectedIndex={selectedIndex} />
      </div>
    );
  };

  return (
    <HeaderBase
      title="Movimientos"
      subTitle={`Total: ${formattedTotal}`}
      actions={<Actions />}
    />
  );
}
