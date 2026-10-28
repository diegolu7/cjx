#!/usr/bin/env node
// Inventario de literales traducibles (Fase 0 del plan i18n) y control de paridad
// (Fase 7): ninguna cadena en español literal fuera de `src/i18n/es.ts`.
//
//   node scripts/i18n-inventory.mjs            # reporte por archivo
//   node scripts/i18n-inventory.mjs --check    # sale con código 1 si hay español suelto
//   node scripts/i18n-inventory.mjs --json     # salida JSON

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const DICT_FILES = new Set([
  join(SRC, "i18n", "es.ts"),
  join(SRC, "i18n", "en.ts"),
]);

/** Palabras que solo existen en español (o que delatan una frase en español). */
const SPANISH_TOKENS = new Set([
  "el", "la", "los", "las", "del", "al", "una", "unos", "unas", "con", "para", "desde",
  "hasta", "contra", "entre", "sobre", "este", "esta", "esto", "ese", "esa", "su", "sus",
  "partido", "partidos", "juega", "jugó", "jugaron", "próximo", "próxima", "próximos",
  "próximas", "resultado", "resultados", "fecha", "fechas", "hora", "horas", "jornada",
  "jornadas", "estadio", "canal", "equipo", "equipos", "visitante", "visitantes",
  "titular", "titulares", "suplente", "suplentes", "banquillo", "formación", "goles",
  "gol", "marcador", "tabla", "posición", "calendario", "agenda", "horarios", "crónica",
  "resumen", "detalle", "detalles", "información", "fuentes", "preguntas", "contacto",
  "términos", "privacidad", "cookies", "aviso", "descripción", "compartir", "copiar",
  "ver", "todos", "siguiente", "anterior", "cargar", "más", "menos", "día", "días",
  "mes", "años", "año", "hora", "ayer", "hoy", "mañana", "tarde", "noche", "mediodía",
  "c обязаatoriedad",
]);

const ACCENTS = /[áéíóúñ¿¡]/i;

/** Archivos que se recorren. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(astro|ts|tsx|js|jsx|mjs)$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * Extrae literales de texto de un archivo.
 * Ignora imports, claves de objeto, clases CSS, URLs y selectores.
 */
function extractLiterals(source) {
  const literals = [];
  const lines = source.split("\n");
  const stripped = lines
    .map((line) => line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, ""))
    .join("\n");

  const re = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const raw = m[1] ?? m[2] ?? m[3] ?? "";
    const line = stripped.slice(0, m.index).split("\n").length;
    if (!/[A-Za-z]/.test(raw)) continue;
    literals.push({ value: raw, line });
    // En los template literals, las partes estáticas entre `${...}` también son texto.
    if (m[3] !== undefined) {
      for (const seg of m[3].split(/\$\{[^}]*\}/)) {
        if (seg.trim() && /[A-Za-z]/.test(seg)) {
          literals.push({ value: seg.trim(), line });
        }
      }
    }
  }
  return literals;
}

/** Frases que son nombres propios y no se traducen. */
const ALLOWED_PHRASES = [
  "Cuando Juega",
  "el Xeneize",
  "Xeneize",
  "Boca Juniors",
  "Club Atlético Boca Juniors",
];

/**
 * Texto visible written directly en el template de un `.astro`
 * (fuera de `{expresiones}` y de las etiquetas HTML).
 */
function extractTemplateText(source) {
  // Sacar el frontmatter.
  const body = source.replace(/^---[\s\S]*?\n---\n/, "");
  // Sacar scripts y estilos inline.
  const clean = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    // Sacar las expresiones `{...}` (con un nivel de anidamiento).
    .replace(/\{(?:[^{}]|\{[^{}]*\})*\}/g, " ")
    // Sacar las etiquetas y sus atributos.
    .replace(/<[^>]*>/g, " ");

  const out = [];
  for (const chunk of clean.split(/\n/)) {
    const text = chunk.replace(/\s+/g, " ").trim();
    if (!text || !/[A-Za-záéíóúñÁÉÍÓÚÑ]/.test(text)) continue;
    out.push(text);
  }
  return out;
}

/** ¿El literal parece estar en español? */
export function looksSpanish(value) {
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^(https?:|mailto:|tel:|data:)/.test(value)) return false;
  if (value.startsWith("/")) return false;
  if (/^[a-z0-9_\-./]+$/i.test(value)) return false; // slugs y rutas (p.ej. "partidos/")
  if (value.includes("<") || value.includes("{") || value.includes("class=")) return false;

  let clean = value;
  for (const phrase of ALLOWED_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    clean = clean.replace(new RegExp(escaped, "gi"), " ");
  }

  const words = clean
    .toLowerCase()
    .replace(/[^a-záéíóúñü\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const hit = words.some((w) => SPANISH_TOKENS.has(w));
  const accented = ACCENTS.test(value) && !/[áéíóúñ]\s*$/.test(value);

  return hit || accented;
}

/** ¿El literal es traducible (tiene frases o palabras sueltas que el usuario ve)? */
function isTranslatable(value) {
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^(https?:|mailto:|tel:|data:)/.test(value)) return false;
  if (/^[\w.-]+\.(astro|ts|tsx|js|mjs|css|png|jpg|svg|webmanifest|xml|json|txt|ico)$/i.test(value)) return false;
  if (/^[a-z0-9_-]+$/i.test(value)) return false; // claves, clases, identificadores
  return /[\sáéíóúñ¿¡]/i.test(value) || value.length > 2;
}

/** Escanea todo `src/` y devuelve el reporte por archivo. */
export function scanInventory() {
  const files = walk(SRC).filter((f) => !DICT_FILES.has(f)).sort();
  const report = [];
  let spanishHits = 0;

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const literals = extractLiterals(source);
    const translatable = literals.filter((l) => isTranslatable(l.value));
    const spanish = translatable.filter((l) => looksSpanish(l.value));
    spanishHits += spanish.length;

    // Texto escrito directo en el template (no pasa por el diccionario).
    if (file.endsWith(".astro")) {
      for (const text of extractTemplateText(source)) {
        if (looksSpanish(text)) {
          spanish.push({ value: text, line: 0 });
          spanishHits++;
        }
      }
    }
    report.push({
      file: relative(ROOT, file),
      total: literals.length,
      translatable: translatable.length,
      spanish,
    });
  }

  return { report, spanishHits };
}

function main() {
  const { report, spanishHits } = scanInventory();

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }

  console.log("Inventario de literales (traducibles) por archivo\n");
  let totalTranslatable = 0;
  for (const r of report) {
    if (!r.translatable) continue;
    totalTranslatable += r.translatable;
    console.log(`  ${r.file.padEnd(52)} ${String(r.translatable).padStart(4)} traducibles`);
  }
  console.log(`\n  Total: ${totalTranslatable} literales traducibles en ${report.length} archivos.`);

  console.log(`\nLiterales en español fuera del diccionario (${spanishHits}):`);
  for (const r of report) {
    for (const s of r.spanish) {
      console.log(`  ${r.file}:${s.line}  ${JSON.stringify(s.value)}`);
    }
  }

  if (process.argv.includes("--check")) {
    process.exit(spanishHits > 0 ? 1 : 0);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
