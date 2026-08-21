import { CreditCard, Home, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import PanelHeader from "./PanelHeader";

export default function Navbar() {
  return (
    <aside
      className="hidden min-h-0 overflow-hidden border-r border-border-primary bg-white shadow-sm lg:flex lg:flex-col lg:gap-5"
      style={{ gridArea: "menu" }}
    >
      <div>
        <PanelHeader title="Menu" />

        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Home size={18} />
            Inicio
          </Link>
          <Link
            href="/admin/income"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Wallet size={18} />
            Ingresos
          </Link>
          <Link
            href="/admin/cards/0"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <CreditCard size={18} />
            Tarjetas
          </Link>
          <Link
            href="/admin/expenses"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings size={18} />
            Gastos fijos
          </Link>
        </div>
      </div>
    </aside>
  );

}