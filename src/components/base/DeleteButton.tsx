import { Trash2 } from "lucide-react";
import { Button } from "./Button";

export function DeleteButton({ size = 18 }: { size?: number }) {
  return (
    <Button type="submit" variant="danger">
      <Trash2 size={size} />
    </Button>
  );
}