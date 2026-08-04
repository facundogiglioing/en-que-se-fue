import { Plus } from "lucide-react";
import { Button } from "./Button";

export function AddButton({ href }: { href: string }) {
  return (
    <Button
      href={href}
      variant="success">
      <Plus size={18} />
    </Button>
  );
}
