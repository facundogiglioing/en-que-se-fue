"use client";

import { FileText, Loader2, UploadCloud } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

type Props = {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
};

export function StatementDropzone({ onFileSelected, isLoading, error }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFileSelected(file);
  };

  const openFileDialog = () => {
    if (!isLoading) inputRef.current?.click();
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10">
      <div
        role="button"
        tabIndex={0}
        onClick={openFileDialog}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFileDialog();
          }
        }}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          if (!isLoading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragging(false);
          if (!isLoading) handleFiles(event.dataTransfer.files);
        }}
        className={`flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-12 text-center transition ${
          isDragging
            ? "border-primary-text bg-primary/40"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        } ${isLoading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
      >
        {isLoading ? (
          <Loader2 size={32} className="animate-spin text-slate-400" />
        ) : (
          <UploadCloud size={32} className="text-slate-400" />
        )}

        <div>
          <p className="text-sm font-bold text-slate-700">
            {isLoading
              ? "Analizando resumen..."
              : "Arrastrá el PDF acá o hacé clic para seleccionarlo"}
          </p>
          <p className="mt-1 text-xxs text-slate-400">
            Resumen de tarjeta de crédito en formato PDF
          </p>
        </div>

        {fileName && !isLoading && (
          <p className="flex items-center gap-1.5 text-xxs font-medium text-slate-500">
            <FileText size={14} />
            {fileName}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        disabled={isLoading}
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {error && (
        <p className="max-w-md text-center text-xxs font-semibold text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}
