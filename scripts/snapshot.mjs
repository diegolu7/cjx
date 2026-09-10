// Snapshot build-time: baja el Google Sheet publicado (CSV), lo parsea y
// escribe src/data/matches.json para que Astro lo use en build (SSG).
//
// Uso:  node scripts/snapshot.mjs
// Lo ejecutan los GitHub Actions (deploy y cron cada 15 min) antes del build.

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseMatches,
  DEMO_MATCHES,
  SHEET_CSV_URL,
  SHEET_CSV_URL_ALIAS,
} from "./lib/parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../src/data/matches.json");

async function fetchCSV(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "cjx-snapshot/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function getCSV() {
  // 1º export (más estable), 2º gviz.
  for (const url of [SHEET_CSV_URL_ALIAS, SHEET_CSV_URL]) {
    try {
      const text = await fetchCSV(url);
      if (text && text.trim()) return text;
    } catch (err) {
      console.warn(`[snapshot] fallo ${url}: ${err.message}`);
    }
  }
  return null;
}

async function main() {
  const csv = await getCSV();
  let matches = null;

  if (csv) {
    matches = parseMatches(csv);
  }

  if (!matches || matches.length === 0) {
    // Si falla la red o la hoja está vacía, conservamos el snapshot anterior.
    if (existsSync(OUT_FILE)) {
      console.warn("[snapshot] sin datos nuevos; se conserva el snapshot existente.");
      return;
    }
    console.warn("[snapshot] sin datos y sin snapshot previo; se usa DEMO.");
    matches = DEMO_MATCHES;
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    matches,
  };

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`[snapshot] ${matches.length} partidos → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("[snapshot] error:", err);
  process.exit(1);
});
