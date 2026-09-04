import { extractText, getDocumentProxy } from "unpdf";

// Extrae todo el texto de un PDF (páginas concatenadas) para su posterior análisis.
export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}
