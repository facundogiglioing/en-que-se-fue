import type { KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";

type EntityListItemProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  isActive?: boolean;
  editHref?: string;
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
  onKeyDown,
  className,
  subtitleClassName,
  valueClassName,
  iconClassName,
  actions,
}: EntityListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      data-active={isActive || undefined}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all cursor-pointer w-full text-left hover:shadow-md",
        "data-active:border-blue-500 data-active:ring-2 data-active:ring-blue-500/10 data-active:shadow-lg",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className={cn(
            "shrink-0 rounded-lg bg-slate-50 p-2 text-slate-600 group-data-active:bg-blue-50 group-data-active:text-blue-600",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <h3 className="w-full truncate font-semibold text-slate-900">{title}</h3>
          <p
            className={cn(
              "w-full truncate text-xs font-medium text-slate-400",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
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
    </div>
  );
}
