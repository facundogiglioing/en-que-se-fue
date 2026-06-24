import { Plus } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export function CategoryIcon({ category }: { category: string }) {
  const categoryData = CATEGORIES.find((c) => c.name === category);
  if (!categoryData) return null;

  const Icon = categoryData.icon;

  return <Icon size={18} />;
}
