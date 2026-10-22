import type { Match, MatchStatus } from "../types/match";
import type { Dict } from "../i18n/index.ts";
import { t } from "../i18n/index.ts";

export function rivalOf(m: Match): string {
  return m.homeTeam === "Boca" ? m.awayTeam : m.homeTeam;
}

/** ¿El partido está en juego? */
export function isLive(m: Match): boolean {
  return m.status === "live";
}

/** Partido destacado: el que está en juego o, si no, el próximo. */
export function featuredMatch(matches: Match[]): Match | undefined {
  return matches.find((m) => m.status === "live") ?? matches.find((m) => m.status === "next");
}

/** Etiqueta del estado del partido, en el idioma del diccionario. */
export function statusLabel(s: MatchStatus, dict: Dict): string {
  switch (s) {
    case "finished":
      return dict.status.finished;
    case "live":
      return dict.status.live;
    case "next":
      return dict.status.next;
    default:
      return dict.status.scheduled;
  }
}

/** Nombre de la competition en el idioma del diccionario (usa el código del snapshot). */
export function competitionLabel(m: Match, dict: Dict): string {
  const code = m.competitionCode;
  if (code) {
    const label = dict.competitions[code as keyof typeof dict.competitions];
    if (label) return label;
  }
  return m.competition;
}

/** Ronda en el idioma del diccionario ("Fecha 13" / "Matchday 13", "Semifinales - Ida"). */
export function roundLabel(m: Match, dict: Dict): string | undefined {
  if (m.roundType === "matchday" && m.roundNumber) {
    return t(dict, "rounds.matchday", { n: m.roundNumber });
  }
  if (m.roundType === "phase" && m.roundPhase) {
    const phase = dict.phases[m.roundPhase as keyof typeof dict.phases];
    if (!phase) return m.round;
    if (m.leg) {
      const leg = dict.rounds.legs[m.leg as keyof typeof dict.rounds.legs];
      return leg ? `${phase} - ${leg}` : phase;
    }
    return phase;
  }
  return m.round;
}

/** Nombre del torneo en el idioma del diccionario (según el código del snapshot). */
export function tournamentLabel(matches: Match[], fallback: string, dict: Dict): string {
  const code = matches.find((m) => m.competitionCode)?.competitionCode;
  if (code) {
    const label = dict.competitions[code as keyof typeof dict.competitions];
    if (label) return label;
  }
  return fallback;
}

export function bocaGoles(m: Match): number | undefined {
  return m.homeTeam === "Boca" ? m.homeScore : m.awayScore;
}

export function rivalGoles(m: Match): number | undefined {
  return m.homeTeam === "Boca" ? m.awayScore : m.homeScore;
}

const SIN_DATO = new Set(["", "-", "por definir", "a definir", "tbd", "tv"]);

/** Valor real de un campo opcional (hora, canal, lugar…), o undefined. */
function datoVacio(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t && !SIN_DATO.has(t.toLowerCase()) ? t : undefined;
}

/** Hora "real" del partido, o undefined si no está definida. */
export function horaDe(m: Match): string | undefined {
  return datoVacio(m.time);
}

/** Canal "real" del partido, o undefined si todavía no está definido. */
export function canalDe(m: Match): string | undefined {
  return datoVacio(m.channel);
}

/** Lugar "real" del partido, o undefined si todavía no está definido. */
export function lugarDe(m: Match): string | undefined {
  return datoVacio(m.venue);
}

/**
 * ISO 8601 del kickoff en hora Argentina (-03:00), o null si no hay hora válida.
 * ESPN no siempre manda la hora: si no viene, se devuelve null.
 */
export function kickoffISO(m: Match): string | null {
  const hora = horaDe(m);
  if (!/^\d{1,2}:\d{2}$/.test(hora ?? "")) return null;
  const [h, min] = hora!.split(":").map(Number);
  if (h > 23 || min > 59) return null;
  return `${m.date}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00-03:00`;
}

