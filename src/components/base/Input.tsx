import type { HTMLInputTypeAttribute } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./Label";

export type InputProps = {
  id?: string;
  name: string;
  value?: string;
  ref?: React.Ref<HTMLInputElement>;
  defaultValue?: string | number;
  placeholder?: string;
  label: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute | undefined;
  step?: string | number | undefined;
  min?: string | number | undefined;
  max?: string | number | undefined;
  maxLength?: number | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
};

export function Input({
  id,
  name,
  value,
  ref,
  defaultValue,
  placeholder,
  label,
  required,
  type,
  step,
  min,
  max,
  maxLength,
  onChange,
  onKeyDown,
  className,
}: InputProps) {
  const inputClass = cn(
    "w-full px-3 py-2 text-sm rounded-lg border border-slate-200",
    "transition outline-none focus:ring focus:ring-blue-300",
    className,
  );

  const realType = type === "numeric" ? "text" : type || "text";
  const inputmode = type === "numeric" ? "numeric" : undefined;
  const pattern = type === "numeric" ? "[0-9]*" : undefined;

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name} text={label} />
      <input
        id={id}
        name={name}
        value={value}
        ref={ref}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        type={realType}
        step={step}
        min={min}
        max={max}
        maxLength={maxLength}
        inputMode={inputmode}
        pattern={pattern}
        className={inputClass}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
