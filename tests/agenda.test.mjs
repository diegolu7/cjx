// Tests de las reglas de negocio de la agenda (orden, próximo, vigencia, forma, indexación).
//   node --test tests/

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  computeBocaForm,
  computeDetailsScore,
  esVigente,
  finalizeMatches,
  keepSingleNext,
  matchDateTime,
  ordenarCronologico,
  slugify,
} from "../scripts/lib/agenda.mjs";

function partido({
  id = "1",
  date = "2026-10-01",
  time = "21:30",
  status = "scheduled",
  homeTeam = "Boca",
  awayTeam = "River Plate",
  homeScore,
  awayScore,
} = {}) {
  return { id, date, time, status, homeTeam, awayTeam, homeScore, awayScore, slug: `${date}-${slugify(awayTeam)}` };
}

test("slugify normaliza acentos y signos", () => {
  assert.equal(slugify("Unión de Santa Fe"), "union-de-santa-fe");
  assert.equal(slugify("Talleres (Córdoba)"), "talleres-cordoba");
  assert.equal(slugify("Defensa y Justicia"), "defensa-y-justicia");
});

test("matchDateTime arma el kickoff en hora Argentina", () => {
  const d = matchDateTime(partido({ date: "2026-10-01", time: "21:30" }));
  assert.equal(d.toISOString(), "2026-10-02T00:30:00.000Z");
});

test("matchDateTime cae a 23:59 cuando no hay hora", () => {
  const d = matchDateTime(partido({ date: "2026-10-01", time: "Por definir" }));
  assert.equal(d.toISOString(), "2026-10-02T02:59:00.000Z");
});

test("esVigente deja pasar los finalizados y descarta los viejos", () => {
  assert.equal(esVigente(partido({ status: "finished", date: "2020-01-01" })), true);
  assert.equal(esVigente(partido({ status: "scheduled", date: "2020-01-01" })), false);
  const future = new Date(Date.now() + 48 * 3600000).toISOString().slice(0, 10);
  assert.equal(esVigente(partido({ status: "scheduled", date: future })), true);
});

test("keepSingleNext deja un único partido con status next", () => {
  const out = keepSingleNext([
    partido({ id: "a", date: "2026-11-10", status: "next" }),
    partido({ id: "b", date: "2026-11-01", status: "next" }),
    partido({ id: "c", date: "2026-12-01", status: "scheduled" }),
  ]);
  assert.equal(out.filter((m) => m.status === "next").length, 1);
  assert.equal(out.find((m) => m.status === "next").id, "b");
});

test("ordenarCronologico mantiene los partidos en vivo", () => {
  const out = ordenarCronologico([
    partido({ id: "fin", date: "2026-10-05", status: "finished" }),
    partido({ id: "live", date: "2026-10-20", status: "live" }),
    partido({ id: "next", date: "2026-10-25", status: "next" }),
    partido({ id: "prog", date: "2026-11-01", status: "scheduled" }),
  ]);
  assert.deepEqual(
    out.map((m) => m.id),
    ["fin", "live", "next", "prog"],
  );
});

test("ordenarCronologico promueve a next el primer partido programado", () => {
  const out = ordenarCronologico([
    partido({ id: "fin", date: "2026-10-05", status: "finished" }),
    partido({ id: "prog", date: "2026-11-01", status: "scheduled" }),
  ]);
  assert.equal(out.find((m) => m.id === "prog").status, "next");
});

test("computeBocaForm devuelve los últimos resultados en W/D/L", () => {
  const form = computeBocaForm([
    partido({ id: "1", date: "2026-10-01", status: "finished", homeScore: 2, awayScore: 1 }),
    partido({ id: "2", date: "2026-10-08", status: "finished", homeScore: 1, awayScore: 1 }),
    partido({
      id: "3",
      date: "2026-10-15",
      status: "finished",
      homeTeam: "River Plate",
      awayTeam: "Boca",
      homeScore: 3,
      awayScore: 0,
    }),
  ]);
  assert.deepEqual(form, ["L", "D", "W"]);
});

test("computeDetailsScore pondera alineaciones, eventos y stats", () => {
  assert.equal(computeDetailsScore(undefined), 0);
  assert.equal(computeDetailsScore({}), 0);
  assert.equal(
    computeDetailsScore({
      startersBoca: ["a"],
      startersRival: ["b"],
      events: [{ minute: "1'" }],
      stats: [{ label: "Faltas" }],
    }),
    4,
  );
});

test("finalizeMatches deja 3 finalizados, marca next e indexa los próximos", () => {
  const out = finalizeMatches([
    partido({ id: "f1", date: "2026-09-01", status: "finished", homeScore: 1, awayScore: 0 }),
    partido({ id: "f2", date: "2026-09-08", status: "finished", homeScore: 1, awayScore: 0 }),
    partido({ id: "f3", date: "2026-09-15", status: "finished", homeScore: 1, awayScore: 0 }),
    partido({ id: "f4", date: "2026-09-22", status: "finished", homeScore: 1, awayScore: 0 }),
    partido({ id: "u1", date: "2026-12-01", status: "scheduled" }),
    partido({ id: "u2", date: "2026-12-08", status: "scheduled" }),
    partido({ id: "u3", date: "2026-12-15", status: "scheduled" }),
  ]);

  assert.equal(out.filter((m) => m.status === "finished").length, 3);
  assert.equal(out.filter((m) => m.status === "next").length, 1);
  assert.equal(out.find((m) => m.status === "next").id, "u1");
  assert.equal(out.filter((m) => m.indexable).length, 2);
  assert.equal(out.every((m) => m.bocaForm?.length === 3), true);
});
