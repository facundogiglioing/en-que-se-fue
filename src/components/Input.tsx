import type { HTMLInputTypeAttribute } from "react";

export function Input({
  id,
  name,
  defaultValue,
  placeholder,
  label,
  required,
  type,
  step,
}: {
  id?: string;
  name: string;
  defaultValue?: string | number;
  placeholder?: string;
  label?: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute | undefined;
  step?: string | number | undefined;
}) {
  return (
    <div>
      <label htmlFor={name}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        type={type}
        step={step}
        className={`
          w-full px-3 py-2 
          text-sm
          rounded-lg
          border border-slate-200 outline-none
          focus:ring-2 focus:ring-slate-900/5
          transition
        `}
      />
    </div>
  );
}
