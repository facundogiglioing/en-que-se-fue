
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import Navbar, { MobileNav } from "@/components/Navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Home Expenses",
  description: "Gestión minimalista de gastos familiares",
};

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plus-jakarta-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${robotoMono.variable}`}
    >
      <body className="h-dvh overflow-hidden bg-background text-foreground">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex min-h-0 flex-1">
            <Navbar />
            <main className="min-h-0 flex-1 overflow-y-auto bg-white lg:overflow-hidden">
              {children}
            </main>
          </div>

          <MobileNav />

          <footer className="hidden border-t border-border-primary bg-white px-5 py-3 text-center text-xxs font-semibold uppercase tracking-[0.2em] text-slate-400 lg:block">
            Home Expenses · panel global
          </footer>
        </div>
      </body>
    </html>
  );
}
