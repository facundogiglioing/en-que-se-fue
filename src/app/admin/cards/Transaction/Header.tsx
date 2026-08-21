import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/base/Button";
import HeaderBase from "@/components/PanelHeader";

type HeaderProps = {
  totalForPeriod: number;
  selectedPeriodLabel: string;
  cardId: string;
  monthOffset: number;
};

export default function TransactionHeader({
  totalForPeriod,
  selectedPeriodLabel,
  cardId,
  monthOffset,
}: HeaderProps) {
  const formattedTotal = totalForPeriod.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const Actions = () => {
    return (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="danger"
          href={`/admin/cards?cardId=${cardId}&m=${monthOffset - 1}`}
        >
          <ArrowLeft size={18} />
        </Button>
        <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg whitespace-nowrap">
          {selectedPeriodLabel}
        </span>
        <Button
          type="button"
          variant="danger"
          href={`/admin/cards?cardId=${cardId}&m=${monthOffset + 1}`}
        >
          <ArrowRight size={18} />
        </Button>
        <Button
          type="button"
          variant="primary"
          href={`/admin/cards?cardId=${cardId}&m=${monthOffset}&addPurchase=1`}
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

