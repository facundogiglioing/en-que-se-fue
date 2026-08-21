import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/base/Button";
import HeaderBase from "@/components/PanelHeader";
import { shiftIndex } from "../utils";

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
    const basePath = cardId && cardId !== "0" ? `/admin/cards/${cardId}` : "/admin/cards";
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
        <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg whitespace-nowrap">
          {selectedPeriodLabel}
        </span>
        <Button
          type="button"
          variant="danger"
          href={`${basePath}/${nextIndex}`}
        >
          <ArrowRight size={18} />
        </Button>
        <Button
          type="button"
          variant="primary"
          href={`${basePath}/${selectedIndex}?addPurchase=1`}
        >
          <Plus size={12} />
          Agregar
        </Button>
      </div>

    )
  }

  return (
    <HeaderBase
      title="Movimientos"
      subTitle={`Total: ${formattedTotal}`}
      actions={<Actions />}
    />
  );
}

