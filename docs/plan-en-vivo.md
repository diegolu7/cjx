# Plan — Indicador "EN VIVO" (punto verde + contador de minutos)

> Estado: **implementado** (2026-10) con la API de ESPN como fuente: `MatchStatus`
> ya incluye `"live"` y el badge se painta en build. Este documento queda como
> registro del diseño original (la parte de "cálculo en el navegador" ya no aplica:
> el estado llega desde ESPN).
> Objetivo: cuando Boca juega, el partido se reconozca al instante, sin esperar
> un deploy, y sin tocar nada que hoy funcione.

---

## Principio innegociable

**"En vivo" es una capa de presentación. Jamás un `MatchStatus`.**

`MatchStatus` (`"finished" | "next" | "scheduled"`) hoy alimenta:

- `getStaticPaths` de `/partidos/[slug]` (genera las páginas)
- el filtrado de pestañas vía `data-status` (`MatchesTimeline.astro:292`)
- la indexabilidad SEO (`indexable` en `scripts/lib/agenda.mjs`)
- el snapshot que corre **antes** de cada build

Si "en vivo" pasara a ser un status, un partido en vivo quedaría fuera del build
de las fichas y cambiaría el comportamiento de las pestañas. Justo el tipo de
cambio que dejó el sitio 17 deploys caído sin que nadie lo notara.

Además: **el sitio es SSG y se redespliega cada 15 minutos** (`deploy.yml:8`).
Cualquier estado calculado en build llega tarde. Por eso todo el cálculo va en
el navegador.

---

## Datos que sostienen la factibilidad

Verificado en esta sesión:

| Dato | Resultado |
|---|---|
| Zona horaria | Argentina = **UTC-3 fijo todo el año** (verificado en ene/jun/oct/dic). Sin DST. |
| TheSportsDB free | `livescore.php?sport=Soccer` → **HTTP 200**, trae `strStatus` (`1H`/`HT`/`2H`/`FT`), marcador y `strProgress` (`90+4`). |
| Cobertura | **Liga Profesional Argentina (id 4406) está en el feed live** (verificado con partidos en vivo). |
| CORS | `access-control-allow-origin: *` → se puede llamar desde el navegador. |
| Puertos | `strStatus` de `eventslast`/`eventsnext` solo trae `FT`/`NS` → **no sirven para vivo**. Solo `livescore.php`. |
| Contraste | `#22c55e` da **8.31:1** sobre `--color-bg` y **7.60:1** sobre `--color-surface** (AAA). Texto blanco *sobre* el verde da solo 2.28:1 → el verde no va de fondo con texto blanco. |
| Temas | No hay verde en `global.css`. Hay que agregar `--color-live`. |

---

## Flujo

```
ESPN (scoreboard + /summary) → snapshot.mjs → matches.json → build SSG
                                          │
                    status: "live" (ESPN status.type.state === "in")
                                          │
                    HTML con el badge EN VIVO y el marcador real
```

### Trampa de zona horaria (el riesgo #1)

`kickoffISO()` ya emite offset explícito `-03:00`, así que `new Date(iso)` es un
**instante absoluto** y da lo mismo en Buenos Aires que en Madrid.

Nunca hay que construir la fecha como `${match.date}T${match.time}` sin offset:
el navegador lo interpretaría en la **zona horaria del visitante** y el error
sería de horas para todo el mundo fuera de Argentina.

---

## Decisiones de diseño

| Decisión | Elección | Por qué |
|---|---|---|
| Categoría | Sigue siendo `next`/`scheduled` → aparece en la pestaña **PRÓXIMOS** | Lo pidió el usuario; no crea una pestaña nueva |
| Señal | Texto **"EN VIVO"** + punto verde | El texto solo ya cubre daltonismo; el punto es refuerzo visual |
| Momento | Badge **renderizado en el server pero oculto**; el JS lo revela | Sin JS se ve exactamente como hoy. Cero regresión visual |
| Contador | Minuto estimado por reloj; la API lo reemplaza por el real | Ver abajo |
| Verde | `--color-live: #22c55e` como punto y texto, **nunca** de fondo | Contraste, ver tabla |
| Persistencia | Ninguna en `localStorage`; solo memoria + `sessionStorage` | Evita estado fantasma si el usuario vuelve mañana |

