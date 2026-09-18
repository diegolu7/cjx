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
