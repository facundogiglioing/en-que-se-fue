"use client";

import Image from "next/image";
import DynamicHeader from "@/components/DynamicHeader";

export function Header() {
  return (
    <header
      className="z-50 border-b bg-white/80 backdrop-blur-md border-border-primary"
      style={{ gridArea: "header" }}
    >
      <div className="mx-auto max-w-5xl px-6 py-2 flex justify-between items-center">
        <Image
          src="/assets/logo-normal.png"
          alt="Logo"
          width={134}
          height={60}
        />
        <DynamicHeader />
      </div>

    </header>

  );
}
