import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Match } from "../types/match";
import { rivalOf, fechaLarga, horaDe, lugarDe, competitionLabel, roundLabel } from "./match";
import { getDict, type Locale } from "../i18n/index.ts";

const FONT_DIR = resolve(process.cwd(), "node_modules/@fontsource/ibm-plex-mono/files");
const fontBold = readFileSync(resolve(FONT_DIR, "ibm-plex-mono-latin-700-normal.woff"));
const fontRegular = readFileSync(resolve(FONT_DIR, "ibm-plex-mono-latin-400-normal.woff"));

/** Imagen Open Graph por defecto (marca), en el idioma indicado. */
export async function renderOgDefaultPng(locale: Locale): Promise<Uint8Array> {
  const dict = getDict(locale);

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
            style: { display: "flex", fontSize: 26, color: "#D9A441", letterSpacing: "2px" },
            children: dict.og.brand,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flex: 1,
              alignItems: "center",
              textAlign: "center",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.15,
            },
            children: dict.og.title,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: 30, color: "#A7B6C8" },
            children: dict.og.subtitle,
          },
        },
        {
          type: "div",
          props: { style: { display: "flex", marginTop: "22px", fontSize: 22, color: "#5FA8D3" }, children: dict.og.url },
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

  return new Uint8Array(new Resvg(svg).render().asPng());
}

/** Imagen Open Graph del partido, en el idioma indicado. */
export async function renderOgPng(match: Match, locale: Locale): Promise<Uint8Array> {
  const dict = getDict(locale);
  const finished = match.status === "finished";
  const live = match.status === "live";
  const rival = rivalOf(match);

  const title =
    finished || live
      ? `${match.homeTeam.toUpperCase()} ${match.homeScore} — ${match.awayScore} ${match.awayTeam.toUpperCase()}`
      : `BOCA VS ${rival.toUpperCase()}`;

  const competition = competitionLabel(match, dict);
  const round = roundLabel(match, dict);
  const meta1 = `${competition}${round ? ` · ${round}` : ""}`;
  const meta2 = `${fechaLarga(match.date, dict)}${horaDe(match) ? ` · ${horaDe(match)}` : ""}${
    lugarDe(match) ? ` · ${lugarDe(match)}` : ""
  }`;

  const badgeText = live
    ? dict.timeline.badges.live
    : finished
      ? dict.timeline.badges.finished
      : dict.timeline.badges.next;

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
                  children: dict.og.brand,
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
                    color: live ? "#FFFFFF" : finished ? "#A7B6C8" : "#07111F",
                    background: live ? "#D9534F" : finished ? "transparent" : "#D9A441",
                    border: live
                      ? "2px solid #D9534F"
                      : finished
                        ? "2px solid #274866"
                        : "2px solid #D9A441",
                  },
                  children: badgeText,
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

  return new Uint8Array(new Resvg(svg).render().asPng());
}
