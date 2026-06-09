"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useState, useTransition } from "react";
import {
  confirmCardPayment,
  unconfirmCardPayment,
} from "@/actions/cardPayment";
import {
  confirmExpensePayment,
  unconfirmExpensePayment,
} from "@/actions/payment";

export type ModalData = {
  type: "expense" | "card";
  entityId: string;
  entityName: string;
  month: number;
  year: number;
  estimatedAmount: number;
  existingPayment?: { actualAmount?: number; paidAt?: string };
};

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface Props {
  data: ModalData;
  onClose: () => void;
}

export function PaymentConfirmModal({ data, onClose }: Props) {
  const {
    type,
    entityId,
    entityName,
    month,
    year,
    estimatedAmount,
    existingPayment,
  } = data;
  const isPaid = !!existingPayment;
  const [amount, setAmount] = useState(
    existingPayment?.actualAmount ?? estimatedAmount,
  );
  const [isPending, startTransition] = useTransition();
  const [showUnconfirm, setShowUnconfirm] = useState(false);

  const handleConfirm = () => {
    startTransition(async () => {
      if (type === "expense") {
        await confirmExpensePayment(entityId, month, year, amount);
      } else {
        await confirmCardPayment(entityId, month, year, amount);
      }
      onClose();
    });
  };

  const handleUnconfirm = () => {
    startTransition(async () => {
      if (type === "expense") {
        await unconfirmExpensePayment(entityId, month, year);
      } else {
        await unconfirmCardPayment(entityId, month, year);
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 pt-6 pb-4 ${isPaid ? "bg-emerald-50" : "bg-slate-50"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {isPaid ? (
                <CheckCircle2
                  size={20}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
              ) : (
                <AlertCircle
                  size={20}
                  className="text-blue-500 shrink-0 mt-0.5"
                />
              )}
              <div>
                <p className="font-black text-slate-900 tracking-tight leading-tight">
                  {entityName}
                </p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {MONTH_NAMES[month]} {year}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {isPaid && (
            <div className="mt-3 flex items-center gap-2 text-emerald-600">
              <span className="text-[11px] font-black uppercase tracking-widest">
                ✓ Pago confirmado
              </span>
              {existingPayment?.paidAt && (
                <span className="text-xxs font-medium text-emerald-400">
                  ·{" "}
                  {new Date(existingPayment.paidAt).toLocaleDateString("es-AR")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-500">Monto estimado</span>
            <span className="font-black font-mono text-slate-400">
              ${estimatedAmount.toLocaleString("es-AR")}
            </span>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="actualAmount"
              className="text-[11px] font-black uppercase tracking-widest text-slate-500"
            >
              Monto real pagado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                $
              </span>
              <input
                id="actualAmount"
                type="number"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending
              ? "Guardando..."
              : isPaid
                ? "Actualizar monto"
                : "Confirmar pago"}
          </button>

          {/* Unconfirm */}
          {isPaid && !showUnconfirm && (
            <button
              type="button"
              onClick={() => setShowUnconfirm(true)}
              className="w-full py-2 text-slate-400 hover:text-rose-500 font-bold text-xs uppercase tracking-widest transition"
            >
              Desmarcar como pagado
            </button>
          )}
          {isPaid && showUnconfirm && (
            <div className="bg-rose-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-rose-600 text-center">
                ¿Estás seguro que querés desmarcar este pago?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnconfirm(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  No, cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUnconfirm}
                  disabled={isPending}
                  className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition disabled:opacity-60"
                >
                  Sí, desmarcar
                </button>
              </div>
            </div>
          )}

          {!isPaid && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
