// Snapshot build-time: baja los datos de ESPN (calendario, resultados, estados),
// los normaliza al shape del sitio y escribe src/data/matches.json para que
// Astro los use en build (SSG).
//
// Fuente: ESPN (site.api.espn.com). Boca Juniors = team id 5.
//
// Uso:  node scripts/snapshot.mjs [--dry-run]
// Lo ejecutan los GitHub Actions (deploy y cron) antes del build.

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { LEAGUES, fetchLeagueEvents, fetchSummary, buildMatches } from "./lib/espn.mjs";
import { finalizeMatches } from "./lib/agenda.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../src/data/matches.json");
const DRY_RUN = process.argv.includes("--dry-run");

/** Cuántos partidos finalizados se enriquecen con /summary (lineups, eventos, stats). */
const ENRICH_LIMIT = 3;

const DEMO_MATCHES = [
  {
    id: "demo-1",
    slug: "2026-08-29-lanus",
    date: "2026-08-29",
    homeTeam: "Boca",
    awayTeam: "Lanús",
    homeScore: 1,
    awayScore: 0,
    competition: "Liga Profesional",
    round: "Fecha 7",
    status: "finished",
  },
  {
    id: "demo-2",
    slug: "2026-09-03-racing-club",
    date: "2026-09-03",
    time: "17:00",
    homeTeam: "Racing Club",
    awayTeam: "Boca",
    homeScore: 0,
    awayScore: 2,
    competition: "Liga Profesional",
    round: "Fecha 8",
    status: "finished",
  },
  {
    id: "demo-3",
    slug: "2026-09-08-sao-paulo",
    date: "2026-09-08",
    time: "21:30",
    homeTeam: "Boca",
    awayTeam: "São Paulo",
    competition: "Copa Sudamericana",
    round: "Cuartos de Final - Ida",
    status: "next",
  },
].map((m) => ({ ...m, source: "demo" }));

function yearsToFetch() {
  const year = new Date().getUTCFullYear();
  // El torneo puede arrancar en diciembre y terminar en junio del año siguiente.
  return [year, year + 1];
}

async function collectEvents() {
  const years = yearsToFetch();
  const all = [];
  const report = [];

  for (const league of LEAGUES) {
    try {
      const events = await fetchLeagueEvents(league.slug, years);
      report.push({ league: league.name, eventos: events.length });
      for (const event of events) {
        all.push({ raw: event, league });
      }
    } catch (err) {
      console.warn(`[snapshot] ESPN ${league.slug} falló: ${err.message}`);
      report.push({ league: league.name, eventos: 0, error: err.message });
    }
  }

  return { all, report };
}

/** Enriquece los últimos finalizados con /summary (lineups, eventos, stats). */
async function enrich(matches) {
  const targets = matches
    .filter((m) => m.status === "finished" && m.espnId)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, ENRICH_LIMIT);

  for (const match of targets) {
    const league = LEAGUES.find((l) => l.slug === match.sourceLeague);
    if (!league) continue;
    try {
      const details = await fetchSummary(league.slug, match.espnId);
      if (details) match.details = { ...(match.details ?? {}), ...details };
    } catch (err) {
      console.warn(`[snapshot] summary ${match.espnId} falló: ${err.message}`);
    }
  }

  return matches;
}

async function main() {
  const { all, report } = await collectEvents();

  console.log("[snapshot] cobertura ESPN:");
  for (const r of report) {
    console.log(`  - ${r.league}: ${r.eventos} partidos${r.error ? ` (error: ${r.error})` : ""}`);
  }

  let matches = [];
  let source = "espn";
  if (all.length > 0) {
    matches = buildMatches(all.map((e) => ({ ...e, leagueDef: e.league })));
  }

  if (matches.length === 0) {
    if (existsSync(OUT_FILE)) {
      console.warn("[snapshot] sin datos de ESPN; se conserva el snapshot existente.");
      return;
    }
    console.warn("[snapshot] sin datos de ESPN y sin snapshot previo; se usa DEMO.");
    matches = DEMO_MATCHES;
    source = "demo";
  }

  matches = await enrich(matches);
  const finalized = finalizeMatches(matches);

  const payload = {
    updatedAt: new Date().toISOString(),
    source,
    matches: finalized,
  };

  console.log(
    `[snapshot] ${finalized.length} partidos (${finalized.filter((m) => m.status === "finished").length} finalizados, ` +
      `${finalized.filter((m) => m.status === "next").length} próximo, ` +
      `${finalized.filter((m) => m.status === "live").length} en vivo, ` +
      `${finalized.filter((m) => m.status === "scheduled").length} programados)`,
  );

  for (const m of finalized) {
    console.log(
      `  ${m.date} ${m.time ?? "??:??"} | ${m.homeTeam} ${m.homeScore ?? "-"} - ${m.awayScore ?? "-"} ${m.awayTeam}` +
        ` | ${m.competition}${m.round ? ` · ${m.round}` : ""} | ${m.status}`,
    );
  }

  if (DRY_RUN) {
    console.log("[snapshot] --dry-run: no se escribe el archivo.");
    return;
  }

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

main().catch((err) => {
  console.error("[snapshot] error:", err);
  process.exit(1);
});
