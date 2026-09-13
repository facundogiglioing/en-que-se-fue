import { CreditCard, Home, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import PanelHeader from "./PanelHeader";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/admin/income", label: "Ingresos", icon: Wallet },
  { href: "/admin/cards", label: "Tarjetas", icon: CreditCard },
  { href: "/admin/expenses", label: "Gastos fijos", icon: Settings },
];

export default function Navbar() {
  return (
    <aside className="hidden min-h-0 shrink-0 overflow-hidden border-r border-border-primary bg-white shadow-sm lg:flex lg:w-64 lg:flex-col lg:gap-5">
      <div>
        <PanelHeader title="Menu" />

        <div className="mt-3 flex flex-col gap-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="flex shrink-0 items-stretch justify-around border-t border-border-primary bg-white/95 backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-slate-500 transition hover:text-slate-900"
        >
          <Icon size={20} />
          <span className="text-xxs font-bold uppercase tracking-wide leading-none">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}