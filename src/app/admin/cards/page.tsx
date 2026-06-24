import { Plus } from "lucide-react";
import Link from "next/link";
import {
  deletePurchase,
} from "@/actions/creditCard";
import { Container } from "@/components/Container";
import { Sheet } from "@/components/Sheet";
import { CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { CreditCard } from "./CreditCard";
import { FormCard } from "./FormCard";
import { FormPurchase } from "./FormPurchase";
import { Movimientos } from "./Movements/Movimientos";

export const dynamic = "force-dynamic";

function getMonthLabel(month: number, year: number) {
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

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
  const selectedPeriodLabel = getMonthLabel(selectedMonth, selectedYear);
  const currentPeriod = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}`;

  const showNewCard = params.newCard === "1";
  const showAddPurchase = params.addPurchase === "1";
  const editPurchaseId = params.edit;

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

  const totalForPeriod = transactions.reduce(
    (acc, p) => acc + p.totalAmount / Math.max(1, p.installments || 1),
    0,
  );

  const categoryNames = CATEGORIES.map((c) => c.name);
  const currentCardId = activeCard?.id ?? "";

  return (
    <Container className="flex h-[calc(100dvh-141px)] flex-col gap-4 overflow-hidden">
      <CreditCard
        card={activeCard || null}
        allCards={cards}
        month={monthOffset}
      />
      {/* ── DOTS Y AGREGAR NUEVA ──────────────────────────────────── */}
      <div className="flex flex-row gap-4">
        <Link
          href={`/admin/cards?card=${currentCardId}&m=${monthOffset}&newCard=1`}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
        >
          <Plus size={14} />
          Nueva tarjeta
        </Link>
      </div>

      {/* ── FORMULARIO NUEVA TARJETA ──────────────────────────────── */}
      {showNewCard && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <FormCard cardId={currentCardId} monthOffset={monthOffset} />
          <Link
            href={`/admin/cards?card=${currentCardId}&m=${monthOffset}`}
            className="mt-4 px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition inline-block"
          >
            Cancelar
          </Link>
        </div>
      )}

      {/* ── GRILLA DE MOVIMIENTOS ──────────────────────────────────── */}
      {activeCard && (
        <div className="flex min-h-0 flex-1 flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {/* Header movimientos */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3 justify-between items-center">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">
                Movimientos
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total{" "}
                <span className="font-bold text-slate-700 font-mono">
                  $
                  {totalForPeriod.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/cards?card=${activeCard.id}&m=${monthOffset - 1}`}
                className="px-2 py-1 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                ←
              </Link>
              <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg whitespace-nowrap">
                {selectedPeriodLabel}
              </span>
              <Link
                href={`/admin/cards?card=${activeCard.id}&m=${monthOffset + 1}`}
                className="px-2 py-1 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                →
              </Link>
              <Link
                href={`/admin/cards?card=${activeCard.id}&m=${monthOffset}&addPurchase=1`}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <Plus size={12} />
                Agregar
              </Link>
            </div>
          </div>

          {/* Formulario nuevo movimiento */}
          {showAddPurchase && (
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <p className="text-xxs font-black uppercase tracking-widest text-slate-500 mb-3">
                Nuevo movimiento
              </p>
              <FormPurchase
                activeCardId={activeCard.id}
                categoryNames={categoryNames}
                monthOffset={monthOffset}
                currentPeriod={currentPeriod}
              />
            </div>
          )}

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
              activeCardId={activeCard.id}
              month={monthOffset}
            />
          )}
        </div>
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
