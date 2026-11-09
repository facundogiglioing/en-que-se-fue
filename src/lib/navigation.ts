export const NAV_ITEMS = [
  { href: "/", label: "Inicio", title: "Tablero de pagos", icon: "home" },
  {
    href: "/admin/income",
    label: "Ingresos",
    title: "Ingresos",
    icon: "income",
  },
  {
    href: "/admin/cards",
    label: "Tarjetas",
    title: "Tarjetas de crédito",
    icon: "cards",
  },
  {
    href: "/admin/expenses",
    label: "Gastos fijos",
    title: "Gastos fijos",
    icon: "expenses",
  },
] as const;

export function getPageTitle(pathname: string): string {
  if (pathname === "/sin-acceso") return "Sin acceso";
  return (
    NAV_ITEMS.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
    )?.title ?? "Home Expenses"
  );
}

export function getUserInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}
