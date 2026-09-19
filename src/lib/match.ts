import type { Match } from "../types/match";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function rivalOf(m: Match): string {
  return m.homeTeam === "Boca" ? m.awayTeam : m.homeTeam;
}

export function bocaGoles(m: Match): number | undefined {
  return m.homeTeam === "Boca" ? m.homeScore : m.awayScore;
}

export function rivalGoles(m: Match): number | undefined {
  return m.homeTeam === "Boca" ? m.awayScore : m.homeScore;
}

/** "20 de septiembre de 2026" a partir de "2026-09-20". */
export function fechaLarga(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} de ${MESES[Number(m[2]) - 1]} de ${m[1]}`;
}

export function condicion(m: Match): string {
  return m.homeTeam === "Boca" ? "Local" : "Visitante";
}

const MESES_CORTOS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

/** "20" / "SEP" a partir de "2026-09-20". */
export function diaMes(iso: string): { day: string; month: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return { day: iso, month: "" };
  return { day: m[3], month: MESES_CORTOS[Number(m[2]) - 1] ?? "" };
}

/** Marcador desde la perspectiva de Boca: "Boca 2 - 1 Rival". */
export function marcador(m: Match): string {
  const b = bocaGoles(m);
  const r = rivalGoles(m);
  if (b === undefined || r === undefined) return `Boca vs ${rivalOf(m)}`;
  return `Boca ${b} - ${r} ${rivalOf(m)}`;
}

export function titleFor(m: Match): string {
  const rival = rivalOf(m);
  if (m.status === "finished" && bocaGoles(m) !== undefined) {
    return `Boca ${bocaGoles(m)} - ${rivalGoles(m)} ${rival} (${m.competition}) | Cuando Juega el Xeneize`;
  }
  return `Boca vs ${rival}: fecha, hora y cómo ver (${m.competition}) | Cuando Juega el Xeneize`;
}

export function descriptionFor(m: Match): string {
  const rival = rivalOf(m);
  const fecha = fechaLarga(m.date);
  const hora = m.time ? ` a las ${m.time}` : "";
  const lugar = m.venue ? ` en ${m.venue}` : "";
  if (m.status === "finished") {
    return `Resultado de ${marcador(m)} por ${m.competition}${m.round ? ` (${m.round})` : ""} el ${fecha}. Global, formaciones y datos del partido de Boca. Sitio no oficial.`;
  }
  return `Boca vs ${rival} por ${m.competition}${m.round ? ` (${m.round})` : ""} el ${fecha}${hora}${lugar}. Formaciones, historial y cómo ver. Sitio no oficial.`;
}

const DIAS_LARGOS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

/** "sábado" a partir de "2026-09-20". */
export function diaSemana(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return DIAS_LARGOS[d.getDay()] ?? "";
}

/** "Faltan X días" / "Falta 1 día" / "Faltan X h" (build-time, hora Argentina). */
export function countdownText(m: Match): string | undefined {
  if (m.status === "finished") return undefined;
  const md = /^(\d{4})-(\d{2})-(\d{2})/.exec(m.date);
  if (!md) return undefined;

  // Días calendario en ART.
  const nowART = new Date(Date.now() - 3 * 3600000);
  const todayART = Date.UTC(nowART.getUTCFullYear(), nowART.getUTCMonth(), nowART.getUTCDate());
  const matchDay = Date.UTC(Number(md[1]), Number(md[2]) - 1, Number(md[3]));
  const days = Math.round((matchDay - todayART) / 86400000);

  if (days > 1) return `Faltan ${days} días`;
  if (days === 1) return "Falta 1 día";
  if (days < 0) return undefined;

  // Es hoy: contar horas.
  const time = /^\d{1,2}:\d{2}/.test(m.time || "") ? m.time : "23:59";
  const dt = new Date(`${m.date}T${time}:00-03:00`).getTime();
  if (Number.isNaN(dt)) return "Es hoy";
  const diff = dt - Date.now();
  if (diff <= 0) return "En juego o por comenzar";
  const hours = Math.max(1, Math.floor(diff / 3600000));
  return `Faltan ${hours} h`;
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
): { label: string; players: string[] }[] {
  if (!players || players.length === 0) return [];
  const nums = String(formation || "")
    .split("-")
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0);
  const expected = nums.reduce((a, b) => a + b, 0) + 1;
  if (nums.length === 0 || expected !== players.length) {
    return [{ label: "Titulares", players }];
  }
  const lines = [{ label: "Arquero", players: players.slice(0, 1) }];
  let i = 1;
  nums.forEach((n, idx) => {
    const label =
      idx === 0 ? "Defensores" : idx === nums.length - 1 ? "Delanteros" : "Mediocampistas";
    lines.push({ label, players: players.slice(i, i + n) });
    i += n;
  });
  return lines;
}

/** Preguntas frecuentes generadas desde la ficha (SEO + GEO). */
export function faqFor(m: Match): { q: string; a: string }[] {
  const rival = rivalOf(m);
  const fecha = fechaLarga(m.date);
  const dia = diaSemana(m.date);
  const torneo = `${m.competition}${m.round ? ` (${m.round})` : ""}`;
  const out: { q: string; a: string }[] = [];

  out.push({
    q: `¿Cuándo juega Boca vs ${rival}?`,
    a: `El partido Boca vs ${rival} se juega el ${dia} ${fecha}${m.time ? ` a las ${m.time}` : ""}, por ${torneo}.`,
  });

  if (m.time) {
    out.push({
      q: `¿A qué hora juega Boca vs ${rival}?`,
      a: `A las ${m.time} (hora Argentina).`,
    });
  }

  if (m.venue && m.venue !== "Por definir" && m.venue !== "-") {
    out.push({ q: `¿Dónde juega Boca vs ${rival}?`, a: `En ${m.venue}.` });
  }

  if (m.channel && m.channel !== "-") {
    out.push({ q: `¿Por qué canal pasan Boca vs ${rival}?`, a: `Por ${m.channel}.` });
  }

  out.push({ q: `¿En qué torneo juega Boca vs ${rival}?`, a: `Por ${torneo}.` });

  const b = bocaGoles(m);
  const r = rivalGoles(m);
  if (m.status === "finished" && b !== undefined && r !== undefined) {
    let a = `Boca ${b} - ${r} ${rival}.`;
    if (m.aggregate) {
      a += ` Global: Boca ${m.aggregate.bocaScore} - ${m.aggregate.rivalScore} ${rival}.`;
    }
    out.push({ q: `¿Cómo salió Boca vs ${rival}?`, a });
  }

  return out;
}

/** Previa automática generada desde la ficha (texto único por partido). */
export function autoPrevia(m: Match): string {
  const rival = rivalOf(m);
  const verbo = m.homeTeam === "Boca" ? "recibe a" : "visita a";
  const fecha = fechaLarga(m.date);
  const hora = m.time ? ` a las ${m.time}` : "";
  const lugar = m.venue && m.venue !== "Por definir" ? ` en ${m.venue}` : "";
  const torneo = `${m.competition}${m.round ? ` (${m.round})` : ""}`;
  return `Boca ${verbo} ${rival} por ${torneo} el ${fecha}${hora}${lugar}. Las formaciones, los datos y el resultado se actualizan cerca del inicio del partido.`;
}
