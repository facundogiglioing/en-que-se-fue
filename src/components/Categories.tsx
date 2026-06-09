import { CATEGORIES } from "@/lib/constants";

type Props = {
  value: string | undefined;
};

export function Categories({ value }: Props) {
  return (
    <div>
      <span className="block text-xs font-bold uppercase text-slate-500 mb-2">
        Categoría
      </span>
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => (
          <label
            key={cat.name}
            htmlFor={`cat-${cat.name}`}
            className="relative cursor-pointer group" // "group" es clave para el hover
          >
            <input
              type="radio"
              id={`cat-${cat.name}`}
              name="category"
              value={cat.name}
              defaultChecked={value === cat.name}
              className="peer sr-only"
              required
            />

            {/* El botón visual */}
            <div className={`
              flex items-center justify-center gap-2 p-2
              text-xs
              border border-slate-200
              rounded-lg
              peer-checked:border-slate-900
              peer-checked:bg-slate-50
              transition
              hover:bg-slate-50  
            `}>
              <cat.icon
                size={14}
                className="text-slate-400 group-hover:text-slate-900"
              />
            </div>

            {/* EL TOOLTIP / POPUP */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              <p className="font-medium">{cat.name} - {cat.description}</p>
              {/* Triangulito del Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}