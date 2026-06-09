import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  href: string;
  icon: LucideIcon;
  size?: number;
  show?: boolean;
};

export function IconButton({
  href,
  icon: Icon,
  size = 18,
  show = true,
}: Props) {
  if (!show) return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow border border-slate-200 hover:bg-slate-50 transition shrink-0"
    >
      <Icon size={size} />
    </Link>
  );
}
