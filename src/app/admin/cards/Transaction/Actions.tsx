"use client";

import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/base/Button";
import { getCurrentIndex, normalizeIndex, shiftIndex } from "../utils";

export function Actions() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawIndex = Number.parseInt(searchParams.get("index") ?? "", 10);
  const currentIndex = Number.isFinite(rawIndex)
    ? normalizeIndex(rawIndex)
    : getCurrentIndex();

  const createUrlWithIndex = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("index", String(index));
    return `${pathname}?${params.toString()}`;
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
        href={createUrlWithIndex(nextIndex)}
      >
        <Plus size={12} />
        Agregar
      </Button>
    </div>
  );
}
