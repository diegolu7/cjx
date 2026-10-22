# Plan — Sitio bilingüe (ES/EN) con detección del idioma del navegador

> Estado: **propuesta, sin implementar**.
> Objetivo: que el sitio se lea en inglés para quien llega con el navegador en
> inglés, sin romper el SEO en español ni las URLs ya indexadas.
> Decisión de datos de referencia: **ESPN** (`docs/datos-espn.md`).

---

## 0. TL;DR — 3 decisiones que hay que tomar antes de escribir código

| # | Decisión | Recomendación | Alternativa |
|---|---|---|---|
| 1 | ¿Qué URLs para el inglés? | `/en/...` con **los mismos paths** (`/en/partidos/…`) | paths en inglés (`/en/matches/…`) |
| 2 | ¿Cómo se detecta el idioma? | **JS en el cliente** (primera visita, con cookie) + switcher siempre visible | banner sin redirect / Worker de Cloudflare |
| 3 | ¿Dónde viven los textos? | `src/i18n/es.ts` (fuente de verdad) + `src/i18n/en.ts` **tipado contra el primero** | JSON suelto / Content Collections |

Todo lo demás de este documento es la implementación de esas tres.

---

## 1. Objetivo y no-objetivos

**Objetivo**

- Version en inglés de **todas** las páginas: home, `/partidos`, ficha de partido,
  `/rivales`, `/torneos`, legales, 404, API y OG.
- El visitante que llega con `Accept-Language: en` ve la versión en inglés
  **sin hacer nada**.
- SEO: las dos versiones se indexan con `hreflang`, sin duplicar contenido ni
  perder las URLs actuales.

**No-objetivo (por ahora)**

- Más de 2 idiomas (el código queda preparado: agregar un locale es agregar un archivo).
- Traducir nombres propios de clubes (son nombres propios: "River Plate").
- Traducir el contenido editorial de los partidos (hoy es automático; si algún día
  hay texto manual, se agrega el campo `lang`).

---

## 2. Arquitectura

### 2.1 URLs

```
/                       → español (default, sin prefijo)   ← las URLs de hoy no cambian
/en/                    → inglés
/en/partidos/           → /partidos/ en inglés
/en/partidos/{slug}/    → misma ruta que en español
```

Configuración en `astro.config.mjs`:

```js
i18n: {
  defaultLocale: "es",
  locales: ["es", "en"],
  routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
}
```

- `prefixDefaultLocale: false` → el español queda en la raíz (no se pierde SEO).
- `Astro.currentLocale` devuelve `"es"` o `"en"` en cada página.
- El **slug del partido no se traduce**: `2026-11-08-defensa-y-justicia` es el mismo
  en los dos idiomas (evita 404 y canonicals cruzados).

### 2.2 Textos: TypeScript tipado, no JSON

```
src/i18n/
├── es.ts        ← fuente de verdad (objeto plano de claves)
├── en.ts        ← tipado contra es.ts
└── index.ts     ← getDictionary(locale) + t()
```

`en.ts` se fuerza a tener las mismas claves:

```ts
import type { es } from "./es";
export const en: typeof es = { /* … */ };
```

→ si falta una clave en inglés, **falla el typecheck** (`npm run check`), no se rompe
en producción.

Las funciones de `src/lib/match.ts` (que hoy devuelven texto en español: `statusLabel`,
`fechaLarga`, `countdownText`, `faqFor`, `autoPrevia`, `factsFor`, `titleFor`…) pasan a
recibir el diccionario: `statusLabel(m.status, dict)`.

### 2.3 Datos: códigos, no textos

**Hoy el snapshot guarda texto en español** y eso bloquea la traducción:

```jsonc
// src/data/matches.json (hoy)
{ "competition": "Liga Profesional", "round": "Fecha 13" }
```

Con el cambio, el snapshot guarda **códigos** y cada idioma los formatea:

```jsonc
// src/data/matches.json (propuesto)
{
  "competitionCode": "arg.1",
  "roundType": "matchday",     // "matchday" | "phase" | "group"
  "roundNumber": 13,
  "roundPhase": "semifinals",  // slug de la fase
  "leg": "ida"                 // "ida" | "vuelta"
}
```

Y el diccionario los traduce:

```ts
competitions: {
  "arg.1": "Liga Profesional",                              // es
  "conmebol.sudamericana": "Copa Sudamericana",
},
competitionsEn: {
  "arg.1": "Argentine Primera División",                     // en
  "conmebol.sudamericana": "Copa Sudamericana",
},
rounds: { matchday: "Fecha {n}", phase: "{phase}", leg: { ida: "Ida", vuelta: "Vuelta" } },
roundsEn: { matchday: "Matchday {n}", phase: "{phase}", leg: { ida: "First leg", vuelta: "Second leg" } },
```

