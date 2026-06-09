import {
  Car,
  GraduationCap,
  HeartPulse,
  type LucideIcon,
  Package,
  ShoppingCart,
  Tv,
  Utensils,
  Zap,
} from "lucide-react";
import type { CategoryName } from "@/types";

export const CATEGORIES: {
  name: CategoryName;
  icon: LucideIcon;
  description: string;
}[] = [
    {
      name: "Servicios",
      icon: Zap,
      description: "Luz, agua, gas, internet y expensas.",
    },
    {
      name: "Entretenimiento",
      icon: Tv,
      description: "Netflix, Spotify, cine y juegos.",
    },
    {
      name: "Salidas",
      icon: Utensils,
      description: "Restaurantes, bares y café.",
    },
    {
      name: "Supermercado",
      icon: ShoppingCart,
      description: "Comida, limpieza y artículos del hogar.",
    },
    {
      name: "Transporte",
      icon: Car,
      description: "Nafta, seguro, patente o transporte público.",
    },
    {
      name: "Salud",
      icon: HeartPulse,
      description: "Prepaga, farmacia y consultas médicas.",
    },
    {
      name: "Educación",
      icon: GraduationCap,
      description: "Cuotas, cursos y materiales de estudio.",
    },
    {
      name: "Otros",
      icon: Package,
      description: "Gastos eventuales que no entran en el resto.",
    },
  ];
