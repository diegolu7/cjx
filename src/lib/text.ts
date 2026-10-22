/**
 * Convierte un texto con marcado simple en partes renderizables:
 * - `**negrita**` → `<strong>`
 * - `[texto](url)` → `<a>`
 *
 * Se usa en los bloques de las páginas legales y en las FAQ, que viven en el
 * diccionario y necesitan poder incluir enlaces.
 */
export interface InlinePart {
  type: "text" | "strong" | "link";
  text: string;
  href?: string;
}

const RE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    const at = m.index ?? 0;
    if (at > last) parts.push({ type: "text", text: text.slice(last, at) });
    if (m[1] !== undefined) {
      parts.push({ type: "strong", text: m[1] });
    } else {
      parts.push({ type: "link", text: m[2], href: m[3] });
    }
    last = at + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}
