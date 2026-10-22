import type { Match } from "../types/match";
import { getDict, t, type Locale } from "../i18n/index.ts";
import { competitionLabel } from "./match.ts";

/** `llms.txt` del sitio (resumen legible por IA) en el idioma indicado. */
export function buildLlmsTxt(base: string, locale: Locale, matches: Match[]): string {
  const dict = getDict(locale);
  const prefix = locale === "es" ? "" : "/en";

  const lines: string[] = [
    `# ${t(dict, "llms.title")}`,
    "",
    `> ${t(dict, "llms.description")}`,
    "",
    t(dict, "llms.keyFactsTitle"),
    ...dict.llms.keyFacts.map((fact) => `- ${fact}`),
    "",
    t(dict, "llms.pagesTitle"),
    `- ${t(dict, "llms.pages.home")}: ${base}${prefix}/`,
    `- ${t(dict, "llms.pages.matches")}: ${base}${prefix}/partidos/`,
    `- ${t(dict, "llms.pages.info")}: ${base}${prefix}/info/`,
    `- ${t(dict, "llms.pages.contact")}: ${base}${prefix}/contacto/`,
    `- ${t(dict, "llms.pages.terms")}: ${base}${prefix}/terminos/`,
    `- ${t(dict, "llms.pages.privacy")}: ${base}${prefix}/privacidad/`,
    `- ${t(dict, "llms.pages.cookies")}: ${base}${prefix}/cookies/`,
    "",
    t(dict, "llms.matchesTitle"),
  ];

  for (const m of matches) {
    const rival = m.homeTeam === "Boca" ? m.awayTeam : m.homeTeam;
    const status =
      m.status === "finished"
        ? t(dict, "llms.status.finished")
        : t(dict, "llms.status.upcoming");
    lines.push(
      t(dict, "llms.matchLine", {
        status,
        rival,
        date: m.date,
        time: m.time ? ` ${m.time}` : "",
        competition: competitionLabel(m, dict),
        url: `${base}${prefix}/partidos/${m.slug}/`,
      }),
    );
  }

  lines.push("");

  return lines.join("\n");
}
