import { shiftIndex } from "@/app/admin/cards/utils";

export function resolvePeriodIndex(
  rawSelectedIndex: unknown,
  paysInArrears: boolean,
): number {
  if (
    typeof rawSelectedIndex !== "string" ||
    !/^[1-9]\d{3}(0[1-9]|1[0-2])$/.test(rawSelectedIndex)
  ) {
    throw new Error("El mes seleccionado es inválido.");
  }

  const selectedIndex = Number(rawSelectedIndex);
  // La vista a mes vencido muestra los consumos del mes anterior.
  return paysInArrears ? shiftIndex(selectedIndex, -1) : selectedIndex;
}
