// Parser puro del CSV del Google Sheet → array de partidos (Match).
// Se usa en build-time (scripts/snapshot.mjs). Sin dependencias de navegador.

export const SHEET_ID = "1kqtU0JAyqtQ9NY2Jm-94eXxHQCNMLnc2C9Sd_hM69Xw";
export const SHEET_GID = "0";

export const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;
export const SHEET_CSV_URL_ALIAS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

const COL = {
  estado: "Estado",
  fecha: "Fecha",
  hora: "Hora",
  condicion: "Condición",
  rival: "Rival",
  golesBoca: "Goles Boca",
  golesRival: "Goles Rival",
  torneo: "Torneo",
  fase: "Fase",
  canal: "Canal",
  lugar: "Lugar",
  globalBoca: "Global Boca",
  globalRival: "Global Rival",
  penalesBoca: "Penales Boca",
  penalesRival: "Penales Rival",
};

const DIAS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

export const DEMO_MATCHES = [
  {
    id: "demo-1",
    date: "2026-08-29",
    homeTeam: "Boca",
    awayTeam: "Lanús",
    homeScore: 1,
    awayScore: 0,
    competition: "Liga Prof.",
    round: "Fecha 7",
    status: "finished",
  },
  {
    id: "demo-2",
    date: "2026-09-03",
    homeTeam: "Racing",
    awayTeam: "Boca",
    homeScore: 0,
    awayScore: 2,
    competition: "Liga Prof.",
    round: "Fecha 8",
    status: "finished",
  },
  {
    id: "demo-3",
    date: "2026-09-08",
    dayLabel: "SAB",
    time: "21:30",
    homeTeam: "Boca",
    awayTeam: "Sao Paulo",
    competition: "Copa Sudamericana",
    round: "Cuartos de Final · Ida",
    channel: "ESPN",
    status: "next",
  },
  {
    id: "demo-4",
    date: "2026-09-11",
    homeTeam: "Boca",
    awayTeam: "Central Córdoba",
    competition: "Liga Prof.",
    round: "Fecha 9",
    status: "scheduled",
  },
  {
    id: "demo-5",
    date: "2026-09-15",
    homeTeam: "Sao Paulo",
    awayTeam: "Boca",
    competition: "Copa Sudamericana",
    round: "Cuartos de Final · Vuelta",
    status: "scheduled",
  },
  {
    id: "demo-6",
    date: "2026-09-20",
    homeTeam: "Boca",
    awayTeam: "San Lorenzo",
    competition: "Liga Prof.",
    round: "Fecha 10",
    channel: "ESPN",
    status: "scheduled",
  },
];

export function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch === "\r") {
      // ignorar
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeToISO(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";

  let m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;

  m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(s);
  if (m) return `${m[3]}-${pad2(m[2])}-${pad2(m[1])}`;

  m = /^(\d{1,2})[-/](\d{1,2})$/.exec(s);
  if (m) return `${new Date().getFullYear()}-${pad2(m[2])}-${pad2(m[1])}`;

  return "";
}

function weekdayLabel(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return undefined;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return DIAS[date.getDay()];
}

function parseScore(raw) {
  const s = String(raw || "").trim();
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function rowToMatch(row, index) {
  const estado = row.estado.trim().toLowerCase();
  const rival = row.rival.trim() || "—";
  const local = row.condicion.trim().toLowerCase() !== "visitante";

  const iso = normalizeToISO(row.fecha);
  const status =
    estado === "finalizado"
      ? "finished"
      : estado === "próximo" || estado === "proximo"
        ? "next"
        : "scheduled";

  // Resultado global: solo en la pata de Vuelta, si el GAS cargó Global Boca/Rival.
  const esVuelta = /\bvuelta\b/i.test(row.fase);
  const gb = parseScore(row.globalBoca);
  const gr = parseScore(row.globalRival);
  const aggregate =
    esVuelta && gb !== undefined && gr !== undefined
      ? {
          bocaScore: gb,
          rivalScore: gr,
          penaltyBoca: parseScore(row.penalesBoca),
          penaltyRival: parseScore(row.penalesRival),
        }
      : undefined;

  return {
    id: `sheet-${index}`,
    date: iso || row.fecha.trim(),
    dayLabel: status === "next" ? weekdayLabel(iso) : undefined,
    time: row.hora.trim() || undefined,
    homeTeam: local ? "Boca" : rival,
    awayTeam: local ? rival : "Boca",
    homeScore: parseScore(row.golesBoca),
    awayScore: parseScore(row.golesRival),
    competition: row.torneo.trim() || "—",
    round: row.fase.trim() || undefined,
    channel: row.canal.trim() || undefined,
    venue: row.lugar.trim() || undefined,
    status,
    aggregate,
  };
}

function pickIdx(row, idx) {
  return idx === undefined ? "" : (row[idx] ?? "").trim();
}

function keepSingleNext(matches) {
  const candidates = matches
    .filter((m) => m.status === "next")
    .slice()
    .sort((a, b) => sortDateAsc(a.date, b.date));
  if (candidates.length === 0) return matches;
  const chosen = candidates[0];
  return matches.map((m) =>
    m.status === "next" && m.id !== chosen.id ? { ...m, status: "scheduled" } : m,
  );
}

export function ordenarCronologico(matches) {
  const past = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => sortDateAsc(a.date, b.date));
  const next = matches
    .filter((m) => m.status === "next")
    .sort((a, b) => sortDateAsc(a.date, b.date));
  const future = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => sortDateAsc(a.date, b.date));

  const result = [...past];
  if (next.length > 0) result.push(next[0]);
  result.push(...future);

  if (next.length === 0 && result.length > 0) {
    const firstFuture = result.findIndex((m) => m.status === "scheduled");
    if (firstFuture >= 0) result[firstFuture] = { ...result[firstFuture], status: "next" };
  }

  return result;
}

