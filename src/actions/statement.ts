"use server";

import { extractPdfText } from "@/lib/pdf";
import { parseStatementText } from "@/lib/statements";
import type { ParsedStatement } from "@/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // "%PDF"

function hasPdfSignature(buffer: ArrayBuffer): boolean {
  const header = new Uint8Array(buffer.slice(0, PDF_MAGIC_BYTES.length));
  return PDF_MAGIC_BYTES.every((byte, index) => header[index] === byte);
}

export async function analyzeStatement(
  formData: FormData,
): Promise<ParsedStatement> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No se recibió ningún archivo.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo es demasiado grande (máx. 15MB).");
  }

  const buffer = await file.arrayBuffer();

  if (!hasPdfSignature(buffer)) {
    throw new Error("El archivo no es un PDF válido.");
  }

  const text = await extractPdfText(buffer);
  if (!text.trim()) {
    throw new Error("No pudimos leer el contenido del PDF.");
  }

  return parseStatementText(text);
}
