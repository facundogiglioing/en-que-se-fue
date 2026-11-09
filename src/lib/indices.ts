import "server-only";

// Índices externos: UVA (BCRA vía argentinadatos) y dólar oficial (dolarapi).
// El UVA se publica con unos días de anticipación, por eso se indexa por fecha
// y se busca con la fecha de vencimiento de cada cuota.

const UVA_URL = "https://api.argentinadatos.com/v1/finanzas/indices/uva";
const DOLAR_URL = "https://dolarapi.com/v1/dolares/oficial";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

export interface UvaIndex {
  byDate: Map<string, number>;
  latestDate: string;
  latestValue: number;
}

interface CacheEntry<T> {
  at: number;
  value: T;
}

let uvaCache: CacheEntry<UvaIndex> | null = null;
let dolarCache: CacheEntry<number> | null = null;

export async function getUvaIndex(): Promise<UvaIndex | null> {
  if (uvaCache && Date.now() - uvaCache.at < CACHE_TTL_MS) {
    return uvaCache.value;
  }
  try {
    const response = await fetch(UVA_URL);
    if (!response.ok) throw new Error(`UVA API respondió ${response.status}`);
    const rows = (await response.json()) as { fecha: string; valor: number }[];
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("UVA API devolvió una respuesta vacía");
    }
    const byDate = new Map(rows.map((row) => [row.fecha, row.valor]));
    const last = rows[rows.length - 1];
    const value: UvaIndex = {
      byDate,
      latestDate: last.fecha,
      latestValue: last.valor,
    };
    uvaCache = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("No se pudo obtener el índice UVA:", error);
    return uvaCache?.value ?? null;
  }
}

/** Dólar oficial (venta). Devuelve null si la API no responde. */
export async function getOficialExchangeRate(): Promise<number | null> {
  if (dolarCache && Date.now() - dolarCache.at < CACHE_TTL_MS) {
    return dolarCache.value;
  }
  try {
    const response = await fetch(DOLAR_URL);
    if (!response.ok) throw new Error(`Dólar API respondió ${response.status}`);
    const data = (await response.json()) as { venta?: number };
    if (typeof data.venta !== "number") {
      throw new Error("Dólar API no devolvió el valor de venta");
    }
    dolarCache = { at: Date.now(), value: data.venta };
    return data.venta;
  } catch (error) {
    console.error("No se pudo obtener el dólar oficial:", error);
    return dolarCache?.value ?? null;
  }
}
