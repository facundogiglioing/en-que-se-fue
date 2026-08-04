import { Edit3 } from "lucide-react";
import { Button } from "./Button";

export function EditButton({ href }: { href: string }) {
  return (
    <Button
      href={href}
      variant="primary">
      <Edit3 size={18} />
    </Button>
  );
}
