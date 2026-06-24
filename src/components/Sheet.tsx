import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type SheetSide = "right" | "left" | "top" | "bottom";

type Props = {
  children: ReactNode;
  closeHref: string;
  title: string;
  description?: string;
  side?: SheetSide;
};

const sideStyles: Record<SheetSide, string> = {
  right:
    "right-0 my-10 top-0 h-[calc(100dvh-5rem)] w-full max-w-xl border-l border-slate-200 rounded-l-2xl",
  left:
    "left-0 my-10 top-0 h-[calc(100dvh-5rem)] w-full max-w-xl border-r border-slate-200 rounded-r-2xl",
  top: "left-0 top-0 w-full max-h-[85dvh] border-b border-slate-200 rounded-b-2xl",
  bottom:
    "left-0 bottom-0 w-full max-h-[85dvh] border-t border-slate-200 rounded-t-2xl",
};

const sideAnimations: Record<SheetSide, string> = {
  right: "animate-[sheet-in-right_220ms_ease-out]",
  left: "animate-[sheet-in-left_220ms_ease-out]",
  top: "animate-[sheet-in-top_220ms_ease-out]",
  bottom: "animate-[sheet-in-bottom_220ms_ease-out]",
};

export function Sheet({
  children,
  closeHref,
  title,
  description,
  side = "right",
}: Props) {
  return (
    <div className="fixed inset-0 z-50">
      <Link
        href={closeHref}
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={`absolute bg-white shadow-2xl flex flex-col overflow-hidden ${sideStyles[side]} ${sideAnimations[side]}`}
        style={{
          animationFillMode: "both",
        }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="sheet-title"
              className="text-sm font-black uppercase tracking-widest text-slate-800"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
          </div>

          <Link
            href={closeHref}
            aria-label="Cerrar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={16} />
          </Link>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">{children}</div>
      </aside>

      <style>{`
        @keyframes sheet-in-right {
          from {
            transform: translateX(500px);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes sheet-in-left {
          from {
            
            transform: translateX(-32px);
          }
          to {
            
            transform: translateX(0);
          }
        }

        @keyframes sheet-in-top {
          from {
            opacity: 0;
            transform: translateY(-24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sheet-in-bottom {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}