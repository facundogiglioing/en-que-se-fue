import { Plus } from "lucide-react";
import Link from "next/link";
import {
  addPurchase,
  createCard,
  deletePurchase,
  updatePurchase,
} from "@/actions/creditCard";
import { Container } from "@/components/Container";
import { CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { CreditCard } from "./CreditCard";
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
  const monthOffset = Number.isFinite(parsedOffset) ? Math.trunc(parsedOffset) : 0;
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
    ? purchases.filter((p) => {
      if (p.cardId !== activeCard.id) return false;
      const startIndex = p.startYear * 12 + p.startMonth;
      const endIndex = startIndex + Math.max(1, p.installments || 1) - 1;
      return selectedIndex >= startIndex && selectedIndex <= endIndex;
    })
    : [];

  const totalForPeriod = transactions.reduce(
    (acc, p) => acc + p.totalAmount / Math.max(1, p.installments || 1),
    0,
  );

  const categoryNames = CATEGORIES.map((c) => c.name);
  const currentCardId = activeCard?.id ?? "";

  return (
    <Container>
      <CreditCard card={activeCard || null} allCards={cards} month={monthOffset} />
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
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 mb-4">
            Nueva tarjeta
          </h2>
          <form action={createCard} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="name"
                placeholder="Nombre (Ej: Visa Platinum)"
                required
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <input
                name="bank"
                placeholder="Banco"
                required
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="new-card-closing"
                  className="text-xs text-slate-500 mb-1 block"
                >
                  Día de cierre
                </label>
                <input
                  id="new-card-closing"
                  name="closingDay"
                  type="number"
                  placeholder="Ej: 5"
                  min={1}
                  max={31}
                  required
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label
                  htmlFor="new-card-due"
                  className="text-xs text-slate-500 mb-1 block"
                >
                  Día de vencimiento
                </label>
                <input
                  id="new-card-due"
                  name="dueDay"
                  type="number"
                  placeholder="Ej: 20"
                  min={1}
                  max={31}
                  required
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition"
              >
                Guardar tarjeta
              </button>
              <Link
                href={`/admin/cards?card=${currentCardId}&m=${monthOffset}`}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* ── GRILLA DE MOVIMIENTOS ──────────────────────────────────── */}
      {activeCard && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
              <form action={addPurchase} className="space-y-3">
                <input type="hidden" name="cardId" value={activeCard.id} />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    name="description"
                    placeholder="Descripción"
                    required
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm sm:col-span-2 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="Monto total"
                    required
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <input
                    name="installments"
                    type="number"
                    placeholder="Cuotas"
                    defaultValue={1}
                    min={1}
                    required
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="add-start-period"
                      className="text-xxs text-slate-500 mb-1 block"
                    >
                      Primer cuota
                    </label>
                    <input
                      id="add-start-period"
                      name="startPeriod"
                      type="month"
                      defaultValue={currentPeriod}
                      required
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="add-category"
                      className="text-xxs text-slate-500 mb-1 block"
                    >
                      Categoría
                    </label>
                    <select
                      id="add-category"
                      name="category"
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-slate-400"
                    >
                      {categoryNames.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition"
                    >
                      Guardar
                    </button>
                    <Link
                      href={`/admin/cards?card=${activeCard.id}&m=${monthOffset}`}
                      className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition"
                    >
                      Cancelar
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Tabla */}
          {transactions.length === 0 ? (
            <div className="py-14 text-center text-slate-400 italic text-sm">
              Sin movimientos para este período.
            </div>
          ) : (
            <Movimientos
              transactions={transactions}
              selectedIndex={selectedIndex}
              editPurchaseId={editPurchaseId}
              updatePurchase={updatePurchase}
              deletePurchase={deletePurchase}
              activeCardId={activeCard.id}
              categoryNames={categoryNames}
              month={monthOffset}
            />
          )}
        </div>
      )}

    </Container>
  );
}
