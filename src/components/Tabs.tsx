"use client";

import { useRef } from "react";

type Tab<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  id: string;
  label: string;
  tabs: readonly Tab<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({
  id,
  label,
  tabs,
  value,
  onChange,
}: Props<T>) {
  const tabList = useRef<HTMLDivElement>(null);

  return (
    <div ref={tabList} className="flex gap-6" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => (
        <button
          type="button"
          key={tab.id}
          role="tab"
          id={`${id}-tab-${tab.id}`}
          aria-selected={value === tab.id}
          aria-controls={`${id}-panel-${tab.id}`}
          tabIndex={value === tab.id ? 0 : -1}
          onKeyDown={(event) => {
            let target: number;
            switch (event.key) {
              case "ArrowRight":
                target = (index + 1) % tabs.length;
                break;
              case "ArrowLeft":
                target = (index - 1 + tabs.length) % tabs.length;
                break;
              case "Home":
                target = 0;
                break;
              case "End":
                target = tabs.length - 1;
                break;
              default:
                return;
            }
            event.preventDefault();
            onChange(tabs[target].id);
            tabList.current
              ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
              [target]?.focus();
          }}
          onClick={() => onChange(tab.id)}
          className={`border-b-2 pb-3 text-sm font-semibold transition ${value === tab.id ? "border-primary-text text-primary-text" : "border-transparent text-slate-400 hover:text-slate-700"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