**Impacto:** hay que tocar `scripts/lib/espn.mjs` (normalizador), `src/types/match.ts`
(contrato) y `scripts/lib/agenda.mjs` (orden/filtros). Es la fase más delicada: es el
único punto donde el dato "habla" un idioma.

> Alternativa más barata: dejar `competition`/`round` como texto y **solo** traducir
> lo que el usuario ve en las páginas, dejando los textos de `round` en español en la
> versión EN. Se descarta: "Fecha 13" y "Semifinales - Ida" en una página en inglés
> se ven rotos.

### 2.4 Detección del idioma del navegador

El sitio es **SSG**: no hay servidor que mire el `Accept-Language`. La detección se
hace en el cliente, con un script inline en el `<head>` (antes del paint, ~400 bytes).

```html
<script is:inline>
  (function () {
    var LANG_KEY = "cjx_lang";
    var pref = (localStorage.getItem(LANG_KEY) || "");
    if (!pref) {
      pref = (navigator.languages || [navigator.language || ""])[0] || "";
      pref = pref.split("-")[0].toLowerCase();
      if (pref !== "en" && pref !== "es") pref = "";
    }
    if (!pref) return;                       // sin preferencia → no redirigir
    try { localStorage.setItem(LANG_KEY, pref); } catch (e) {}
    if (pref === "en" && !location.pathname.startsWith("/en")) {
      var p = location.pathname.replace(/^\//, "");
      location.replace("/en/" + p + location.search + location.hash);
    }
  })();
</script>
```

**Reglas**

1. Si el usuario ya eligió idioma (switcher) → manda esa elección, no se redirige.
2. Se redirige **solo** en la primera visita (sin preferencia guardada).
3. Solo redirige si el idioma del navegador es claramente `en` o `es`.
4. Nunca redirige dentro de `/en/` (evita loops).
5. `location.replace` (no `assign`) → el redirect no queda en el historial.

**Riesgo SEO:** Googlebot ejecuta JS, así que puede acabar indexando `/en/` para
usuarios argentinos. Mitigaciones:

- `hreflang` + `canonical` en ambas versiones (cada una canónica de sí misma).
- `x-default` → apunta a la versión española.
- Los textos EN y ES son **distintos** (traducción real, no automática) → Google los
  trata como páginas diferentes, no como duplicados.
- Interruptor de emergencia: `AUTO_REDIRECT=false` en `astro.config.mjs` → apaga el
  redirect y deja solo el banner + switcher.

**Alternativa B (la más "correcta" para SEO):** un **Worker de Cloudflare** delante de
GitHub Pages que hace `302` según `Accept-Language`. El repo ya tiene
`workers/cron-dispatcher` (Cloudflare Workers) → es el mismo patrón. Ventaja: redirect
real de servidor, Google lo entiende mejor. Coste: una capa más de red y tener que
proxyar el origen de Pages.

**Alternativa C (la más simple):** no redirigir; mostrar un banner
"This site is also available in English" + switcher en el header. Cero riesgo SEO.

### 2.5 Switcher de idioma

- En el header (desktop y mobile), junto al menú: `ES | EN`.
- En el footer.
- Guarda la preferencia en `localStorage` + cookie `cjx_lang` (1 año) para que el
  redirect no vuelva a molestar.
- `href` con el path equivalente en el otro idioma (mismo slug).
- **Accesibilidad:** `<html lang>` cambia, `aria-label` traducidos, y los links
  tienen `hreflang` + `rel="alternate"`.

---

## 3. Inventario de lo que hay que traducir

Estimado: **~450–500 textos** en 46 archivos. El número exacto sale del inventario
(Fase 0) con un script que extraiga literales.

