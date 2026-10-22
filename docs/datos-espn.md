# datos-espn.md — De dónde salen los partidos (ESPN)

> El sitio dejó de leer el Google Sheet: **la única fuente de verdad es ESPN**.
> El snapshot se regenera solo (cada 15 minutos) y se escribe en
> [`src/data/matches.json`](../src/data/matches.json), que es lo que consume el build.

---

## 1. Flujo

```
site.api.espn.com  ──(scripts/lib/espn.mjs)──▶  src/data/matches.json  ──▶  Astro build  ──▶  dist/
        ▲                                                            │
        └──────────── caché en disco (.cache/espn, TTL 20 min) ─────┘
```

- `npm run snapshot` → descarga, normaliza y escribe `src/data/matches.json`.
- `npm run snapshot:dry` → same, pero **no escribe** el archivo (solo muestra el resumen).
- `npm run test` → tests de contrato del normalizador (`node --test`).

En GitHub Pages el workflow `.github/workflows/deploy.yml` corre el snapshot y el build
cada 15 minutos, así que la agenda se refresca sola sin intervención manual.

---

## 2. Endpoints usados

Base: `https://site.api.espn.com/apis/site/v2/sports/soccer`

| Qué | Endpoint |
|---|---|
| Fixture (pasados **y** futuros) | `{base}/{slug}/scoreboard?dates={AAAA}&limit=600` |
| Partidos jugados (respaldo) | `{base}/{slug}/teams/5/schedule` |
| Próximo partido | `{base}/{slug}/teams/5` (`nextEvent`) |
| Alineaciones, eventos y stats | `{base}/{slug}/summary?event={id}` |

`slug` es el identificador de la competición en ESPN:

| Slug | Competición | Boca (2026) |
|---|---|---|
| `arg.1` | Liga Profesional | 33 partidos |
| `arg.copa` | Copa Argentina | 5 partidos |
| `conmebol.libertadores` | Copa Libertadores | 6 partidos |
| `conmebol.sudamericana` | Copa Sudamericana | 9 partidos |

> Ojo: la Copa Argentina es `arg.copa` (**no** `arg.copa_argentina`, que da 400).
> Boca no participa de `arg.supercopa` ni de `conmebol.recopa`.

**Identificador de Boca:** team id `5`.
**User-Agent:** `cjx-snapshot/1.0` (los UA con paréntesis o URL devuelven 403 de Akamai).

---

## 3. Normalización (`scripts/lib/espn.mjs`)

| Campo del sitio | Origen en ESPN |
|---|---|
| `date`, `time`, `dayLabel` | `competitions[0].date` (UTC) convertido a **Argentina (-03:00, sin DST)** |
| `homeTeam` / `awayTeam` | `competitors[].team.displayName`; Boca siempre queda como `"Boca"` |
| `homeScore` / `awayScore` | `competitors[].score` (**viene como string**: `"2"`) |
| `status` | `status.type.state`: `post` → `finished`, `in` → `live`, `pre` → `scheduled` |
| `homeLogo` / `awayLogo` | `https://a.espncdn.com/i/teamlogos/soccer/500/{teamId}.png` |
| `venue` / `venueCity` | `venue.fullName` (con alias) / `venue.address.city` |
| `competition` | Nombre legible del league |
| `round` | `season.slug` mapeado + etiqueta de la pata del cruce |
| `aggregate` | Suma de goles de la ida + vuelta (solo en la Vuelta) |
| `details` | `/summary`: titulares, suplentes, formación, eventos y estadísticas |

Reglas negocio (`scripts/lib/agenda.mjs`):

- **"Fecha N"** de la Liga = índice del partido de Boca dentro de la fase
  (cada equipo juega una vez por fecha, así que el n-ésimo partido de Boca es la Fecha N).
- **Ida / Vuelta** y **global** se resuelven por `league + rival + fase`.
- Se conservan los **3 últimos finalizados**; el resto de la agenda futura se publica igual.
- Un único partido con `status: "next"` (el más cercano); el resto, `"scheduled"`.

---

## 4. Lo que ESPN **no** da (y qué se hace)

| Falta | Qué se hace |
|---|---|
| Canal de TV (`broadcasts` viene vacío) | La ficha muestra el estadio/ciudad y omite el canal |
| "Fecha N" | Se calcula (ver arriba) |
| Árbitro en Liga Profesional | `officials` viene `null`; la ficha muestra "A confirmar" |
| FIFA Club World Cup | No hay slug de ESPN con Boca → queda fuera de la agenda |
| Nombres de_callers de Bands | Alias en `TEAM_ALIASES` / `VENUE_ALIASES` |

---

## 5. Caché

- `.cache/espn/*.json` (ignorado por git), TTL **20 minutos**.
- Si ESPN falla, se usa la copia cacheada aunque sea vieja (modo "degradado").
- Si no hay nada cacheado, se conserva el `matches.json` anterior.

```bash
npm run snapshot:dry   # ver qué se va a publicar
npm test               # tests de contrato
npm run check && npm run build
```

---

## 6. Atribución

Los datos son de **ESPN** y el sitio lo aclara en el pie y en los
[Términos](../src/pages/terminos.astro). Los escudos se sirven desde el CDN de ESPN
(`a.espncdn.com`).
