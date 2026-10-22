// Reglas de negocio de la agenda: orden, "próximo", vigencia, forma reciente e indexación.
// Se aplican igual venga la data de ESPN o cualquier otra fuente.

export const GRACE_MS = 6 * 60 * 60 * 1000;
export const MAX_FINISHED = 3;

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function rivalOf(m) {
  return m.homeTeam === "Boca" ? m.awayTeam : m.homeTeam;
}

export function normalizeToISO(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  let m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
  m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(s);
  if (m) return `${m[3]}-${pad2(m[2])}-${pad2(m[1])}`;
  m = /^(\d{1,2})[-/](\d{1,2})$/.exec(s);
  if (m) return `${new Date().getFullYear()}-${pad2(m[2])}-${pad2(m[1])}`;
  return "";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function parseDisplayDate(date) {
  const iso = normalizeToISO(date);
  if (iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const ms = new Date(date).getTime();
  return Number.isNaN(ms) ? new Date(0) : new Date(ms);
}

export function sortDateAsc(a, b) {
  return parseDisplayDate(a).getTime() - parseDisplayDate(b).getTime();
}

/** Fecha+hora del partido en hora Argentina (UTC-3). Sin hora → 23:59 ART. */
export function matchDateTime(m) {
  const iso = normalizeToISO(m.date);
  if (!iso) return null;
  const time = /^\d{1,2}:\d{2}/.test(String(m.time || "")) ? m.time : "23:59";
  const d = new Date(`${iso}T${time}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * ¿El partido debe mostrarse? Los finalizados siempre; los no finalizados,
 * mientras no hayan pasado más de 6 h desde su inicio (hora Argentina).
 */
export function esVigente(m) {
  if (m.status === "finished") return true;
  const dt = matchDateTime(m);
  if (!dt) return true;
  return dt.getTime() >= Date.now() - GRACE_MS;
}

/** Deja un único partido con status "next" (el más cercano). */
export function keepSingleNext(matches) {
  const candidates = matches
    .filter((m) => m.status === "next")
    .slice()
    .sort((a, b) => sortDateAsc(a.date, b.date));
  if (candidates.length === 0) return matches;
  const chosen = candidates[0];
  return matches.map((m) =>
    m.status === "next" && m.id !== chosen.id ? { ...m, status: "scheduled" } : m,
  );
}

/** Orden canónico: finalizados (antiguos→recientes), en vivo, próximo, programados. */
export function ordenarCronologico(matches) {
  const past = matches.filter((m) => m.status === "finished").sort((a, b) => sortDateAsc(a.date, b.date));
  const live = matches.filter((m) => m.status === "live").sort((a, b) => sortDateAsc(a.date, b.date));
  const next = matches.filter((m) => m.status === "next").sort((a, b) => sortDateAsc(a.date, b.date));
  const future = matches.filter((m) => m.status === "scheduled").sort((a, b) => sortDateAsc(a.date, b.date));

  const result = [...past, ...live];
  if (next.length > 0) result.push(next[0]);
  result.push(...future);

  if (next.length === 0 && result.length > 0) {
    const firstFuture = result.findIndex((m) => m.status === "scheduled");
    if (firstFuture >= 0) result[firstFuture] = { ...result[firstFuture], status: "next" };
  }

  return result;
}

/** Forma reciente de Boca (últimos N finalizados): "W" | "D" | "L". */
export function computeBocaForm(matches, n = 3) {
  return matches
    .filter((m) => m.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined)
    .sort((a, b) => sortDateAsc(b.date, a.date))
    .slice(0, n)
    .map((m) => {
      const boca = m.homeTeam === "Boca" ? m.homeScore : m.awayScore;
      const rival = m.homeTeam === "Boca" ? m.awayScore : m.homeScore;
      return boca > rival ? "W" : boca < rival ? "L" : "D";
    });
}

/**
 * Puntaje de contenido (define index/noindex de una ficha).
 * Antes venía del Sheet; ahora se calcula con lo que trae ESPN.
 */
export function computeDetailsScore(d) {
  if (!d) return 0;
  let s = 0;
  if ((d.startersBoca?.length ?? 0) > 0 && (d.startersRival?.length ?? 0) > 0) s += 2;
  if ((d.events?.length ?? 0) >= 1) s += 1;
  if ((d.stats?.length ?? 0) >= 1) s += 1;
  if ((d.preview?.length ?? 0) >= 200) s += 2;
  if ((d.facts?.length ?? 0) >= 1) s += 1;
  return s;
}

/** Normaliza la agenda final: filtra, ordena y decide indexación. */
export function finalizeMatches(matches) {
  const vigentes = matches.filter(esVigente);

  const bocaForm = computeBocaForm(vigentes, 3);

  const finished = vigentes
    .filter((m) => m.status === "finished")
    .sort((a, b) => sortDateAsc(b.date, a.date))
    .slice(0, MAX_FINISHED);
  const upcoming = vigentes.filter((m) => m.status !== "finished");

  const result = ordenarCronologico(keepSingleNext([...finished, ...upcoming]));

  const upcomingSorted = result
    .filter((m) => m.status !== "finished")
    .slice()
    .sort((a, b) => sortDateAsc(a.date, b.date));
  const indexableUpcoming = new Set(upcomingSorted.slice(0, 2).map((m) => m.slug));

  return result.map((m) => ({
    ...m,
    bocaForm,
    details: m.details ? { ...m.details, score: computeDetailsScore(m.details) } : undefined,
    indexable:
      m.status === "finished"
        ? (m.details?.score ?? 0) >= 3
        : indexableUpcoming.has(m.slug),
  }));
}
