import type { APIRoute } from "astro";
import type { Match } from "../types/match";
import data from "../data/matches.json";
import { titleFor, descriptionFor } from "../lib/match";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? "https://cuandojuegaelxeneize.com.ar";
  const matches = data.matches as Match[];

  const items = matches
    .map((m) => {
      const url = `${base}/partidos/${m.slug}/`;
      const title = titleFor(m).replace(" | Cuando Juega el Xeneize", "");
      const desc = descriptionFor(m);
      const dt = new Date(`${m.date}T${m.time ?? "00:00"}:00-03:00`);
      const pubDate = Number.isNaN(dt.getTime()) ? new Date().toUTCString() : dt.toUTCString();
      return [
        "    <item>",
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(desc)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Cuando Juega el Xeneize</title>
    <link>${base}/</link>
    <description>Próximos partidos y resultados de Boca Juniors. Sitio no oficial.</description>
    <language>es-AR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
