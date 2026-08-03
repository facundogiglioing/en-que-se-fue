"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Input, type InputProps } from "./Input";

export type InputThousandsProps = Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string | number;
  onChange?: (value: number | null) => void;
};

export function InputThousands({
  value,
  placeholder = "0,00",
  defaultValue,
  onChange,
  ...props
}: InputThousandsProps) {
  // Separamos el estado para controlar exactamente el flujo que pedís
  const [integerPart, setIntegerPart] = useState<string>("");
  const [decimalPart, setDecimalPart] = useState<string>("");
  const [isEditingDecimals, setIsEditingDecimals] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Formateador para Argentina (es-AR) solo para la parte entera
  const formatter = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Construye la visualización en base a los estados actuales
  const formatDisplay = (): string => {
    if (!integerPart && !decimalPart && !isEditingDecimals) return "";

    const displayInteger = integerPart
      ? formatter.format(Number(integerPart))
      : "0";
    const displayDecimal = decimalPart.padEnd(2, "0");

    return `${displayInteger},${displayDecimal}`;
  };

  // Efecto para propagar el valor numérico real al padre cada vez que cambien las partes
  useEffect(() => {
    if (onChange) {
      if (!integerPart && !decimalPart) {
        onChange(null);
      } else {
        const fullNumberStr = `${integerPart || "0"}.${decimalPart.padEnd(2, "0")}`;
        onChange(Number(fullNumberStr));
      }
    }
  }, [integerPart, decimalPart, onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const isNumber = /^[0-9]$/.test(e.key);
    const isSeparator = e.key === "." || e.key === ",";
    const isBackspace = e.key === "Backspace";

    // 1. Manejo de entrada de números
    if (isNumber) {
      e.preventDefault();

      if (!isEditingDecimals) {
        // Estamos en la parte entera: acumulamos dígitos normalmente
        setIntegerPart((prev) => (prev === "0" ? e.key : prev + e.key));
      } else {
        // Estamos en los decimales: máximo 2 dígitos
        if (decimalPart.length < 2) {
          setDecimalPart((prev) => prev + e.key);
        }
      }
    }

    // 2. Manejo de punto o coma (Pasar a decimales)
    if (isSeparator) {
      e.preventDefault();
      setIsEditingDecimals(true);

      // Forzar que el cursor se quede al final de la línea visualmente (después del delay de renderizado)
      setTimeout(() => {
        if (inputRef.current) {
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 0);
    }

    // 3. Manejo de Backspace (Borrado inteligente hacia atrás)
    if (isBackspace) {
      e.preventDefault();

      if (isEditingDecimals) {
        if (decimalPart.length > 0) {
          // Borra el último decimal ingresado (ej: "34" -> "3", "3" -> "")
          setDecimalPart((prev) => prev.slice(0, -1));
        } else {
          // Si los decimales ya están en "00" (vacío internamente) y vuelve a apretar Backspace,
          // salta de regreso a editar la parte entera
          setIsEditingDecimals(false);
        }
      } else {
        // Borra el último dígito de la parte entera
        setIntegerPart((prev) => prev.slice(0, -1));
      }
    }
  };

  // Bloqueamos el onChange nativo ya que controlamos todo vía onKeyDown
  // Esto evita desfases visuales o caracteres extraños
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  return (
    <Input
      {...props}
      type="text"
      className="text-right"
      ref={inputRef}
      value={formatDisplay()}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
}
