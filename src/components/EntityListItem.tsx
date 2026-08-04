import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";

type EntityListItemProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  editHref?: string;
  onDelete?: () => Promise<void>;
  className?: string;
  subtitleClassName?: string;
  valueClassName?: string;
  iconClassName?: string;
  actions?: ReactNode;
};

export function EntityListItem({
  title,
  subtitle,
  icon,
  value,
  isActive = false,
  onClick,
  className,
  subtitleClassName,
  valueClassName,
  iconClassName,
  actions,
}: EntityListItemProps) {


  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer w-full",
        isActive
          ? "border-blue-500 ring-2 ring-blue-500/10 shadow-lg"
          : "border-slate-200 hover:shadow-md",
        className,
      )}
    >
      <div className="flex justify-center gap-4">
        <div
          className={cn(
            "rounded-lg p-2",
            isActive
              ? "bg-blue-50 text-blue-600"
              : "bg-slate-50 text-slate-600",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col items-start justify-center min-w-0">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p
            className={cn(
              "text-xs font-medium text-slate-400",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {value && (
          <span
            className={cn(
              "mr-2 font-mono text-sm font-semibold text-slate-600",
              valueClassName,
            )}
          >
            {value}
          </span>
        )}

        {actions}
      </div>
    </button>
  );
}
