"use client";

import { usePathname } from "next/navigation";

export default function DynamicHeader() {
  const pathname = usePathname();

  const getSectionName = () => {
    if (pathname === "/") return "Resumen Mensual";
    if (pathname.includes("/admin/expenses")) return "Configuración Gastos";
    if (pathname.includes("/admin/income")) return "Configuración Ingresos";
    return "Gastos";
  };

  return (
    <div className="flex flex-col">
      <p className="text-xxs font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">
        {getSectionName()}
      </p>
    </div>
  );
}