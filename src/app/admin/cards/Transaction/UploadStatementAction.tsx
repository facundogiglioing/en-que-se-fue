"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { analyzeStatement } from "@/actions/statement";
import { Button } from "@/components/base/Button";
import { Sheet } from "@/components/Sheet";
import type { ParsedStatement } from "@/types";
import { StatementDropzone } from "./StatementDropzone";
import { StatementMovementsGrid } from "./StatementMovementsGrid";
import { StatementSummaryHeader } from "./StatementSummaryHeader";

export default function UploadStatementAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedStatement | null>(null);

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parsed = await analyzeStatement(formData);
      setResult(parsed);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al analizar el resumen.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setIsOpen(true)}>
        <Upload size={12} />
      </Button>

      {isOpen && (
        <Sheet
          side="center"
          title="Importar resumen de tarjeta"
          description={
            result
              ? undefined
              : "Subí el PDF del resumen para identificar los movimientos automáticamente."
          }
          onClose={handleClose}
        >
          {result ? (
            <div className="-mx-6 flex h-full min-h-0 flex-col overflow-hidden">
              <StatementSummaryHeader
                summary={result.summary}
                onReset={reset}
              />
              <StatementMovementsGrid movements={result.movements} />
            </div>
          ) : (
            <StatementDropzone
              onFileSelected={handleFileSelected}
              isLoading={isAnalyzing}
              error={error}
            />
          )}
        </Sheet>
      )}
    </>
  );
}