/** Kickoff + 2h en UTC ISO, o null si no hay hora válida. */
export function kickoffEndISO(m: Match): string | null {
  const start = kickoffISO(m);
  if (!start) return null;
  const d = new Date(start);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getTime() + 2 * 60 * 60 * 1000).toISOString();
}

/** "20 de septiembre de 2026" / "September 20, 2026" a partir de "2026-09-20". */
export function fechaLarga(iso: string, dict: Dict): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return t(dict, "dates.long", {
    day: Number(m[3]),
    month: dict.months[Number(m[2]) - 1],
    year: m[1],
  });
}

/** "Local" / "Visitante" → "Home" / "Away". */
export function condicion(m: Match, dict: Dict): string {
  return m.homeTeam === "Boca" ? dict.condition.home : dict.condition.away;
}

/** "20/09/2026 21:30" (hora Argentina) a partir de un ISO. */
export function fechaHoraCorta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const art = new Date(d.getTime() - 3 * 3600000);
  const dd = String(art.getUTCDate()).padStart(2, "0");
  const mm = String(art.getUTCMonth() + 1).padStart(2, "0");
  const hh = String(art.getUTCHours()).padStart(2, "0");
  const mi = String(art.getUTCMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${art.getUTCFullYear()} ${hh}:${mi}`;
}

/** "20" / "SEP" a partir de "2026-09-20". */
export function diaMes(iso: string, dict: Dict): { day: string; month: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return { day: iso, month: "" };
  return { day: m[3], month: dict.monthsShort[Number(m[2]) - 1] ?? "" };
}

/** Marcador desde la perspectiva de Boca: "Boca 2 - 1 Rival". */
export function marcador(m: Match): string {
  const b = bocaGoles(m);
  const r = rivalGoles(m);
  if (b === undefined || r === undefined) return `Boca vs ${rivalOf(m)}`;
  return `Boca ${b} - ${r} ${rivalOf(m)}`;
}

export function titleFor(m: Match, dict: Dict): string {
  const rival = rivalOf(m);
  const competition = competitionLabel(m, dict);
  if (m.status === "finished" && bocaGoles(m) !== undefined) {
    return t(dict, "seo.titleFinished", {
      boca: bocaGoles(m),
      rivalScore: rivalGoles(m),
      rival,
      competition,
    });
  }
  if (m.status === "live") {
    return t(dict, "seo.titleLive", { rival, competition });
  }
  return t(dict, "seo.titleUpcoming", { rival, competition });
}

export function descriptionFor(m: Match, dict: Dict): string {
  const rival = rivalOf(m);
  const competition = competitionLabel(m, dict);
  const round = roundLabel(m, dict);
  const date = fechaLarga(m.date, dict);
  const hour = horaDe(m) ? t(dict, "seo.hour", { time: horaDe(m) }) : "";
  const venue = lugarDe(m) ? t(dict, "seo.venue", { venue: lugarDe(m) }) : "";
  const roundText = round ? t(dict, "seo.round", { round }) : "";
  if (m.status === "finished") {
    return t(dict, "seo.descFinished", {
      score: marcador(m),
      competition,
      round: roundText,
      date,
    });
  }
  if (m.status === "live") {
    return t(dict, "seo.descLive", { rival, competition });
  }
  return t(dict, "seo.descUpcoming", {
    rival,
    competition,
    round: roundText,
    date,
    hour,
    venue,
  });
}

/** "sábado" / "Saturday" a partir de "2026-09-20". */
export function diaSemana(iso: string, dict: Dict): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return dict.weekdays[d.getDay()] ?? "";
}

/** "Faltan X días" / "Faltan X h" (build-time, hora Argentina). */
export function countdownText(m: Match, dict: Dict): string | undefined {
  if (m.status === "finished") return undefined;
  if (m.status === "live") return dict.status.live;
  const md = /^(\d{4})-(\d{2})-(\d{2})/.exec(m.date);
  if (!md) return undefined;

  // Días calendario en ART.
  const nowART = new Date(Date.now() - 3 * 3600000);
  const todayART = Date.UTC(nowART.getUTCFullYear(), nowART.getUTCMonth(), nowART.getUTCDate());
  const matchDay = Date.UTC(Number(md[1]), Number(md[2]) - 1, Number(md[3]));
  const days = Math.round((matchDay - todayART) / 86400000);

  if (days > 1) return t(dict, "countdown.days", { n: days });
  if (days === 1) return dict.countdown.oneDay;
  if (days < 0) return undefined;

  // Es hoy: contar horas.
  const time = /^\d{1,2}:\d{2}/.test(m.time || "") ? m.time : "23:59";
  const dt = new Date(`${m.date}T${time}:00-03:00`).getTime();
  if (Number.isNaN(dt)) return dict.countdown.today;
  const diff = dt - Date.now();
  if (diff <= 0) return dict.countdown.imminent;
  const hours = Math.max(1, Math.floor(diff / 3600000));
  return t(dict, "countdown.hours", { n: hours });
}

/** ¿Boca avanza el cruce? (según global + penales). */
export function bocaAdvances(m: Match): boolean {
  const a = m.aggregate;
  if (!a) return false;
  if (a.bocaScore > a.rivalScore) return true;
  if (a.bocaScore < a.rivalScore) return false;
  if (a.penaltyBoca !== undefined && a.penaltyRival !== undefined) {
    return a.penaltyBoca > a.penaltyRival;
  }
  return false;
}

/** Últimos N resultados de Boca con marcador real. */
export function recentResults(all: Match[], n = 3): { result: string; text: string }[] {
  return all
    .filter(
      (m) => m.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined,
    )
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, n)
    .map((m) => {
      const boca = m.homeTeam === "Boca" ? (m.homeScore as number) : (m.awayScore as number);
      const rival = m.homeTeam === "Boca" ? (m.awayScore as number) : (m.homeScore as number);
      const result = boca > rival ? "G" : boca < rival ? "P" : "E";
      return { result, text: `${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}` };
    });
}

/** Divide los titulares en líneas según la formación (4-3-3 → [4,3,3]). */
export function splitByFormation(
  formation: string | undefined,
  players: string[],
  dict: Dict,
): { label: string; players: string[] }[] {
  if (!players || players.length === 0) return [];
  const nums = String(formation || "")
    .split("-")
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0);
  const expected = nums.reduce((a, b) => a + b, 0) + 1;
  if (nums.length === 0 || expected !== players.length) {
    return [{ label: dict.formation.starters, players }];
  }
  const lines = [{ label: dict.formation.keeper, players: players.slice(0, 1) }];
  let i = 1;
  nums.forEach((n, idx) => {
    const label =
      idx === 0
        ? dict.formation.defenders
        : idx === nums.length - 1
          ? dict.formation.forwards
          : dict.formation.midfielders;
    lines.push({ label, players: players.slice(i, i + n) });
    i += n;
  });
  return lines;
}

/** Preguntas frecuentes generadas desde la ficha (SEO + GEO). */
export function faqFor(m: Match, dict: Dict): { q: string; a: string }[] {
  const rival = rivalOf(m);
  const date = fechaLarga(m.date, dict);
  const day = diaSemana(m.date, dict);
  const tournament = `${competitionLabel(m, dict)}${
    roundLabel(m, dict) ? ` (${roundLabel(m, dict)})` : ""
  }`;
  const out: { q: string; a: string }[] = [];

  out.push({
    q: t(dict, "faq.qWhen", { rival }),
    a: t(dict, "faq.aWhen", {
      rival,
      day,
      date,
      hour: horaDe(m) ? t(dict, "seo.hour", { time: horaDe(m) }) : "",
      tournament,
    }),
  });

  if (horaDe(m)) {
    out.push({
      q: t(dict, "faq.qTime", { rival }),
      a: t(dict, "faq.aTime", { time: horaDe(m) }),
    });
  }

  if (lugarDe(m)) {
    out.push({
      q: t(dict, "faq.qWhere", { rival }),
      a: t(dict, "faq.aWhere", { venue: lugarDe(m) }),
    });
  }

  if (canalDe(m)) {
    out.push({
      q: t(dict, "faq.qChannel", { rival }),
      a: t(dict, "faq.aChannel", { channel: canalDe(m) }),
    });
  }

  out.push({
    q: t(dict, "faq.qTournament", { rival }),
    a: t(dict, "faq.aTournament", { tournament }),
  });

  const b = bocaGoles(m);
  const r = rivalGoles(m);
  if (m.status === "finished" && b !== undefined && r !== undefined) {
    let a = `${rival} ${b} - ${r}.`;
    if (m.aggregate) {
      a += t(dict, "faq.aResultAggregate", {
        boca: m.aggregate.bocaScore,
        rival: m.aggregate.rivalScore,
        rivalName: rival,
      });
    }
    out.push({ q: t(dict, "faq.qResult", { rival }), a });
  }

  return out;
}

/** Previa automática generada desde la ficha (texto único por partido). */
export function autoPrevia(m: Match, dict: Dict): string {
  const rival = rivalOf(m);
  const verb = m.homeTeam === "Boca" ? dict.preview.hosts : dict.preview.visits;
  const date = fechaLarga(m.date, dict);
  const hour = horaDe(m) ? t(dict, "seo.hour", { time: horaDe(m) }) : "";
  const venue = lugarDe(m) ? t(dict, "seo.venue", { venue: lugarDe(m) }) : "";
  const tournament = `${competitionLabel(m, dict)}${
    roundLabel(m, dict) ? ` (${roundLabel(m, dict)})` : ""
  }`;
  return t(dict, "preview.text", { verb, rival, tournament, date, hour, venue });
}

/** Claves automáticas del partido (la fuente ya no trae texto manual). */
export function factsFor(m: Match, all: Match[] = [], dict: Dict): string[] {
  const facts: string[] = [];
  const local = m.homeTeam === "Boca";

  const a = m.aggregate;
  if (a) {
    if (a.bocaScore > a.rivalScore) {
      facts.push(t(dict, "facts.leading", { boca: a.bocaScore, rival: a.rivalScore }));
    } else if (a.bocaScore < a.rivalScore) {
      facts.push(t(dict, "facts.behind", { boca: a.bocaScore, rival: a.rivalScore }));
    } else {
      facts.push(t(dict, "facts.tied", { boca: a.bocaScore, rival: a.rivalScore }));
    }
    if (a.penaltyBoca !== undefined && a.penaltyRival !== undefined) {
      facts.push(t(dict, "facts.penalties", { boca: a.penaltyBoca, rival: a.penaltyRival }));
    }
  }

  if (lugarDe(m)) {
    const city = m.venueCity ? t(dict, "facts.city", { city: m.venueCity }) : "";
    facts.push(
      t(dict, local ? "facts.home" : "facts.away", { venue: lugarDe(m), city }),
    );
  }

  const form = recentResults(all, 3);
  if (form.length >= 2) {
    const g = form.filter((f) => f.result === "G").length;
    const e = form.filter((f) => f.result === "E").length;
    const p = form.filter((f) => f.result === "P").length;
    facts.push(
      t(dict, "facts.form", {
        n: form.length,
        w: g,
        d: e,
        l: p,
        win: dict.facts.win,
        wPlural: g === 1 ? "" : dict.facts.winPlural,
        draw: dict.facts.draw,
        dPlural: e === 1 ? "" : dict.facts.drawPlural,
        loss: dict.facts.loss,
        lPlural: p === 1 ? "" : dict.facts.lossPlural,
      }),
    );
    facts.push(t(dict, "facts.lastMatch", { text: form[0].text }));
  }

  return facts;
}
