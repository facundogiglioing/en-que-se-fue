"use client";

import { CreditCard, Home, Settings, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DynamicHeader from "@/components/DynamicHeader";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800">
      <div className="mx-auto max-w-5xl px-6 py-2 flex justify-between items-center">
        <Image
          src="/assets/logo-normal.png"
          alt="Logo"
          width={134}
          height={60}
        />
        <DynamicHeader />
        {/* Navegación Principal */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 group"
            title="Inicio"
          >
            <Home size={20} />
          </Link>

          <Link
            href="/admin/income"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 group"
            title="Ingresos"
          >
            <Wallet size={20} />
          </Link>

          {/* Nuevo Link de Tarjetas */}
          <Link
            href="/admin/cards"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 group"
            title="Tarjetas"
          >
            <CreditCard size={20} />
          </Link>

          <Link
            href="/admin/expenses"
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 group"
            title="Gastos Fijos"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
