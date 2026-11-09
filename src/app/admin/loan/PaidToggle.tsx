"use client";

import { AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import {
  confirmLoanInstallment,
  unconfirmLoanInstallment,
} from "@/actions/loanPayment";

interface Props {
  installmentNumber: number;
  paid: boolean;
  dueDateLabel: string;
  totalArsLabel: string;
}

export default function PaidToggle({
  installmentNumber,
  paid,
  dueDateLabel,
  totalArsLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (paid) {
          await unconfirmLoanInstallment(installmentNumber);
        } else {
          await confirmLoanInstallment(installmentNumber);
        }
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo guardar el cambio. Reintentá.",
        );
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={
          paid
            ? `Desmarcar cuota ${installmentNumber} como abonada`
            : `Marcar cuota ${installmentNumber} como abonada`
        }
        className={`mx-auto flex items-center justify-center rounded-full px-2 py-0.5 text-xxs font-bold uppercase transition active:scale-95 ${
          paid
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "border border-dashed border-slate-300 text-slate-400 hover:border-green-400 hover:text-green-600"
        }`}
      >
        {paid ? "Sí" : "—"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {paid ? "Desmarcar cuota" : "Confirmar pago"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Cuota <strong>#{installmentNumber}</strong> con vencimiento el{" "}
              <strong>{dueDateLabel}</strong> por un total de{" "}
              <strong>{totalArsLabel}</strong>.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {paid
                ? "Se eliminará el registro de pago y la cuota volverá a calcularse con los valores actuales."
                : "Se guardará el UVA de la fecha de vencimiento y el tipo de cambio oficial del momento."}
            </p>

            {error && (
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className={`flex-1 rounded-xl py-2.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 ${
                  paid
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isPending
                  ? "Guardando..."
                  : paid
                    ? "Desmarcar"
                    : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
