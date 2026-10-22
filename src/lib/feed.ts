import type { Match } from "../types/match";
import { titleFor, descriptionFor, kickoffISO } from "./match";
import { getDict, type Locale } from "../i18n/index.ts";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS del sitio en el idioma indicado (`es` o `en`). */
export function buildFeedXml(base: string, locale: Locale, matches: Match[]): string {
  const dict = getDict(locale);
  const prefix = locale === "es" ? "" : "/en";

  const items = matches
    .map((m) => {
      const url = `${base}${prefix}/partidos/${m.slug}/`;
      const title = titleFor(m, dict);
      const desc = descriptionFor(m, dict);
      const dt = new Date(kickoffISO(m) ?? `${m.date}T00:00:00-03:00`);
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(dict.meta.siteName)}</title>
    <link>${base}${prefix}/</link>
    <description>${escapeXml(dict.feed.description)}</description>
    <language>${locale === "es" ? "es-AR" : "en-US"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
