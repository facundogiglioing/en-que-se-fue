
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";


import { Header } from "@/components/Header";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
        <div
          className="grid h-full min-h-0"
          style={{
            gridTemplateAreas: '"header header" "menu content" "footer footer"',
            gridTemplateColumns: "minmax(200px, 1fr) minmax(0, 10fr)",
            gridTemplateRows: "auto minmax(0, 1fr) auto",
          }}
        >

          <Header />
          <Navbar />
          <main
            className="min-h-0 overflow-hidden bg-white"
            style={{ gridArea: "content" }}
          >
            {children}
          </main>

          <footer
            className="border-t border-border-primary bg-white px-5 py-3 text-center text-xxs font-semibold uppercase tracking-[0.2em] text-slate-400"
            style={{ gridArea: "footer" }}
          >
            Home Expenses · panel global
          </footer>
        </div>
      </body>
    </html>
  );
}
