import { Edit3 } from "lucide-react";
import Link from "next/link";

export function EditButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="p-2 text-slate-300 hover:text-blue-600 transition"
    >
      <Edit3 size={18} />
    </Link>
  );
}
