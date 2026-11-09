"use client";

import { CreditCard, Home, Landmark, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { hasRole, ROLES } from "@/lib/roles";
import SignOutButton from "./SignOutButton";

const icons = {
  home: Home,
  income: Wallet,
  cards: CreditCard,
  expenses: Settings,
  loan: Landmark,
};

export default function Navbar({ role }: { role: string }) {
  const pathname = usePathname();
  const items = hasRole(role, [ROLES.ADMIN]) ? NAV_ITEMS : [];
  return (
    <aside
      aria-label="Menú principal"
      className="hidden min-h-0 shrink-0 overflow-visible border-r border-border-primary bg-white shadow-sm lg:flex lg:w-[var(--sidebar-width,5rem)] lg:flex-col lg:gap-5"
    >
      <nav
        aria-label="Navegación principal"
        className="mt-3 flex flex-col items-center gap-2 px-2"
      >
        {items.map(({ href, label, icon }) => {
          const Icon = icons[icon];
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center justify-center rounded-lg p-3 transition ${active ? "bg-primary text-primary-text" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon size={20} />

              {/* Tooltip */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border-primary py-3">
        <SignOutButton />
      </div>
    </aside>
  );
}

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = hasRole(role, [ROLES.ADMIN]) ? NAV_ITEMS : [];
  return (
    <nav
      aria-label="Navegación móvil"
      className="flex shrink-0 items-stretch justify-around border-t border-border-primary bg-white/95 backdrop-blur-md lg:hidden"
    >
      {items.map(({ href, label, icon }) => {
        const Icon = icons[icon];
        const active =
          pathname === href ||
          (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2 transition ${active ? "text-primary-text" : "text-slate-500 hover:text-slate-900"}`}
          >
            <Icon size={20} />
            <span className="text-xxs font-bold uppercase tracking-wide leading-none">
              {label}
            </span>
          </Link>
        );
      })}
      <SignOutButton compact />
    </nav>
  );
}