| Zona | Archivos | Qué hay | Volumen |
|---|---|---|---|
| Helpers de dominio | `src/lib/match.ts` (365 líneas), `src/lib/taxonomy.ts` | estados, fechas, meses, días, cuenta regresiva, FAQ, previa, hechos, títulos/descripciones SEO | ~120 |
| Cards y timeline | `MatchesTimeline.astro`, `match/FixtureLine.astro`, `match/MatchListCard.astro`, `match/MatchHero.astro`, `match/MatchEssentials.astro` |Fixture, badges, fecha/hora, estado, canal | ~80 |
| Ficha de partido | `partidos/[slug].astro`, `match/Lineups.astro`, `match/Pitch.astro`, `match/MatchEvents.astro`, `match/MatchStats.astro`, `match/TechnicalDetails.astro`, `match/MatchPreview.astro`, `match/MatchKeyFacts.astro`, `match/MatchFaq.astro`, `match/RecentForm.astro` | formaciones, eventos, estadísticas, datos técnicos | ~110 |
| Chrome del sitio | `SiteHeader.astro`, `SiteFooter.astro`, `CookieBanner.astro`, `InstallPrompt.astro`, `Notifications.astro`, `ShareButton.astro`, `Analytics.astro` | navegación, cookies, PWA, push, compartir | ~70 |
| Páginas | `index.astro`, `partidos/index.astro`, `rivales/**`, `torneos/**`, `info.astro`, `404.astro`, `contacto.astro`, legales (`cookies`, `privacidad`, `terminos`) | contenido editorial largo | ~90 |
| SEO / feeds / imágenes | `SeoHead.astro`, `layouts/Layout.astro` + `LegalLayout.astro`, `og/[slug].png.ts`, `feed.xml.ts`, `llms.txt.ts`, `api/partidos.json.ts` | metas, JSON-LD, OG, RSS, `llms.txt`, API | ~60 |

**Glosario** (fijar antes de traducir; los nombres propios NO se traducen):

| Español | English |
|---|---|
| Boca (el club) | Boca (el club) |
| Local / Visitante | Home / Away |
| Final / En vivo / Próximo / Previsto | Full-time / Live / Next / Scheduled |
| Fecha N | Matchday N |
| Ida / Vuelta | First leg / Second leg |
| Cuartos de Final | Quarter-finals |
| Semifinales / Final | Semi-finals / Final |
| Liga Profesional | Argentine Primera División |
| Global / Penales | Aggregate / Penalties |
| Titulares / Suplentes | Starting XI / Substitutes |
| Arquero / Defensores / Mediocampistas / Delanteros | Goalkeeper / Defenders / Midfielders / Forwards |
| Faltan X días / h | In X days / X hours |
| Cuándo juega Boca…? | When does Boca play…? |

---

## 4. Fases

Cada fase es un commit revertible.

### Fase 0 — Inventario y glosario (0,5 día)

- [x] Script `scripts/i18n-inventory.mjs` que liste literales traducibles por archivo.
- [x] `docs/glosario.md` con la tabla anterior ampliada y firmada.
- [x] Lista de los textos que **no** se traducen (nombres propios, "Boca", siglas) → §6 de `docs/glosario.md`.

### Fase 1 — Infraestructura i18n (1 día)

- [x] `astro.config.mjs`: bloque `i18n` (§2.1).
- [x] `src/i18n/es.ts` (se mueve lo que ya está hardcodeado), `en.ts`, `index.ts`.
- [x] `getDictionary(Astro.currentLocale)` y helper `t()` → `getDict()` + `t()`/`tx()`.
- [x] `<html lang>` dinámico en `Layout.astro` + `LegalLayout.astro`.
- [x] `SeoHead.astro`: `og:locale`, `hreflang`, `canonical` por locale.
- [x] Test de contrato: `es` y `en` tienen las mismas claves (`tests/i18n.test.mjs`).

### Fase 2 — Snapshot con códigos (1,5 días) ⚠️ la fase crítica

- [x] `src/types/match.ts`: `competitionCode`, `roundType`, `roundNumber`, `roundPhase`, `leg`.
- [x] `scripts/lib/espn.mjs`: guardar los códigos en vez de los textos.
- [x] `scripts/lib/agenda.mjs`: los filtros que comparan `round` pasan a comparar códigos.
- [x] `src/lib/match.ts`: `competitionLabel(m, dict)` / `roundLabel(m, dict)`.
- [x] Tests existentes actualizados + test nuevo de round/idempotencia del snapshot.

### Fase 3 — Componentes y páginas (3–4 días)

- [x] `src/lib/match.ts` completo (los ~25 helpers reciben el diccionario).
- [x] Cards, timeline, fixture, hero.
- [x] Ficha de partido: formaciones, eventos, stats, previa, FAQ, datos curiosos.
- [x] Header/footer/banners/share.
- [x] Páginas: home, listado, rivales, torneos, info, 404, legales.

### Fase 4 — SEO (1 día)

- [x] `hreflang` recíproco: `es` ↔ `en` + `x-default`.
- [x] `canonical` por idioma (self-canonical).
- [x] `og:locale` (`es_AR` / `en_US`) + `og:locale:alternate`.
- [x] JSON-LD `inLanguage` por locale.
- [x] Sitemap con las dos versiones (`@astrojs/sitemap` ya soporta i18n: `i18n: { defaultLocale, locales }`).
- [x] `feed.xml` y `llms.txt` en ambos idiomas.
- [x] OG images: una por idioma (`/og/{slug}.png` y `/en/og/{slug}.png`).
- [x] `robots.txt` sin cambios.

