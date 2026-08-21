"use client";

import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/base/Button";
import { getCurrentIndex, normalizeIndex, shiftIndex } from "../utils";

export function Actions() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const rawIndex = Number.parseInt(segments[segments.length - 1] ?? "", 10);
  const currentIndex = Number.isFinite(rawIndex)
    ? normalizeIndex(rawIndex)
    : getCurrentIndex();
  const cardId = segments.length >= 3 ? segments[2] : undefined;

  const createUrlWithIndex = (index: number) => {
    if (!cardId) return "/admin/cards";
    return `/admin/cards/${cardId}/${index}`;
  };

  const prevIndex = shiftIndex(currentIndex, -1);
  const nextIndex = shiftIndex(currentIndex, 1);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="danger"
        href={createUrlWithIndex(prevIndex)}
      >
        <ArrowLeft size={18} />
      </Button>
      <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg whitespace-nowrap">
        {currentIndex}
      </span>
      <Button
        type="button"
        variant="danger"
        href={createUrlWithIndex(nextIndex)}
      >
        <ArrowRight size={18} />
      </Button>
      <Button
        type="button"
        variant="primary"
        href={`${pathname}?addPurchase=1`}
      >
        <Plus size={12} />
        Agregar
      </Button>
    </div>
  );
}
