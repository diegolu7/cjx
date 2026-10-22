// API interna del sitio (JSON prerenderizado).
//
// El sitio es SSG (GitHub Pages), así que no hay runtime: este endpoint se
// genera en cada build y queda disponible como archivo estático. Se regenera
// con el mismo cron que reconstruye el sitio (cada 15 minutos).
//
// GET /api/partidos.json
//
//   {
//     "updatedAt": "2026-10-22T00:56:23.729Z",
//     "source": "espn",
//     "timezone": "America/Argentina",
//     "counts": { "next": 1, "scheduled": 4, "live": 0, "finished": 3 },
//     "next": { ... },
//     "upcoming": [ ... ],
//     "results": [ ... ]
//   }

import type { APIRoute } from "astro";
import type { Match } from "../../types/match";
import data from "../../data/matches.json";

export const prerender = true;

const matches = data.matches as Match[];

const upcoming = matches.filter((m) => m.status === "live" || m.status === "next" || m.status === "scheduled");
const results = matches.filter((m) => m.status === "finished");
const next = matches.find((m) => m.status === "live") ?? matches.find((m) => m.status === "next");

const payload = {
  updatedAt: data.updatedAt,
  source: data.source ?? "espn",
  timezone: "America/Argentina",
  counts: {
    next: matches.filter((m) => m.status === "next" || m.status === "live").length,
    scheduled: matches.filter((m) => m.status === "scheduled").length,
    live: matches.filter((m) => m.status === "live").length,
    finished: results.length,
  },
  next: next ?? null,
  upcoming,
  results,
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
