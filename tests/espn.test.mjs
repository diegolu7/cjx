// Tests de contrato del normalizador ESPN → Match del sitio.
//   node --test tests/

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  artDateTime,
  buildMatches,
  canonicalTeamName,
  canonicalVenueName,
  isBocaEvent,
  matchSlug,
  normalizeEvent,
  teamLogo,
} from "../scripts/lib/espn.mjs";

const LIGA = { slug: "arg.1", name: "Liga Profesional", twoLegs: false };
const SUDAMERICANA = { slug: "conmebol.sudamericana", name: "Copa Sudamericana", twoLegs: true };

/** Evento ESPN mínimo con la forma real del scoreboard. */
function espnEvent({
  id = "401913958",
  date = "2026-10-14T00:30Z",
  seasonSlug = "torneo-2026",
  state = "post",
  homeId = "5",
  homeName = "Boca Juniors",
  homeScore = "2",
  awayId = "3454",
  awayName = "Vasco da Gama",
  awayScore = "1",
  venue = "Alberto José Armando (La Bombonera)",
  city = "Buenos Aires",
} = {}) {
  return {
    id,
    date,
    season: { year: 2026, slug: seasonSlug },
    competitions: [
      {
        id,
        date,
        venue: { fullName: venue, address: { city } },
        status: {
          type: {
            state,
            completed: state === "post",
          },
        },
        competitors: [
          { homeAway: "home", score: homeScore, team: { id: homeId, displayName: homeName } },
          { homeAway: "away", score: awayScore, team: { id: awayId, displayName: awayName } },
        ],
      },
    ],
  };
}

test("artDateTime convierte UTC a hora Argentina (-03:00)", () => {
  const r = artDateTime("2026-10-14T00:30Z");
  assert.equal(r.date, "2026-10-13");
  assert.equal(r.time, "21:30");
  assert.equal(r.dayLabel, "MAR");
});

test("artDateTime devuelve null ante una fecha inválida", () => {
  assert.equal(artDateTime("no-es-fecha"), null);
});

test("canonicalTeamName normaliza Boca y los TBD", () => {
  assert.equal(canonicalTeamName("Boca Juniors"), "Boca");
  assert.equal(canonicalTeamName("TBD"), "Por definir");
  assert.equal(canonicalTeamName(""), "Por definir");
});

test("canonicalVenueName normaliza los nombres largos de ESPN", () => {
  assert.equal(canonicalVenueName("Alberto José Armando (La Bombonera)"), "La Bombonera");
  assert.equal(canonicalVenueName("Estadio José Amalfitani"), "Estadio José Amalfitani");
  assert.equal(canonicalVenueName(""), undefined);
});

test("teamLogo arma la URL del CDN de ESPN", () => {
  assert.equal(teamLogo("5"), "https://a.espncdn.com/i/teamlogos/soccer/500/5.png");
  assert.equal(teamLogo(undefined), undefined);
});

test("matchSlug usa la fecha y el rival", () => {
  assert.equal(matchSlug("2026-10-13", "Boca", "Vasco da Gama"), "2026-10-13-vasco-da-gama");
  assert.equal(matchSlug("2026-10-13", "River Plate", "Boca"), "2026-10-13-river-plate");
});

test("isBocaEvent detecta el equipo por id", () => {
  assert.equal(isBocaEvent(espnEvent()), true);
  assert.equal(
    isBocaEvent(
      espnEvent({ homeId: "20", awayId: "21", homeName: "River Plate", awayName: "Racing" }),
    ),
    false,
  );
});

test("normalizeEvent mapea un partido finalizado", () => {
  const m = normalizeEvent(espnEvent(), LIGA);
  assert.equal(m.homeTeam, "Boca");
  assert.equal(m.awayTeam, "Vasco da Gama");
  assert.equal(m.homeScore, 2);
  assert.equal(m.awayScore, 1);
  assert.equal(m.status, "finished");
  assert.equal(m.date, "2026-10-13");
  assert.equal(m.time, "21:30");
  assert.equal(m.venue, "La Bombonera");
  assert.equal(m.venueCity, "Buenos Aires");
  assert.equal(m.homeLogo, "https://a.espncdn.com/i/teamlogos/soccer/500/5.png");
});