### Fase 5 — Detección del navegador (1 día)

- [x] Script inline de §2.4 + `localStorage` (la cookie quedó como `localStorage` + `cjx:lang`).
- [x] Switcher ES/EN en header y footer.
- [ ] Banner "disponible en inglés" (opción A elegida: no hace falta banner).
- [ ] `AUTO_REDIRECT` como flag en `astro.config.mjs` (queda pendiente; hoy el redirect es siempre activo).
- [ ] Test manual: navegar con `navigator.language = "en-US"` → `/en/`.

### Fase 6 — Notificaciones push (0,5 día)

- [x] `scripts/notify.mjs`: mensajes por idioma según la preferencia del suscriptor.
- [x] `supabase/migrations/0004_prefs_lang.sql`: columna `lang` en las preferencias.
- [x] El alta de suscripción guarda el idioma del navegador.

### Fase 7 — QA y cierre (1 día)

- [ ] Recorrido manual de las 2 versiones en 320 / 375 / 900 / 1280 px.
- [x] `npm test` + `npm run check` + `npm run build` (el build pasa de 28 a 55 páginas).
- [x] Checklist de paridad: ninguna cadena en español literal fuera de `src/i18n/es.ts` (lo controla `scripts/i18n-inventory.mjs --check`, dentro de `npm test`).
- [ ] Verificar en Search Console el Alternate y el canonical.

**Total estimado: 9–11 días de trabajo.**

---

## 5. SEO: cómo se evita el "duplicate content"

| Señal | Español | Inglés |
|---|---|---|
| URL | `/partidos/{slug}/` | `/en/partidos/{slug}/` |
| `canonical` | self | self |
| `hreflang` | `es-AR`, `en-US` (recíprocos) | idem |
| `x-default` | → `/` (español) | idem |
| `<html lang>` | `es-AR` | `en-US` |
| `og:locale` | `es_AR` | `en_US` |
| JSON-LD `inLanguage` | `es-AR` | `en-US` |

Los textos son distintos de verdad (traducción real) → Google indexa las dos versiones
para sus respectivos idiomas.

---

## 6. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Redirect por JS confunde a Google | Medio | `hreflang` + canonical + flag `AUTO_REDIRECT`; fallback: banner |
| Faltan claves en EN | Alto (texto en español en la versión EN) | Tipado `typeof es` → falla el typecheck |
| Se rompe el snapshot al cambiar el contrato | Alto | Fase 2 con tests de contrato + snapshot idempotente |
| Doble contenido de las fichas | Medio | Slugs iguales pero contenido distinto + canonical + hreflang |
| Build más pesado (28 → ~56 páginas) | Bajo | 2 min de build, GitHub Pages lo aguanta |
| Equipo / nombres propios mal traducidos | Bajo | Glosario de la Fase 0 |
| Cola de texto mezclada en el snapshot | Medio | Fase 2: solo códigos en el JSON |

---

## 7. Tests

```js
// tests/i18n.test.mjs
test("en tiene las mismas claves que es", () => { /* deepEqual(Object.keys(es), Object.keys(en)) */ });
test("cada clave de es tiene valor en en", () => { /* ninguna cadena vacía */ });
test("no queda español hardcodeado fuera de src/i18n", () => { /* grep sobre src/ */ });
test("las rutas /en/ existen para cada página", () => { /* contra el build */ });
```

Además, un check de paridad en CI: si `en` gana una clave y `es` no, `npm run check` falla.

---

## 8. Decisiones abiertas (para elegir antes de arrancar)

- [ ] ¿ URLs `/en/partidos/...` (mismos paths) o `/en/matches/...` (paths en inglés)?
- [ ] ¿Auto-redirect por JS, banner, o Worker de Cloudflare?
- [ ] ¿Se mantiene `/` en español y el inglés va con prefijo, o al revés?
- [ ] ¿Los nombres de las copas se traducen ("Liga Profesional" → "Argentine Primera División") o se dejan en español?
- [ ] ¿Las horas se muestran en hora Argentina, en la del visitante, o ambas?
- [ ] ¿Las páginas legales se traducen o quedan solo en español con nota?
- [ ] ¿`llms.txt` y el RSS se duplican por idioma o se versionan?
- [ ] ¿Se agrega un tercer idioma (portugués) desde el inicio? El código lo permite.
