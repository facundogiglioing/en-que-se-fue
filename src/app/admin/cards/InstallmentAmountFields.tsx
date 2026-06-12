"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  defaultInstallments?: number;
  className?: string;
};

export function InstallmentAmountFields({
  defaultInstallments = 1,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentsInput, setInstallmentsInput] = useState(
    String(defaultInstallments),
  );

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const handleSubmit = () => {
      setInstallmentAmount("");
      setInstallmentsInput(String(defaultInstallments));
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [defaultInstallments]);

  const parsedInstallments = Number.parseInt(installmentsInput, 10);
  const installments =
    Number.isFinite(parsedInstallments) && parsedInstallments > 0
      ? parsedInstallments
      : 1;

  const totalAmount = useMemo(() => {
    const parsedInstallmentAmount = Number.parseFloat(installmentAmount);
    if (
      !Number.isFinite(parsedInstallmentAmount) ||
      parsedInstallmentAmount <= 0
    ) {
      return "";
    }

    return (parsedInstallmentAmount * installments).toFixed(2);
  }, [installmentAmount, installments]);

  return (
    <div
      ref={rootRef}
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}
    >
      <div className="min-w-0">
        <label htmlFor="installment-amount">Monto por cuota</label>
        <input
          id="installment-amount"
          name="installmentAmount"
          type="number"
          step="0.01"
          min={0}
          value={installmentAmount}
          onChange={(e) => setInstallmentAmount(e.target.value)}
          required
          className="w-full min-w-0 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>
      <div className="min-w-0 sm:max-w-24">
        <label htmlFor="installments-count">Cuotas</label>
        <input
          id="installments-count"
          name="installments"
          type="number"
          min={1}
          value={installmentsInput}
          onChange={(e) => setInstallmentsInput(e.target.value)}
          required
          className="w-full min-w-0 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>
      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
        <label htmlFor="total-amount">Monto total</label>
        <input
          id="total-amount"
          type="text"
          value={totalAmount}
          readOnly
          className="w-full min-w-0 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700"
        />
      </div>
      <input name="amount" type="hidden" value={totalAmount} />
    </div>
  );
}
