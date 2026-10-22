import type { APIRoute } from "astro";
import type { Match } from "../types/match";
import data from "../data/matches.json";
import { buildFeedXml } from "../lib/feed";

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? "https://cuandojuegaelxeneize.com.ar";
  const matches = data.matches as Match[];

  return new Response(buildFeedXml(base, "es", matches), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
