// Cliente de ESPN: calendario, resultados, estados y stats de Boca Juniors.
//
// Fuente: site.api.espn.com (API pública del sitio de ESPN). Boca Juniors = team id 5.
//
// Endpoints usados:
//   GET {BASE}/{league}/scoreboard?dates={yyyy}&limit=600   → todos los partidos de la
//        temporada (incluye los futuros). Es la única fuente que trae fixtures futuros.
//   GET {BASE}/{league}/teams/5/schedule                     → respaldo: fase exacta y control
//        de cobertura (la API de schedule no trae partidos futuros).
//   GET {BASE}/{league}/summary?event={id}                  → alineaciones, eventos y stats.
//
// Todo se normaliza al shape `Match` que usa el sitio (ver src/types/match.ts).

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const CACHE_DIR = resolve(ROOT, ".cache/espn");

export const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";
export const BOCA_TEAM_ID = "5";
export const CACHE_TTL_MS = 20 * 60 * 1000;
/** UA simple: los UA con paréntesis/URL son bloqueados por el filtro de Akamai. */
export const USER_AGENT = "cjx-snapshot/1.0";

/** Competiciones donde Boca juega. `slug` es el identificador de ESPN. */
export const LEAGUES = [
  { slug: "arg.1", name: "Liga Profesional", twoLegs: false },
  { slug: "arg.copa", name: "Copa Argentina", twoLegs: false },
  { slug: "conmebol.libertadores", name: "Copa Libertadores", twoLegs: true },
  { slug: "conmebol.sudamericana", name: "Copa Sudamericana", twoLegs: true },
];

const TEAM_ALIASES = {
  "Boca Juniors": "Boca",
  "Unión (Santa Fe)": "Unión de Santa Fe",
  "Central Córdoba (Santiago del Estero)": "Central Córdoba",
  "Estudiantes de La Plata": "Estudiantes",
  "TBD Home": "Por definir",
  "TBD Away": "Por definir",
};

const VENUE_ALIASES = {
  "Alberto José Armando (La Bombonera)": "La Bombonera",
  "Monumental Presidente Perón": "Estadio Monumental de Alta Córdoba",
  "Gigante de Arroyito": "Estadio Gigante de Arroyito",
  "Presidente Perón (Cilindro de Avellaneda)": "Estadio Presidente Perón",
};

const PHASE_LABELS = {
  "torneo-apertura": "Torneo Apertura",
  "torneo-clausura": "Torneo Clausura",
  "group-stage": "Fase de Grupos",
  "knockout-round-playoffs": "Playoffs",
  "round-of-64": "64avos de Final",
  "round-of-32": "32avos de Final",
  "round-of-16": "Octavos de Final",
  "quarterfinals": "Cuartos de Final",
  "semifinals": "Semifinales",
  "final": "Final",
  "apertura---round-of-16": "Playoffs · Ronda de 16",
};

const DIAS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

/** Argentina no aplica horario de verano desde 2009: UTC-3 todo el año. */
export const ART_OFFSET_MINUTES = -180;

// ---------------------------------------------------------------------------
// HTTP + caché en disco
// ---------------------------------------------------------------------------