test("normalizeEvent reconoce el estado 'in' como live", () => {
  const m = normalizeEvent(espnEvent({ state: "in", homeScore: "1", awayScore: "1" }), LIGA);
  assert.equal(m.status, "live");
  assert.equal(m.homeScore, 1);
});

test("normalizeEvent no inventa marcador en partidos programados", () => {
  const m = normalizeEvent(espnEvent({ state: "pre", homeScore: "0", awayScore: "0" }), LIGA);
  assert.equal(m.status, "scheduled");
  assert.equal(m.homeScore, undefined);
  assert.equal(m.awayScore, undefined);
});

test("normalizeEvent ordena local y visitante según el lado de Boca", () => {
  const m = normalizeEvent(
    espnEvent({ homeId: "3454", homeName: "Vasco da Gama", awayId: "5", awayName: "Boca Juniors" }),
    LIGA,
  );
  assert.equal(m.homeTeam, "Vasco da Gama");
  assert.equal(m.awayTeam, "Boca");
  assert.equal(m.rival, "Vasco da Gama");
});

test("buildMatches numera las fechas de la Liga según el índice de Boca", () => {
  const raw = [
    { raw: espnEvent({ id: "1", date: "2026-02-01T00:30Z", awayName: "San Lorenzo" }), leagueDef: LIGA },
    { raw: espnEvent({ id: "2", date: "2026-02-08T00:30Z", awayName: "Independiente" }), leagueDef: LIGA },
    { raw: espnEvent({ id: "3", date: "2026-02-15T00:30Z", awayName: "River Plate" }), leagueDef: LIGA },
  ];
  const matches = buildMatches(raw);
  assert.deepEqual(
    matches.map((m) => m.round),
    ["Fecha 1", "Fecha 2", "Fecha 3"],
  );
  assert.equal(matches[0].slug, "2026-01-31-san-lorenzo");
  assert.equal(matches[0].competition, "Liga Profesional");
  assert.equal(matches[0].status, "finished");
});

test("buildMatches arma Ida/Vuelta y el global en la pata de vuelta", () => {
  const raw = [
    {
      raw: espnEvent({
        id: "10",
        date: "2026-10-13T00:30Z",
        seasonSlug: "semifinals",
        homeScore: "0",
        awayScore: "1",
      }),
      leagueDef: SUDAMERICANA,
    },
    {
      raw: espnEvent({
        id: "11",
        date: "2026-10-21T00:30Z",
        seasonSlug: "semifinals",
        homeId: "3454",
        homeName: "Vasco da Gama",
        awayId: "5",
        awayName: "Boca Juniors",
        homeScore: "1",
        awayScore: "3",
      }),
      leagueDef: SUDAMERICANA,
    },
  ];
  const matches = buildMatches(raw);
  const [ida, vuelta] = matches;
  assert.equal(ida.round, "Semifinales - Ida");
  assert.equal(vuelta.round, "Semifinales - Vuelta");
  assert.equal(ida.aggregate, undefined);
  assert.deepEqual(vuelta.aggregate, { bocaScore: 3, rivalScore: 2 });
});

test("buildMatches ignora las etapas de playoff al numerar las fechas", () => {
  const raw = [
    { raw: espnEvent({ id: "1", date: "2026-02-01T00:30Z" }), leagueDef: LIGA },
    {
      raw: espnEvent({
        id: "2",
        date: "2026-06-01T00:30Z",
        seasonSlug: "apertura---round-of-16",
        awayName: "Lanus",
      }),
      leagueDef: LIGA,
    },
    { raw: espnEvent({ id: "3", date: "2026-02-08T00:30Z", awayName: "Racing" }), leagueDef: LIGA },
  ];
  const matches = buildMatches(raw);
  const conFecha = matches.filter((m) => m.round?.startsWith("Fecha"));
  assert.deepEqual(
    conFecha.map((m) => m.round),
    ["Fecha 1", "Fecha 2"],
  );
});
