import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import AppHeader from "@/components/AppHeader";
import Navbar, { MobileNav } from "@/components/Navbar";
import { getSession } from "@/lib/auth-session";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${robotoMono.variable}`}
    >
      <body className="h-dvh overflow-hidden bg-background text-foreground">
        <div className="flex h-full min-h-0 flex-col">
          {session && (
            <AppHeader
              user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }}
            />
          )}
          <div className="flex min-h-0 flex-1">
            {session && <Navbar role={session.user.role} />}
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white lg:overflow-hidden">
              {children}
            </main>
          </div>

          {session && <MobileNav role={session.user.role} />}

          {session && (
            <footer className="hidden border-t border-border-primary bg-white px-5 py-3 text-center text-xxs font-semibold uppercase tracking-[0.2em] text-slate-400 lg:block">
              Home Expenses · panel global
            </footer>
          )}
        </div>
      </body>
    </html>
  );
}
