import { CreditCard, Home, Settings, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/admin/income", label: "Ingresos", icon: Wallet },
  { href: "/admin/cards", label: "Tarjetas", icon: CreditCard },
  { href: "/admin/expenses", label: "Gastos fijos", icon: Settings },
];

export default function Navbar() {
  return (
    <aside className="hidden min-h-0 shrink-0 overflow-visible border-r border-border-primary bg-white shadow-sm lg:flex lg:w-20 lg:flex-col lg:gap-5">
      <div>
        <Link
          href="/"
          className="flex items-center justify-center border-b border-border-primary p-4"
        >
          <Image src="/assets/logo-md.png" alt="Logo" width={40} height={40} />
        </Link>

        <div className="mt-3 flex flex-col items-center gap-2 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center justify-center rounded-lg p-3 text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon size={20} />

              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                {label}
              </span>
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