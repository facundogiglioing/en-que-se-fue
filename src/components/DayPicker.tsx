"use client";
import { useEffect, useState } from "react";

export function DayPicker({
  defaultValue = 1,
}: {
  defaultValue?: number;
}) {
  const [selected, setSelected] = useState(defaultValue);

  // Si cambia el defaultValue (al seleccionar otro gasto para editar), actualizamos el estado
  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  return (
    <div className="space-y-2">
      <label
        htmlFor="dueDate"
        className="block text-xs font-bold uppercase text-slate-500"
      >
        Día de Vencimiento:{" "}
        <span className="text-blue-600 font-mono">{selected}</span>
      </label>
      <input type="hidden" name="dueDate" id="dueDate" value={selected} />
      <div className="grid grid-cols-7 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelected(day)}
            className={`h-8 w-full text-xs rounded-md transition-all ${selected === day
                ? "bg-slate-900 text-white font-bold shadow-sm"
                : "hover:bg-white text-slate-400"
              }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
