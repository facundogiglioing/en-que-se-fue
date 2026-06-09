import type { Options } from "@/types/general";

type Props = {
  name: string;
  cards: Options[];
  defaultValue?: string | number;
};

export function Dropdown({ name, cards, defaultValue }: Props) {
  return (
    <select
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
      <option value="">Seleccionar Tarjeta...</option>
      {cards.map((c) => (
        <option key={`${c.value}`} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
