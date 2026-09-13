"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { analyzeStatement, applyStatement } from "@/actions/statement";
import { Button } from "@/components/base/Button";
import { Sheet } from "@/components/Sheet";
import type { StatementAnalysis } from "@/types";
import { StatementDropzone } from "./StatementDropzone";
import { StatementMovementsGrid } from "./StatementMovementsGrid";
import { StatementSummaryHeader } from "./StatementSummaryHeader";

type Props = {
  cardId: string;
};

type SaveSummary = { createdCount: number; datesUpdated: boolean };

export default function UploadStatementAction({ cardId }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatementAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSummary, setSaveSummary] = useState<SaveSummary | null>(null);
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(new Set());

  const reset = () => {
    setResult(null);
    setError(null);
    setSaveError(null);
    setSaveSummary(null);
    setExcludedIndices(new Set());
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
      formData.append("cardId", cardId);
      const analysis = await analyzeStatement(formData);
      setResult(analysis);
      setExcludedIndices(new Set());
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

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.append("cardId", cardId);
      const statementToSave = {
        ...result.statement,
        movements: result.statement.movements.filter(
          (_, index) => !excludedIndices.has(index),
        ),
      };
      formData.append("statement", JSON.stringify(statementToSave));
      const summary = await applyStatement(formData);
      setSaveSummary(summary);
      router.refresh();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar los cambios.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasPendingChanges =
    !!result &&
    (result.diff.isCurrentCycle ||
      result.diff.movements.some(
        (movement, index) =>
          !movement.exists &&
          !excludedIndices.has(index) &&
          movement.amountArs !== undefined,
      ));

  const handleToggleExclude = (index: number) => {
    setExcludedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
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
                summary={result.statement.summary}
                isCurrentCycle={result.diff.isCurrentCycle}
              />
              <StatementMovementsGrid
                movements={result.diff.movements}
                expectedTotal={result.statement.summary.totalAmount}
                excludedIndices={excludedIndices}
                onToggleExclude={handleToggleExclude}
              />
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-500">
                  {saveSummary ? (
                    <span className="font-semibold text-success-text">
                      {saveSummary.createdCount} movimiento(s) creado(s)
                      {saveSummary.datesUpdated
                        ? " · Fechas de cierre/vencimiento actualizadas"
                        : ""}
                    </span>
                  ) : saveError ? (
                    <span className="font-semibold text-danger-text">
                      {saveError}
                    </span>
                  ) : hasPendingChanges ? (
                    "Se van a crear los movimientos nuevos y actualizar la fecha de cierre y vencimiento."
                  ) : (
                    "No hay cambios para guardar."
                  )}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition whitespace-nowrap"
                  >
                    Cargar otro
                  </button>

                  {saveSummary ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleClose}
                    >
                      Listo
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="success"
                      disabled={!hasPendingChanges || isSaving}
                      onClick={handleSave}
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                  )}
                </div>
              </div>
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
