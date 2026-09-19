import type { APIRoute } from "astro";
import type { Match } from "../types/match";
import data from "../data/matches.json";

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? "https://cuandojuegaelxeneize.com.ar";
  const matches = data.matches as Match[];

  const lines: string[] = [
    "# Cuando Juega el Xeneize",
    "",
    "> Sitio informativo independiente (NO oficial) que muestra cuándo juega Boca Juniors: próximo partido, fecha, hora, rival, torneo, canal y resultados recientes. Contenido en español (Argentina).",
    "",
    "Hechos clave:",
    '- Propósito: responder rápido "¿cuándo juega Boca?" con la agenda y los resultados.',
    "- Sitio no oficial: no afiliado a Boca Juniors, AFA ni CONMEBOL. Canal oficial: https://www.bocajuniors.com.ar",
    "- Fuente de datos: Google Sheets propio + servicios de datos deportivos.",
    "- Los datos pueden contener errores o estar desactualizados; verificar en canales oficiales.",
    "- Contacto: delnorte.destinos@gmail.com",
    "",
    "Páginas:",
    `- Inicio (agenda y próximo partido): ${base}/`,
    `- Todos los partidos: ${base}/partidos/`,
    `- Información, FAQ y fuentes: ${base}/info/`,
    `- Contacto: ${base}/contacto/`,
    `- Términos: ${base}/terminos/`,
    `- Privacidad: ${base}/privacidad/`,
    `- Cookies: ${base}/cookies/`,
    "",
    "Partidos:",
  ];

  for (const m of matches) {
    const rival = m.homeTeam === "Boca" ? m.awayTeam : m.homeTeam;
    const estado = m.status === "finished" ? "Finalizado" : "Próximo";
    const hora = m.time ? ` ${m.time}` : "";
    lines.push(
      `- [${estado}] Boca vs ${rival} — ${m.date}${hora} — ${m.competition} — ${base}/partidos/${m.slug}/`,
    );
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
