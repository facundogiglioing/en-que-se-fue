"use client";

import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteLastStatementImport,
  getLastStatementImport,
} from "@/actions/statement";
import { Button } from "@/components/base/Button";

type Props = {
  cardId: string;
};

export default function DeleteLastStatementAction({ cardId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = async () => {
    setIsDeleting(true);
    try {
      const lastImport = await getLastStatementImport(cardId);
      if (!lastImport) {
        window.alert("No hay resúmenes importados para esta tarjeta.");
        return;
      }

      const importedAt = new Date(lastImport.importedAt).toLocaleString(
        "es-AR",
        { dateStyle: "short", timeStyle: "short" },
      );
      const confirmed = window.confirm(
        `¿Borrar el último resumen cargado (${importedAt})? Se van a eliminar ${lastImport.count} movimiento(s).`,
      );
      if (!confirmed) return;

      await deleteLastStatementImport(cardId);
      router.refresh();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al borrar el resumen.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="danger"
      disabled={isDeleting || !cardId || cardId === "0"}
      onClick={handleClick}
    >
      <Undo2 size={12} />
    </Button>
  );
}
