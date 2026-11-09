"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getPageTitle, getUserInitials } from "@/lib/navigation";

type HeaderUser = {
  name: string;
  email: string;
  image?: string | null;
};

function UserAvatar({ user }: { user: HeaderUser }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-text">
      {user.image && failedImage !== user.image ? (
        <Image
          src={user.image}
          alt=""
          width={36}
          height={36}
          unoptimized
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => {
            console.warn(
              "No se pudo cargar la foto de perfil. Se muestran las iniciales.",
            );
            setFailedImage(user.image ?? null);
          }}
        />
      ) : (
        getUserInitials(user.name)
      )}
    </span>
  );
}

export default function AppHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  return (
    <header className="grid h-16 shrink-0 grid-cols-[4rem_minmax(0,1fr)] border-b border-border-primary bg-white lg:h-[72px] lg:grid-cols-[var(--sidebar-width,5rem)_minmax(0,1fr)]">
      <Link
        href="/"
        aria-label="Home Expenses: ir al inicio"
        className="flex h-full items-center justify-center border-r border-border-primary"
      >
        <Image src="/assets/logo-md.png" alt="" width={40} height={40} />
      </Link>
      <div className="flex min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-5">
        <span aria-hidden="true" className="hidden w-48 shrink-0 sm:block" />
        <h1 className="min-w-0 flex-1 truncate text-center text-sm font-bold tracking-tight text-slate-700 sm:text-lg">
          {getPageTitle(pathname)}
        </h1>
        <div
          aria-label={`Usuario: ${user.name}, ${user.email}`}
          role="group"
          title={`${user.name} · ${user.email}`}
          className="flex shrink-0 items-center justify-end gap-3 sm:w-48"
        >
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-xs font-semibold text-slate-700">
              {user.name}
            </p>
            <p className="mt-1 truncate text-xxs text-slate-400">
              {user.email}
            </p>
          </div>
          <UserAvatar user={user} />
        </div>
      </div>
    </header>
  );
}
