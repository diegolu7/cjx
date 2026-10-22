import type { APIRoute } from "astro";
import { renderOgDefaultPng } from "../../lib/og";

export const GET: APIRoute = async () => {
  const png = await renderOgDefaultPng("en");

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
