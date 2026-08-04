import { Trash2 } from "lucide-react";
import type { MouseEventHandler } from "react";
import { Button } from "./Button";

type Props = {
  size?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function DeleteButton({ size = 18, onClick }: Props) {
  return (
    <Button onClick={onClick} variant="danger">
      <Trash2 size={size} />
    </Button>
  );
}
