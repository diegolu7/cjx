import { es } from "./es.ts";
import { en } from "./en.ts";
import type { DictShape } from "./types.ts";

export type Locale = "es" | "en";

export type { DictShape };

export type Dict = typeof es;

const DICTS: Record<Locale, Dict> = { es, en };

/** `html lang` / `hreflang` de cada locale. */
export const HTML_LANG: Record<Locale, string> = { es: "es-AR", en: "en" };

/** `og:locale` de cada locale. */
export const OG_LOCALE: Record<Locale, string> = { es: "es_AR", en: "en_US" };

/** Diccionario del locale pedido (si no existe, cae en español). */
export function getDict(locale?: string | null): Dict {
  return (locale && DICTS[locale as Locale]) || es;
}

/**
 * Busca una clave con notación de punto y reemplaza los `{placeholders}`.
 * Si la clave no existe, devuelve la propia clave (para que se note en QA).
 */
export function t(
  dict: Dict,
  key: string,
  vars?: Record<string, string | number | undefined | null>,
): string {
  const found = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict as unknown);

  if (typeof found !== "string") return key;
  if (!vars) return found;
  return found.replace(/\{(\w+)\}/g, (all, name: string) => {
    const v = vars[name];
    return v === undefined || v === null ? all : String(v);
  });
}

/** Atajo: diccionario + clave en un solo paso (para usar en templates). */
export function tx(
  locale: string | undefined,
  key: string,
  vars?: Record<string, string | number | undefined | null>,
): string {
  return t(getDict(locale), key, vars);
}
