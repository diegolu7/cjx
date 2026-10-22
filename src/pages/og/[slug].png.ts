import type { APIRoute } from "astro";
import type { Match } from "../../types/match";
import data from "../../data/matches.json";
import { renderOgPng } from "../../lib/og";

export async function getStaticPaths() {
  return (data.matches as Match[]).map((m) => ({
    params: { slug: m.slug },
    props: { match: m },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { match } = props as { match: Match };
  const png = await renderOgPng(match, "es");

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

