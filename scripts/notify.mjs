// Emisor de Web Push (build/cron).
// Lee src/data/matches.json y avisa ÚNICAMENTE 1 hora antes del inicio del partido.
// No se envían recordatorios de 24 h ni de resultado final (evolutivo futuro).
// El aviso se manda en español y en inglés: la Edge Function filtra por `lang`.
//
// Variables de entorno:
//   SUPABASE_URL   (ej. https://xxxx.supabase.co)
//   SEND_SECRET    (token compartido con la Edge Function)
//
// Uso: node scripts/notify.mjs

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDict, t } from "../src/i18n/index.ts";
import { competitionLabel } from "../src/lib/match.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "../src/data/matches.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SEND_SECRET = process.env.SEND_SECRET;

const HOUR = 60 * 60 * 1000;

function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function rivalOf(m) {
  return m.homeTeam === "Boca" ? m.awayTeam : m.homeTeam;
}

function startDate(m) {
  if (!m.time) return null;
  const d = new Date(`${m.date}T${m.time}:00-03:00`); // Argentina (UTC-3)
  return Number.isNaN(d.getTime()) ? null : d;
}

async function send(payload) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SEND_SECRET}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

export function buildNotification(m, lang) {
  const dict = getDict(lang);
  const rival = rivalOf(m);
  const matchId = `${m.date}-${slug(rival)}`;

  let aggregate = "";
  if (m.aggregate) {
    const hasPen =
      m.aggregate.penaltyBoca !== undefined && m.aggregate.penaltyRival !== undefined;
    aggregate = t(
      dict,
      hasPen ? "push.aggregatePenalties" : "push.aggregate",
      {
        boca: m.aggregate.bocaScore,
        rival: m.aggregate.rivalScore,
        penBoca: m.aggregate.penaltyBoca,
        penRival: m.aggregate.penaltyRival,
      },
    );
  }

  const body = t(dict, "push.body", {
    rival,
    aggregate,
    time: m.time ? t(dict, "push.time", { time: m.time }) : "",
    competition: m.competition
      ? t(dict, "push.competition", { competition: competitionLabel(m, dict) })
      : "",
  });

  return {
    matchId,
    type: "h1",
    lang,
    title: t(dict, "push.title"),
    body,
    url: lang === "en" ? "./en/#partidos" : "./#partidos",
  };
}

async function main() {
  if (!SUPABASE_URL || !SEND_SECRET) {
    console.log("[notify] SUPABASE_URL/SEND_SECRET no configurados; nada que hacer.");
    return;
  }

  const raw = await readFile(DATA_FILE, "utf8");
  const data = JSON.parse(raw);
  const matches = data.matches ?? [];
  const now = new Date();

  const due = [];

  for (const m of matches) {
    if (m.status === "finished") continue;

    const start = startDate(m);
    if (!start) continue;
    const diff = start.getTime() - now.getTime();

    // Único aviso: 1 hora antes del inicio (ES y EN).
    if (diff > 0 && diff <= HOUR) {
      due.push(buildNotification(m, "es"), buildNotification(m, "en"));
    }
  }

  if (due.length === 0) {
    console.log("[notify] sin avisos debidos.");
    return;
  }

  for (const payload of due) {
    try {
      const { status, body } = await send(payload);
      console.log(`[notify] ${payload.type} ${payload.matchId} → HTTP ${status} ${body}`);
    } catch (err) {
      console.error(`[notify] error enviando ${payload.type} ${payload.matchId}:`, err);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("[notify] error:", err);
    process.exit(1);
  });
}
