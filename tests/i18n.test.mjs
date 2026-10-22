// Tests de la capa i18n: paridad de claves entre español e inglés, placeholders,
// resolución de claves y rutas alternadas ES/EN.
//   node --test tests/

import { test } from "node:test";
import assert from "node:assert/strict";

import { es } from "../src/i18n/es.ts";
import { en } from "../src/i18n/en.ts";
import { t, tx, getDict, HTML_LANG, OG_LOCALE } from "../src/i18n/index.ts";
import { esPath, enPath, withSlash, localeBase } from "../src/i18n/routes.ts";
import { scanInventory } from "../scripts/i18n-inventory.mjs";

/**
 * Aplana el diccionario a entradas `ruta → valor`.
 * La ruta es una lista de segmentos (las claves pueden tener puntos, p.ej. "arg.1").
 */
function flatten(obj, prefix = []) {
  const out = new Map();
  for (const [k, v] of Object.entries(obj)) {
    const path = [...prefix, k];
    if (Array.isArray(v)) {
      out.set(path.join("."), v);
      v.forEach((item, i) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          for (const [k2, v2] of flatten(item, [...path, String(i)])) {
            out.set(k2, v2);
          }
        }
      });
    } else if (v && typeof v === "object") {
      for (const [k2, v2] of flatten(v, path)) out.set(k2, v2);
    } else {
      out.set(path.join("."), v);
    }
  }
  return out;
}

/** Placeholders `{algo}` de un texto. */
function placeholders(s) {
  return [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

test("es y en tienen exactamente las mismas claves", () => {
  const esKeys = [...flatten(es).keys()].sort();
  const enKeys = [...flatten(en).keys()].sort();
  const missing = esKeys.filter((k) => !enKeys.includes(k));
  const extra = enKeys.filter((k) => !esKeys.includes(k));
  assert.deepEqual(missing, [], `faltan en inglés: ${missing.join(", ")}`);
  assert.deepEqual(extra, [], `sobran en inglés: ${extra.join(", ")}`);
});

test("no hay textos vacíos en los diccionarios", () => {
  for (const [locale, dict] of [["es", es], ["en", en]]) {
    for (const [k, value] of flatten(dict)) {
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item !== "string") return;
          assert.ok(item.trim().length > 0, `${locale}.${k}[${i}] está vacío`);
        });
        continue;
      }
      assert.equal(typeof value, "string", `${locale}.${k} no es un string`);
      assert.ok(value.trim().length > 0, `${locale}.${k} está vacío`);
    }
  }
});

test("los placeholders de ES y EN coinciden", () => {
  const esFlat = flatten(es);
  const enFlat = flatten(en);
  for (const [k, value] of esFlat) {
    const enValue = enFlat.get(k);
    if (!enValue || typeof value !== "string" || typeof enValue !== "string") continue;
    assert.deepEqual(
      placeholders(enValue),
      placeholders(value),
      `placeholders distintos en "${k}": es=${value} / en=${enValue}`,
    );
  }
});

test("los meses y los días de la semana están completos", () => {
  assert.equal(es.months.length, 12);
  assert.equal(en.months.length, 12);
  assert.equal(es.weekdays.length, 7);
  assert.equal(en.weekdays.length, 7);
  assert.equal(es.monthsShort.length, 12);
  assert.equal(en.monthsShort.length, 12);
});

test("t() resuelve claves con notación de punto y reemplaza placeholders", () => {
  assert.equal(t(es, "nav.home"), "Inicio");
  assert.equal(t(en, "nav.home"), "Home");
  assert.equal(t(es, "rounds.matchday", { n: 13 }), "Fecha 13");
  assert.equal(t(en, "rounds.matchday", { n: 13 }), "Matchday 13");
});

test("t() deja la clave sin traducir si no existe", () => {
  assert.equal(t(es, "no.existe.clave"), "no.existe.clave");
});

test("t() no rompe cuando un placeholder no viene", () => {
  assert.equal(t(es, "seo.venue"), " en {venue}");
});

test("tx() usa el locale y cae en español si no existe", () => {
  assert.equal(tx("en", "nav.home"), "Home");
  assert.equal(tx("fr", "nav.home"), "Inicio");
  assert.equal(tx(undefined, "nav.home"), "Inicio");
});

test("getDict devuelve el diccionario pedido", () => {
  assert.equal(getDict("es"), es);
  assert.equal(getDict("en"), en);
  assert.equal(getDict("xx"), es);
});

test("los metadatos de locale son los esperados", () => {
  assert.equal(HTML_LANG.es, "es-AR");
  assert.equal(HTML_LANG.en, "en");
  assert.equal(OG_LOCALE.es, "es_AR");
  assert.equal(OG_LOCALE.en, "en_US");
});

test("esPath y enPath son inversos sobre las rutas del sitio", () => {
  const noSlash = (p) => (p.length > 1 ? p.replace(/\/$/, "") : p);
  const paths = ["/", "/partidos/", "/partidos/2026-10-13-vasco-da-gama/", "/info/", "/rivales/talleres/"];
  for (const p of paths) {
    assert.equal(noSlash(esPath(enPath(p))), noSlash(p));
    assert.equal(
      noSlash(enPath(esPath(p))),
      noSlash(p) === "/" ? "/en" : `/en${noSlash(p)}`,
    );
  }
});

test("el prefijo /en se maneja sin duplicar", () => {
  assert.equal(esPath("/en"), "/");
  assert.equal(enPath("/en"), "/en");
  assert.equal(esPath("/en/partidos/"), "/partidos");
  assert.equal(enPath("/partidos/"), "/en/partidos");
});

test("withSlash normaliza la barra final", () => {
  assert.equal(withSlash("/partidos"), "/partidos/");
  assert.equal(withSlash("/partidos/"), "/partidos/");
  assert.equal(withSlash(""), "/");
});

test("localeBase devuelve el prefijo de URLs internas", () => {
  assert.equal(localeBase("es"), "");
  assert.equal(localeBase("en"), "/en");
});

test("no queda ninguna cadena en español literal fuera del diccionario", () => {
  const { spanishHits, report } = scanInventory();
  const detalle = report
    .flatMap((r) => r.spanish.map((s) => `${r.file}:${s.line} ${JSON.stringify(s.value)}`))
    .join("\n  ");
  assert.equal(spanishHits, 0, `textos sin traducir:\n  ${detalle}`);
});