async function httpGetJSON(url, { timeoutMs = 8000, retries = 3 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": USER_AGENT, accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw new Error(`ESPN ${url}: ${lastError?.message ?? "error"}`);
}

function cacheKey(url) {
  return createHash("sha1").update(url).digest("hex").slice(0, 16);
}

/** GET con caché en disco (TTL 10 min). Si falla la red, devuelve la copia vieja. */
export async function cachedJSON(url, { ttlMs = CACHE_TTL_MS, timeoutMs, retries } = {}) {
  const file = resolve(CACHE_DIR, `${cacheKey(url)}.json`);
  let cached = null;
  try {
    const raw = await readFile(file, "utf8");
    cached = JSON.parse(raw);
  } catch {
    cached = null;
  }

  if (cached && Date.now() - cached.at < ttlMs) return cached.body;

  try {
    const body = await httpGetJSON(url, { timeoutMs, retries });
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, JSON.stringify({ at: Date.now(), body }), "utf8");
    return body;
  } catch (err) {
    if (cached) {
      console.warn(`[espn] red caída, uso caché vieja: ${url} (${err.message})`);
      return cached.body;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Descarga
// ---------------------------------------------------------------------------

function scoreboardURL(league, year) {
  return `${ESPN_BASE}/${league}/scoreboard?dates=${year}&limit=600`;
}

function scheduleURL(league) {
  return `${ESPN_BASE}/${league}/teams/${BOCA_TEAM_ID}/schedule`;
}

/** Eventos de Boca en una liga/temporada. Usa scoreboard (trae futuros). */
export async function fetchLeagueEvents(league, years) {
  const events = [];
  for (const year of years) {
    const body = await cachedJSON(scoreboardURL(league, year));
    for (const ev of body?.events ?? []) {
      if (isBocaEvent(ev)) events.push(ev);
    }
  }
  return events;
}

/** Respaldo: si el scoreboard no trae nada de una liga, se usa el schedule del equipo. */
export async function fetchTeamSchedule(league) {
  const body = await cachedJSON(scheduleURL(league));
  return (body?.events ?? []).filter(isBocaEvent);
}

export function isBocaEvent(event) {
  const comps = event?.competitions?.[0]?.competitors ?? [];
  return comps.some((c) => String(c?.team?.id) === BOCA_TEAM_ID);
}

// ---------------------------------------------------------------------------
// Helpers de normalización
// ---------------------------------------------------------------------------

/** Fecha/hora en hora Argentina (UTC-3) a partir de un ISO UTC de ESPN. */
export function artDateTime(isoUtc) {
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) return null;
  const art = new Date(d.getTime() + ART_OFFSET_MINUTES * 60000);
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${art.getUTCFullYear()}-${pad(art.getUTCMonth() + 1)}-${pad(art.getUTCDate())}`;
  const time = `${pad(art.getUTCHours())}:${pad(art.getUTCMinutes())}`;
  return {
    date,
    time,
    dayLabel: DIAS[art.getUTCDay()],
    kickoff: new Date(`${date}T${time}:00-03:00`).getTime(),
  };
}

/** "Unión (Santa Fe)" → "Unión de Santa Fe"; "Por definir" para los TBD. */
export function canonicalTeamName(name) {
  const clean = String(name ?? "").trim();
  if (!clean) return "Por definir";
  if (/^TBD/i.test(clean)) return "Por definir";
  return TEAM_ALIASES[clean] ?? clean;
}

/**
 * Quita el paréntesis desambiguador de ESPN: "Gimnasia y Esgrima (Jujuy)" →
 * "Gimnasia y Esgrima". Solo se usa si el nombre corto no choca con otro club.
 */
export function shortCandidate(name) {
  const m = /^(.+?)\s*\(([^)]+)\)$/.exec(String(name ?? "").trim());
  if (!m) return String(name ?? "").trim();
  const base = m[1].trim();
  return base.length >= 4 ? base : String(name ?? "").trim();
}

/** Nombre de estadio usable (los de ESPN vienen con nombres largos o sin prefijo). */
export function canonicalVenueName(fullName) {
  const clean = String(fullName ?? "").trim();
  if (!clean) return undefined;
  if (VENUE_ALIASES[clean]) return VENUE_ALIASES[clean];
  if (/^Estádio/i.test(clean) || /^Estadio/i.test(clean)) return clean;
  return `Estadio ${clean}`;
}

export function teamLogo(teamId) {
  if (!teamId) return undefined;
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`;
}

function scoreOf(competitor) {
  const s = competitor?.score;
  if (typeof s === "number") return s;
  if (typeof s?.value === "number") return s.value;
  if (typeof s?.displayValue === "string" && /^\d+$/.test(s.displayValue)) return Number(s.displayValue);
  // El scoreboard devuelve el marcador como string ("1").
  if (typeof s === "string" && /^\d+$/.test(s)) return Number(s);
  return undefined;
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Slug estable: `{fecha}-{rival}` (mismo criterio que usa el sitio). */
export function matchSlug(date, homeTeam, awayTeam) {
  const rival = homeTeam === "Boca" ? awayTeam : homeTeam;
  return `${date}-${slugify(rival)}`;
}

function stateOf(event) {
  const status = event?.competitions?.[0]?.status ?? event?.status ?? {};
  const type = status?.type ?? {};
  const state = String(type.state ?? "");
  if (state === "post" || type.completed === true) return "finished";
  if (state === "in") return "live";
  if (state === "pre") return "scheduled";
  return "scheduled";
}

// ---------------------------------------------------------------------------
// Normalización de eventos → Match
// ---------------------------------------------------------------------------

/** Evento crudo de ESPN → objeto normalizado (sin round/aggregate). */
export function normalizeEvent(event, league) {
  const competition = event?.competitions?.[0];
  if (!competition) return null;

  const competitors = competition.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const when = artDateTime(competition.date ?? event.date);
  if (!when) return null;

  const bocaIsHome = String(home?.team?.id) === BOCA_TEAM_ID;
  const rival = canonicalTeamName(bocaIsHome ? away?.team?.displayName : home?.team?.displayName);

  const status = stateOf(event);
  const homeScore = scoreOf(home);
  const awayScore = scoreOf(away);
  const hasScore = status !== "scheduled" && homeScore !== undefined && awayScore !== undefined;

  return {
    id: `espn-${event.id}`,
    espnId: String(event.id),
    source: "espn",
    league: league.slug,
    leagueName: league.name,
    twoLegs: league.twoLegs,
    phaseSlug: event?.season?.slug ?? null,
    seasonYear: event?.season?.year ?? null,
    date: when.date,
    time: when.time,
    dayLabel: when.dayLabel,
    kickoff: when.kickoff,
    homeTeam: bocaIsHome ? "Boca" : rival,
    awayTeam: bocaIsHome ? rival : "Boca",
    homeScore: hasScore ? homeScore : undefined,
    awayScore: hasScore ? awayScore : undefined,
    homeLogo: teamLogo(home?.team?.id),
    awayLogo: teamLogo(away?.team?.id),
    rival,
    rivalFull: bocaIsHome ? away?.team?.displayName : home?.team?.displayName,
    venue: canonicalVenueName(competition.venue?.fullName),
    venueCity: competition.venue?.address?.city ?? undefined,
    status,
  };
}

/**
 * Normaliza todos los eventos y resuelve:
 *   - "Fecha N" de la Liga Profesional (índice del partido de Boca en el torneo).
 *   - Ida / Vuelta y global (aggregate) para las Copa de ida y vuelta.
 */
export function buildMatches(rawEvents) {
  const normalized = rawEvents
    .map((e) => normalizeEvent(e.raw ?? e, e.leagueDef ?? { slug: e.league, name: e.leagueName, twoLegs: false }))
    .filter(Boolean);

  normalized.sort((a, b) => a.kickoff - b.kickoff);

  // Nombres cortos: se saca el paréntesis desambiguador de ESPN
  // ("Gimnasia y Esgrima (Jujuy)" → "Gimnasia y Esgrima"), salvo que el nombre
  // corto quede ambiguo con otro club del mismo snapshot (mismo nombre o uno
  // contenido en el nombre del otro: "Gimnasia" vs "Gimnasia La Plata").
  const rivals = [...new Set(normalized.map((m) => m.rival).filter(Boolean))];
  for (const m of normalized) {
    if (!m.rivalFull) continue;
    const short = shortCandidate(m.rival);
    const shortKey = short.toLowerCase();
    const ambiguous = rivals.some((other) => {
      if (other === m.rival) return false;
      const otherKey = other.toLowerCase();
      const otherShort = shortCandidate(other).toLowerCase();
      return shortKey === otherKey || shortKey === otherShort || otherKey.includes(shortKey);
    });
    m.rivalShort = ambiguous ? m.rival : short;
  }

  // "Fecha N" de la Liga: el índice del partido de Boca dentro de su torneo.
  // (Cada equipo juega una vez por fecha, así que el n-ésimo partido de Boca es la Fecha N.)
  const ligaCounter = new Map();
  for (const m of normalized) {
    if (m.league !== "arg.1") continue;
    if (!String(m.phaseSlug ?? "").startsWith("torneo-")) continue;
    const key = m.phaseSlug;
    const n = (ligaCounter.get(key) ?? 0) + 1;
    ligaCounter.set(key, n);
    m.fecha = n;
  }

  // Ida / Vuelta + global para las copas de ida y vuelta.
  const ties = new Map();
  for (const m of normalized) {
    if (!m.twoLegs) continue;
    const key = `${m.league}|${m.rival}|${m.phaseSlug ?? ""}`;
    if (!ties.has(key)) ties.set(key, []);
    ties.get(key).push(m);
  }
  for (const legs of ties.values()) {
    if (legs.length < 2) continue;
    const ordered = legs.slice().sort((a, b) => a.kickoff - b.kickoff);
    ordered.forEach((leg, i) => {
      leg.legLabel = i === 0 ? "Ida" : "Vuelta";
      leg.leg = i === 0 ? "first" : "second";
      leg.legIndex = i;
      leg.legCount = ordered.length;
    });
    const last = ordered[ordered.length - 1];
    const bocaGoals = ordered.reduce((acc, leg) => {
      const b = leg.homeTeam === "Boca" ? leg.homeScore : leg.awayScore;
      const r = leg.homeTeam === "Boca" ? leg.awayScore : leg.homeScore;
      return b === undefined || r === undefined
        ? acc
        : { bocaScore: acc.bocaScore + b, rivalScore: acc.rivalScore + r };
    }, { bocaScore: 0, rivalScore: 0 });
    if (last.homeScore !== undefined && last.awayScore !== undefined) {
      last.aggregate = bocaGoals;
    }
  }

  return normalized.map((m) => toMatch(m));
}

/** Objeto normalizado interno → `Match` del sitio. */
function toMatch(m) {
  const phase = PHASE_LABELS[m.phaseSlug] ?? null;
  const isLigaTorneo = m.league === "arg.1" && String(m.phaseSlug ?? "").startsWith("torneo-");
  const round = isLigaTorneo
    ? `Fecha ${m.fecha ?? "?"}`
    : [phase, m.legLabel].filter(Boolean).join(" - ");

  const rivalName = m.rivalShort ?? m.rival;
  const homeTeam = m.homeTeam === "Boca" ? "Boca" : rivalName;
  const awayTeam = m.awayTeam === "Boca" ? "Boca" : rivalName;

  const match = {
    id: m.id,
    espnId: m.espnId,
    source: m.source,
    sourceLeague: m.league,
    // El slug usa el nombre canónico (no el corto) para que la URL no cambie
    // si después se acorta el nombre del rival.
    slug: matchSlug(m.date, m.homeTeam, m.awayTeam),
    date: m.date,
    dayLabel: m.dayLabel,
    time: m.time,
    homeTeam,
    awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    homeLogo: m.homeLogo,
    awayLogo: m.awayLogo,
    competition: m.leagueName,
    // Código de competition: permite mostrar el nombre en el idioma del visitante.
    competitionCode: m.league,
    round: round || undefined,
    // La ronda también viaja como código (para traducirla).
    roundType: isLigaTorneo ? "matchday" : "phase",
    ...(isLigaTorneo ? { roundNumber: m.fecha ?? undefined } : { roundPhase: m.phaseSlug ?? undefined }),
    ...(m.leg ? { leg: m.leg } : {}),
    channel: undefined,
    venue: m.venue,
    venueCity: m.venueCity,
    status: m.status,
  };
  if (m.aggregate) match.aggregate = m.aggregate;
  return match;
}

// ---------------------------------------------------------------------------
// Enriquecimiento con /summary (alineaciones, eventos, estadísticas)
// ---------------------------------------------------------------------------

const STAT_LABELS = {
  foulsCommitted: "Faltas",
  yellowCards: "Tarjetas amarillas",
  redCards: "Tarjetas rojas",
  offsides: "Offsides",
  wonCorners: "Tiros de esquina",
  saves: "Atajadas",
  possessionPct: "Posesión",
  totalShots: "Disparos",
  shotsOnTarget: "Disparos al arco",
  shotPct: "Disparos al arco (%)",
  penaltyKickGoals: "Goles de penal",
  penaltyKickShots: "Penales",
  accuratePasses: "Pases completos",
  totalPasses: "Pases",
  passPct: "Precisión de pases (%)",
  totalCrosses: "Centros",
  crossPct: "Precisión de centros (%)",
  totalLongBalls: "Balones largos",
  blockedShots: "Disparos bloqueados",
  totalTackles: "Tackles",
  interceptions: "Intercepciones",
  totalClearance: "Despejes",
};

/** Estadísticas que se muestran en la ficha (el resto se descarta). */
const STATS_VISIBLE = [
  "possessionPct",
  "totalShots",
  "shotsOnTarget",
  "wonCorners",
  "foulsCommitted",
  "yellowCards",
  "redCards",
  "saves",
  "totalPasses",
  "passPct",
];

/** ESPN devuelve estos porcentajes como ratio 0-1 (0.9 = 90%). */
const STATS_RATIO = new Set(["passPct", "shotPct", "crossPct", "longballPct", "tacklePct"]);

const EVENT_TYPES = {
  goal: "Gol",
  "penalty-goal": "Gol (penal)",
  "own-goal": "Gol en contra",
  "penalty-missed": "Pen fallado",
  "yellow-card": "Tarjeta amarilla",
  "yellow-redcard": "Tarjeta roja (2ª amarilla)",
  "red-card": "Tarjeta roja",
  redcard: "Tarjeta roja",
  yellowcard: "Tarjeta amarilla",
  substitution: "Cambio",
};

/** Tipos de evento que no aportan (kickoff, delays, entretiempo…). */
const EVENT_TYPES_IGNORED = new Set([
  "kickoff",
  "start-delay",
  "end-delay",
  "halftime",
  "start-2nd-half",
  "end-regular-time",
  "period-end",
]);

function playerName(athlete) {
  return athlete?.fullName ?? athlete?.displayName ?? athlete?.shortName ?? "";
}

/**
 * `/summary?event={id}` → detalles normalizados (titulares, suplentes, eventos, stats).
 * Si ESPN no trae el evento, devuelve null (no rompe el snapshot).
 */
export async function fetchSummary(league, eventId) {
  const url = `${ESPN_BASE}/${league}/summary?event=${eventId}`;
  let body;
  try {
    body = await cachedJSON(url, { ttlMs: 5 * 60 * 1000 });
  } catch (err) {
    console.warn(`[espn] summary ${eventId} falló: ${err.message}`);
    return null;
  }

  const rosters = body?.rosters ?? [];
  const teams = {};
  for (const r of rosters) {
    const isBoca = String(r?.team?.id) === BOCA_TEAM_ID;
    const players = (r?.roster ?? []).map((p) => ({
      name: playerName(p.athlete),
      starter: p.starter === true,
      position: p.position?.abbreviation ?? p.position?.displayName ?? undefined,
    }));
    teams[isBoca ? "boca" : "rival"] = {
      formation: r?.formation ?? undefined,
      starters: players.filter((p) => p.starter).map((p) => p.name),
      subs: players.filter((p) => !p.starter).map((p) => p.name),
    };
  }

  const events = (body?.keyEvents ?? [])
    .filter((k) => {
      const t = String(k?.type?.type ?? "");
      return t && !EVENT_TYPES_IGNORED.has(t);
    })
    .map((k) => {
      const type = String(k?.type?.type ?? "");
      const names = (k?.participants ?? []).map((p) => playerName(p?.athlete)).filter(Boolean);
      const isSub = type === "substitution";
      // ESPN: "X replaces Y" → X entra, Y sale.
      const player = isSub ? names.slice().reverse().join(" → ") : names.join(", ");
      return {
        minute: k.clock?.displayValue ?? "",
        type: eventType(type, k?.type?.text),
        // Código del evento: permite mostrarlo en el idioma del visitante.
        typeCode: eventTypeCode(type, k?.type?.text),
        team: String(k?.team?.id) === BOCA_TEAM_ID ? "Boca" : "Rival",
        player,
        detail: isSub && names.length >= 2 ? `Sale ${names[1]}, entra ${names[0]}` : undefined,
        ...(isSub && names.length >= 2
          ? { playerOut: names[1], playerIn: names[0] }
          : {}),
      };
    });

  const stats = [];
  const boxTeams = body?.boxscore?.teams ?? [];
  const byName = {};
  for (const t of boxTeams) {
    const isBoca = String(t?.team?.id) === BOCA_TEAM_ID;
    for (const s of t?.statistics ?? []) {
      if (!STATS_VISIBLE.includes(s.name)) continue;
      const label = STAT_LABELS[s.name] ?? s.label ?? s.name;
      byName[label] = byName[label] ?? { label };
      byName[label][isBoca ? "boca" : "rival"] = statValue(s);
    }
  }
  for (const s of Object.values(byName)) stats.push(s);

  const details = {};
  if (teams.boca?.starters?.length) details.startersBoca = teams.boca.starters;
  if (teams.boca?.subs?.length) details.subsBoca = teams.boca.subs;
  if (teams.boca?.formation) details.formationBoca = teams.boca.formation;
  if (teams.rival?.starters?.length) details.startersRival = teams.rival.starters;
  if (teams.rival?.subs?.length) details.subsRival = teams.rival.subs;
  if (teams.rival?.formation) details.formationRival = teams.rival.formation;
  if (events.length) details.events = events;
  if (stats.length) details.stats = stats;

  const referee =
    body?.header?.competitions?.[0]?.officials?.[0]?.displayName ??
    body?.gameInfo?.officials?.[0]?.displayName ??
    body?.gameInfo?.referee?.displayName;
  if (referee) details.referee = referee;

  return Object.keys(details).length ? details : null;
}

/** Código estable del evento (para traducirlo). */
function eventTypeCode(type, text) {
  if (EVENT_TYPES[type]) return type;
  const t = String(text ?? "").toLowerCase();
  if (t.startsWith("goal")) return "goal";
  if (t.includes("yellow card")) return "yellow-card";
  if (t.includes("red card")) return "red-card";
  if (t.includes("substitution")) return "substitution";
  return "event";
}

/** Etiqueta en español del evento (ESPN usa variantes como "Goal - Header"). */
function eventType(type, text) {
  if (EVENT_TYPES[type]) return EVENT_TYPES[type];
  const t = String(text ?? "").toLowerCase();
  if (t.startsWith("goal")) return "Gol";
  if (t.includes("yellow card")) return "Tarjeta amarilla";
  if (t.includes("red card")) return "Tarjeta roja";
  if (t.includes("substitution")) return "Cambio";
  return text ?? "Evento";
}

/** Valor de una estadística (convierte los ratios 0-1 a porcentaje). */
function statValue(stat) {
  const raw = stat?.displayValue ?? "";
  if (STATS_RATIO.has(stat?.name)) {
    const n = Number(raw);
    if (Number.isFinite(n)) return `${Math.round(n * 100)}%`;
  }
  return raw;
}
