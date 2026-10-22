/** Prefijo de la versión en inglés. */
export const EN_PREFIX = "/en";

function normalize(pathname: string): string {
  const p = pathname || "/";
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

/** Path de la versión en español (quita el prefijo `/en`). */
export function esPath(pathname: string): string {
  const p = normalize(pathname);
  if (p === EN_PREFIX) return "/";
  if (p.startsWith(`${EN_PREFIX}/`)) return p.slice(EN_PREFIX.length) || "/";
  return p || "/";
}

/** Path de la versión en inglés (agrega el prefijo `/en`). */
export function enPath(pathname: string): string {
  const p = normalize(pathname);
  if (p === EN_PREFIX) return EN_PREFIX;
  if (p.startsWith(`${EN_PREFIX}/`)) return p;
  return `${EN_PREFIX}${p}`;
}

/** Path con "/" final (convención del sitio). */
export function withSlash(path: string): string {
  if (!path) return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

/** Path de la versión en español con "/" final. */
export function esPathWithSlash(pathname: string): string {
  return withSlash(esPath(pathname));
}

/** Path de la versión en inglés con "/" final. */
export function enPathWithSlash(pathname: string): string {
  return withSlash(enPath(pathname));
}

/**
 * Prefijo de las URLs internas según el locale: "" en español, "/en" en inglés.
 * Se usa así: `href={`${localeBase(locale)}${base}info`}`.
 */
export function localeBase(locale: string): string {
  return locale === "en" ? EN_PREFIX : "";
}
