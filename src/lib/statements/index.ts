import type { ParsedStatement } from "@/types";
import { galiciaVisaParser } from "./galicia";
import type { StatementParser } from "./types";

// Agregar acá el parser de cada nuevo banco soportado.
const parsers: StatementParser[] = [galiciaVisaParser];

export function parseStatementText(text: string): ParsedStatement {
  const parser = parsers.find((p) => p.matches(text));

  if (!parser) {
    throw new Error(
      "No pudimos identificar el banco de este resumen. Todavía no soportamos este formato.",
    );
  }

  return parser.parse(text);
}

export type { StatementParser };