function sortDateAsc(a, b) {
  return parseDisplayDate(a).getTime() - parseDisplayDate(b).getTime();
}

function parseDisplayDate(date) {
  const iso = normalizeToISO(date);
  if (iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const ms = new Date(date).getTime();
  return Number.isNaN(ms) ? new Date(0) : new Date(ms);
}

function isTodayOrFuture(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return parseDisplayDate(date).getTime() >= today.getTime();
}

/** CSV → Match[] ordenado y filtrado. */
export function parseMatches(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.trim());
  const idx = {};
  header.forEach((h, i) => {
    const lower = h.toLowerCase();
    if (lower === COL.estado.toLowerCase()) idx.estado = i;
    else if (lower === COL.fecha.toLowerCase()) idx.fecha = i;
    else if (lower === COL.hora.toLowerCase()) idx.hora = i;
    else if (lower === COL.condicion.toLowerCase()) idx.condicion = i;
    else if (lower === COL.rival.toLowerCase()) idx.rival = i;
    else if (lower === COL.golesBoca.toLowerCase()) idx.golesBoca = i;
    else if (lower === COL.golesRival.toLowerCase()) idx.golesRival = i;
    else if (lower === COL.torneo.toLowerCase()) idx.torneo = i;
    else if (lower === COL.fase.toLowerCase()) idx.fase = i;
    else if (lower === COL.canal.toLowerCase()) idx.canal = i;
    else if (lower === COL.lugar.toLowerCase()) idx.lugar = i;
    else if (lower === COL.globalBoca.toLowerCase()) idx.globalBoca = i;
    else if (lower === COL.globalRival.toLowerCase()) idx.globalRival = i;
    else if (lower === COL.penalesBoca.toLowerCase()) idx.penalesBoca = i;
    else if (lower === COL.penalesRival.toLowerCase()) idx.penalesRival = i;
  });

  if (idx.estado === undefined || idx.rival === undefined) return [];

  const matches = [];
  const seen = new Set();
  for (let r = 1; r < rows.length; r++) {
    const row = {
      estado: pickIdx(rows[r], idx.estado),
      fecha: pickIdx(rows[r], idx.fecha),
      hora: pickIdx(rows[r], idx.hora),
      condicion: pickIdx(rows[r], idx.condicion),
      rival: pickIdx(rows[r], idx.rival),
      golesBoca: pickIdx(rows[r], idx.golesBoca),
      golesRival: pickIdx(rows[r], idx.golesRival),
      torneo: pickIdx(rows[r], idx.torneo),
      fase: pickIdx(rows[r], idx.fase),
      canal: pickIdx(rows[r], idx.canal),
      lugar: pickIdx(rows[r], idx.lugar),
      globalBoca: pickIdx(rows[r], idx.globalBoca),
      globalRival: pickIdx(rows[r], idx.globalRival),
      penalesBoca: pickIdx(rows[r], idx.penalesBoca),
      penalesRival: pickIdx(rows[r], idx.penalesRival),
    };
    if (!row.estado && !row.rival) continue;

    const key = [row.fecha, row.hora, row.rival, row.torneo, row.fase].join("|").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    matches.push(rowToMatch(row, r));
  }

  const vigentes = matches.filter((m) => m.status === "finished" || isTodayOrFuture(m.date));
  return ordenarCronologico(keepSingleNext(vigentes));
}
