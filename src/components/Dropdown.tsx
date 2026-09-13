import type { Options } from "@/types/general";
import { Label } from "./base/Label";

type Props = {
  name: string;
  cards: Options[];
  defaultValue?: string | number;
  label?: string;
  placeholder?: string;
};

export function Dropdown({ name, cards, defaultValue, label, placeholder = "Seleccionar Tarjeta..." }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <Label htmlFor={name} text={label} />}
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={`
          w-full px-3 py-2 
          text-sm
          rounded-lg
          border border-slate-200 outline-none
          focus:ring-2 focus:ring-slate-900/5
          transition
        `}
        required
      >
        <option value="">{placeholder}</option>
        {cards.map((c) => (
          <option key={`${c.value}`} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
