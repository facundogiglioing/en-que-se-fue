import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/base/Button";
import HeaderBase from "@/components/PanelHeader";
import { shiftIndex } from "../utils";
import AddPurchaseAction from "./AddPurchaseAction";
import UploadStatementAction from "./UploadStatementAction";

type HeaderProps = {
  totalForPeriod: number;
  selectedPeriodLabel: string;
  cardId: string;
  selectedIndex: number;
  consumptionPeriodLabel?: string;
};

export default function TransactionHeader({
  totalForPeriod,
  selectedPeriodLabel,
  cardId,
  selectedIndex,
  consumptionPeriodLabel,
}: HeaderProps) {
  const formattedTotal = totalForPeriod.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const subTitle = consumptionPeriodLabel
    ? `Total: ${formattedTotal} · Mes vencido: consumos de ${consumptionPeriodLabel}`
    : `Total: ${formattedTotal}`;

  const Actions = () => {
    const basePath =
      cardId && cardId !== "0" ? `/admin/cards/${cardId}` : "/admin/cards";
    const prevIndex = shiftIndex(selectedIndex, -1);
    const nextIndex = shiftIndex(selectedIndex, 1);

    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="danger"
          href={`${basePath}/${prevIndex}`}
        >
          <ArrowLeft size={18} />
        </Button>
        <span className="w-28 whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-center text-xs uppercase text-slate-900 sm:w-40">
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
        <UploadStatementAction cardId={cardId} />
      </div>
    );
  };

  return (
    <HeaderBase title="Movimientos" subTitle={subTitle} actions={<Actions />} />
  );
}