### El contador es una estimación — y hay que decirlo

Minutos transcurridos ≠ minuto de fútbol:

- 19:30 pitazo inicial (0')
- 19:30–20:15 primer tiempo (45')
- 20:15–20:30 entretiempo (15')  ← acá el reloj dice 50' pero es 45'
- 20:30–21:17 segundo tiempo
- ~21:25 final

Ajuste propuesto: `minuto = transcurrido > 60 ? transcurrido - 15 : transcurrido`.
Se va de ±5 min alrededor del entretiempo. **Es una estimación**, y el plan la
trata como tal. Cuando la API responde, se usa el `strProgress` real (`90+4`).

---

## Fases

Cada una es un commit independiente y revertible.

### Fase 0 — Token de color + funciones puras · *sin cambio visual*

Agregar `--color-live` a `src/styles/global.css`.

Agregar a `src/lib/match.ts` (funciones puras, sin DOM ni red):

- `liveWindow(m)` → `{ start: number, end: number } | null`
  - `null` si no hay hora válida (reutiliza `horaDe`)
  - `end = start + 2h05` (90' + ~15' entretiempo + stoppage)
  - `null` también si `m.status === "finished"`
- `liveState(m, now)` → `"before" | "live" | "after" | "none"`
- `minutoAprox(m, now)` → `number | null` (con el ajuste de entretiempo)

**Por qué `2h05`:** duración real desde el silbato hasta el final ≈ 105–120'.
Como el estado `finished` del parser manda sobre todo, la ventana no puede
disparar en partidos ya terminados.

**Verificación:** script de Node sin dependencias (`scripts/check-live.mjs`) que
recorra los 8 partidos del `matches.json` con un `now` sintético y cubra:

- partido futuro → `before`
- partido dentro de la ventana → `live`
- partido fuera de la ventana → `none`
- partido `finished` → `none`
- partido **sin hora** (`Talleres`, `Independiente`) → `none`, sin excepción
- hora inválida (`25:99`) → `none`, sin excepción
- cruce de medianoche en ART

**Rollback:** `git revert` del commit. No hay cambio en pantalla.

---

### Fase 1 — Badge "EN VIVO" por reloj

Componente nuevo `src/components/match/LiveBadge.astro`:

- Badge **oculto por defecto** en el HTML, con `data-kickoff` y `data-live-end`.
- Un `<script>` dentro del componente (Astro lo deduplica y lo corre **una
  sola vez**, aunque el componente se use N veces; además se le pone un guard
  `dataset` por si acaso, para que sea idempotente).
- Al cargar: para cada `[data-live-badge]`, compara `Date.now()` contra la
  ventana y **revela** el badge si está en vivo.

Se inserta en `MatchesTimeline.astro` junto al badge existente (`badgeClass` /
`badgeLabel`, líneas 29-41), **sin tocar esos badges**: el de EN VIVO es un
elemento hermano.

**No se toca:** `MatchStatus`, `parse.mjs`, `getStaticPaths`, `matchTab()`,
los badges existentes, el `countdownText`.

**Verificación:**
- `npm run build` → 28 páginas
- `npm run check` → 0 errores
- Con `now` sintético, el badge aparece en el partido esperado y **solo** ahí
- Los 8 partidos siguen renderizando; ningún `data-status` cambia
- Con JS deshabilitado, la home se ve idéntica a hoy

---

### Fase 2 — Contador de minutos

- Un `setInterval` de 1 s **solo mientras haya un partido en vivo** (se crea
  cuando aparece uno y se limpia cuando no queda ninguno).
- **Recalcula desde el instante absoluto en cada tick**, nunca decrementa un
  contador: si la pestaña estuvo suspendida, no deriva.
- Visible: `EN VIVO · 67'`
- `aria-hidden="true"` en el número + `aria-label="En vivo"` en el badge.
  **Motivo:** una región `aria-live` que tickea cada segundo es hostil para
  lector de pantalla. El texto estático sigue siendo el anuncio.
- `prefers-reduced-motion`: el punto deja de parpadear.

**Verificación:** los mismos chequeos de Fase 0, más un recorrido con `now`
simulado dentro del entretiempo para confirmar el ajuste.

---

### Fase 3 — Override con la API · *requiere decisión*

Cliente, **solo** cuando la Fase 1 dice "puede estar en vivo":

- `fetch("https://www.thesportsdb.com/api/v1/json/3/livescore.php?league=4406")`
- Poll cada 60 s, en memoria + `sessionStorage`.
- Si responde: usar `strProgress` real en vez del minuto estimado, y opcionalmente
  el marcador en vivo.
- Si falla (red, 429, JSON raro, partido ausente): **fallback silencioso** a la
  estimación del reloj. Nunca puede romper la página.

**Presupuesto:** ~125 llamadas solo en el día del partido. En los ~350 días
restantes del año: **cero**. El reloj decide cuándo mirar, así que no se
consume cuota sin necesidad.

**Verificación obligatoria:** probarlo con la red caída, con respuesta `{}`, con
HTML en vez de JSON, y con `league=4406` vacío. En los cuatro casos la página
debe verse igual que en Fase 2.

---

### Fase 4 — Ficha del partido

Mismo componente `LiveBadge` en `MatchHero.astro` (que tiene su propio sistema de
badge, líneas 18-24) y en la card destacada de la home.

Solo **después** de que las Fases 1-3 estén probadas en `/partidos` y en la home.

---

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Partido postergado con la fecha vieja | Muestra EN VIVO cuando no juega | La API puede **bajar** el flag si dice `FT`; además el `status` del parser manda |
| Badge sobrevive ~15 min al final real | Ventana hasta el siguiente deploy | Acotado por `2h05`; se acepta |
| API caído o cambia el plan | Pierde el minuto exacto | Fallback al reloj; es una capa *aditiva* |
| Visitante con reloj del dispositivo mal puesto | Detecta mal la ventana | Impacto menor y cosmético; se acepta |
| `livescore` sin cobertura de un partido | Sin override | Cae al reloj |
| Hueco de ~15 min al arranque | El HTML llega antes de que el reloj marque vivo | **Inexistente**: el reloj corre en el navegador, no en el build |

---

## Rollback

Cada fase es un commit. `git revert <sha>` la deshace. El badge es
oculto-por-defecto, así que incluso una reversión parcial no puede dejar un
badge roto visible: lo peor que puede pasar es que no aparezca.

---

## Fuera de alcance

- No se agrega `live` a `MatchStatus`
- No se toca `parse.mjs` ni el snapshot
- No se cambia la indexación SEO
- No se agregan dependencias (`devDependencies` sigue en `@astrojs/check` + `typescript`)
- No se toca el push / Web Push
- No se implementa nada hasta que el plan esté aprobado

---

## Decisiones que necesito

1. **Fase 3 (la API) sí o no.** `pendientes.md:310` fija **"sin API deportiva"**
   como decisión tomada en la Etapa 3 de automatización. La Fase 3 la contradice.
   A favor: TheSportsDB free tiene CORS abierto y cubre la Liga Profesional.
   En contra: hoy la agenda sale de ESPN (ver `docs/datos-espn.md`), que ya trae
   el estado `live`; contradice esa
   decisión y suma una dependencia externa en caliente. **Si preferís no tocar
   esa decisión, las Fases 0-2 quedan completas y útiles solas** (el punto verde
   y el contador estimado funcionan sin ninguna API).
2. **Marcador en vivo** (el puntaje en pantalla) ¿dentro o fuera? No lo pediste
   explícitamente; viene gratis con la Fase 3 pero suma complejidad.
3. **Dónde va primero.** Propongo `/partidos` + home en Fase 1 y la ficha en
   Fase 4. Si preferís arrancar por la ficha, se invierte el orden.