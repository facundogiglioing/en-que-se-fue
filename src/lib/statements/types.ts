import type { ParsedStatement } from "@/types";

export interface StatementParser {
  bankId: string;
  bankLabel: string;
  // Determina si este parser sabe interpretar el texto extraído del PDF.
  matches(text: string): boolean;
  parse(text: string): ParsedStatement;
}
