import { Trash2 } from "lucide-react";

export function DeleteButton({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <button
      type="submit"
      className="p-2 text-slate-300 hover:text-red-500 transition cursor-pointer"
    >
      <Trash2 size={size} />
    </button>
  );
}
