import { CATEGORIES } from "@/lib/constants";

type CategoryIconProps = {
  category: string;
  size: number;
};

export function CategoryIcon({ category, size = 18 }: CategoryIconProps) {
  const categoryData = CATEGORIES.find((c) => c.name === category);
  if (!categoryData) return null;

  const Icon = categoryData.icon;

  return <Icon size={size} />;
}
