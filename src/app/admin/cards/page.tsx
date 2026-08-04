import { deletePurchase } from "@/actions/creditCard";
import { Container } from "@/components/Container";
import { Sheet } from "@/components/Sheet";
import { CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/db";
import CreditCardList from "./CreditCard/List";
import { FormCard } from "./FormCard";
import { FormPurchase } from "./FormPurchase";
import { Movimientos } from "./Movements/Movimientos";

export const dynamic = "force-dynamic";

export default async function CardsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    card?: string;
    m?: string;
    edit?: string;
    addPurchase?: string;
    newCard?: string;
  }>;
}) {
  const params = await searchParams;
  const db = await getDb();
  const cards = db.data.creditCards || [];
  const purchases = db.data.transactions || [];

  // Obtener tarjeta activa por ID
  const cardId = params.card;
  const activeCard = cardId ? cards.find((c) => c.id === cardId) : cards[0];

  const parsedOffset = Number(params.m ?? 0);
  const monthOffset = Number.isFinite(parsedOffset)
    ? Math.trunc(parsedOffset)
    : 0;
  const baseDate = new Date();
  const selectedDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + monthOffset,
    1,
  );
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const selectedIndex = selectedYear * 12 + selectedMonth;
  const currentPeriod = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}`;

  const showNewCard = params.newCard === "1";
  const showAddPurchase = params.addPurchase === "1";
  const editPurchaseId = params.edit;
  const editCardMode = params.editCard === "1";

  const transactions = activeCard
    ? purchases
      .filter((p) => {
        if (p.cardId !== activeCard.id) return false;
        const startIndex = p.startYear * 12 + p.startMonth;
        // Si es recurrente, no tiene fin; si no, termina con las cuotas
        const endIndex = p.isRecurring
          ? Infinity
          : startIndex + Math.max(1, p.installments || 1) - 1;
        return selectedIndex >= startIndex && selectedIndex <= endIndex;
      })
      .sort((a, b) => {
        const aStartIndex = a.startYear * 12 + a.startMonth;
        const bStartIndex = b.startYear * 12 + b.startMonth;

        if (aStartIndex !== bStartIndex) {
          return bStartIndex - aStartIndex;
        }

        return b.id.localeCompare(a.id);
      })
    : [];

  const editingTransaction =
    editPurchaseId && activeCard
      ? purchases.find(
        (p) => p.id === editPurchaseId && p.cardId === activeCard.id,
      )
      : undefined;

  const categoryNames = CATEGORIES.map((c) => c.name);
  const activeCardId = activeCard?.id ?? "";

  return (
    <Container className="flex h-[calc(100dvh-141px)] flex-col gap-4 overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0">
          <CreditCardList
            cards={cards}
            month={monthOffset}
            activeCardId={activeCardId}
          />
        </div>
        <div className="min-w-0 border-l border-slate-200">
          {/* Tabla */}
          {transactions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-5 py-14 text-center text-slate-400 italic text-sm">
              Sin movimientos para este período.
            </div>
          ) : (
            <Movimientos
              transactions={transactions}
              selectedIndex={selectedIndex}
              deletePurchase={deletePurchase}
              activeCardId={activeCard?.id || "0"}
              month={monthOffset}
            />
          )}
        </div>
      </div>

      {(showNewCard || (editCardMode && activeCard)) && (
        <Sheet
          title={showNewCard ? "Nueva tarjeta" : "Editar tarjeta"}
          description={
            showNewCard
              ? "Completá los datos para registrar una nueva tarjeta."
              : "Actualizá los datos de la tarjeta seleccionada."
          }
          closeHref={`/admin/cards?card=${activeCardId}&m=${monthOffset}`}
        >
          <FormCard
            card={showNewCard ? undefined : activeCard}
            cardId={activeCardId}
            monthOffset={monthOffset}
          />
        </Sheet>
      )}

      {activeCard && editingTransaction && (
        <Sheet
          title="Editar movimiento"
          description="Actualizá el detalle de la compra y guardá los cambios."
          closeHref={`/admin/cards?card=${activeCard.id}&m=${monthOffset}`}
        >
          <FormPurchase
            activeCardId={activeCard.id}
            categoryNames={categoryNames}
            transaction={editingTransaction}
            monthOffset={monthOffset}
            currentPeriod={currentPeriod}
          />
        </Sheet>
      )}
    </Container>
  );
}
