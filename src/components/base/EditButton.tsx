import { Edit3 } from "lucide-react";
import type { MouseEventHandler } from "react";
import { Button } from "./Button";

type Props = {
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function EditButton({ href, onClick }: Props) {
  return (
    <Button href={href} onClick={onClick} variant="primary">
      <Edit3 size={18} />
    </Button>
  );
}
