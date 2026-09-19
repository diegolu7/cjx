import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Match } from "../../types/match";
import data from "../../data/matches.json";
import { rivalOf, fechaLarga } from "../../lib/match";

export async function getStaticPaths() {
  return (data.matches as Match[]).map((m) => ({
    params: { slug: m.slug },
    props: { match: m },
  }));
}

const FONT_DIR = resolve(
  process.cwd(),
  "node_modules/@fontsource/ibm-plex-mono/files",
);
const fontBold = readFileSync(resolve(FONT_DIR, "ibm-plex-mono-latin-700-normal.woff"));
const fontRegular = readFileSync(resolve(FONT_DIR, "ibm-plex-mono-latin-400-normal.woff"));

export const GET: APIRoute = async ({ props }) => {
  const { match } = props as { match: Match };
  const finished = match.status === "finished";
  const rival = rivalOf(match);

  const title = finished
    ? `${match.homeTeam.toUpperCase()} ${match.homeScore} — ${match.awayScore} ${match.awayTeam.toUpperCase()}`
    : `BOCA VS ${rival.toUpperCase()}`;

  const meta1 = `${match.competition}${match.round ? ` · ${match.round}` : ""}`;
  const meta2 = `${fechaLarga(match.date)}${match.time ? ` · ${match.time}` : ""}${
    match.venue && match.venue !== "Por definir" ? ` · ${match.venue}` : ""
  }`;

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        background: "#07111F",
        padding: "64px",
        fontFamily: "IBM Plex Mono",
        color: "#F3F7FB",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { fontSize: 26, color: "#D9A441", letterSpacing: "2px" },
                  children: "CUANDO JUEGA EL XENEIZE",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: 22,
                    fontWeight: 700,
                    padding: "8px 18px",
                    borderRadius: "6px",
                    color: finished ? "#A7B6C8" : "#07111F",
                    background: finished ? "transparent" : "#D9A441",
                    border: finished ? "2px solid #274866" : "2px solid #D9A441",
                  },
                  children: finished ? "FINAL" : "PRÓXIMO",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.2,
            },
            children: title,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: 28,
              color: "#A7B6C8",
            },
            children: [
              { type: "div", props: { style: { display: "flex" }, children: meta1 } },
              { type: "div", props: { style: { display: "flex" }, children: meta2 } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", marginTop: "22px", fontSize: 22, color: "#5FA8D3" },
            children: "cuandojuegaelxeneize.com.ar",
          },
        },
      ],
    },
  };

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: "IBM Plex Mono", data: fontRegular, weight: 400, style: "normal" },
      { name: "IBM Plex Mono", data: fontBold, weight: 700, style: "normal" },
    ],
  });

  const png = new Uint8Array(new Resvg(svg).render().asPng());

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
