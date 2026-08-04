import { Plus } from "lucide-react";
import type { MouseEventHandler } from "react";
import { Button } from "./Button";

type Props = {
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function AddButton({ href, onClick }: Props) {
  return (
    <Button href={href} onClick={onClick} variant="success">
      <Plus size={18} />
    </Button>
  );
}
