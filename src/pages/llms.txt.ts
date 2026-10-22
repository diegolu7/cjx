import type { APIRoute } from "astro";
import type { Match } from "../types/match";
import data from "../data/matches.json";
import { buildLlmsTxt } from "../lib/llms";

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? "https://cuandojuegaelxeneize.com.ar";
  const matches = data.matches as Match[];

  return new Response(buildLlmsTxt(base, "es", matches), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
