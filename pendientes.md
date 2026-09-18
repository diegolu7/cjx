# Pendientes — Cuando Juega el Xeneize

> Documento vivo con tareas pendientes, propuestas y decisiones abiertas.
> Última actualización: 2026-09-15

---

## 🚨 URGENTE — Crecimiento SEO (hoy: página ~6 de Google)

> Diagnóstico: dominio nuevo (4 días), **contenido fino** (~280 palabras en la home, 6
> páginas casi todas legales), **sin backlinks** y **212 KB de React** en la isla.
> On-page, structured data y GEO ya están bien. Para subir hay 4 frentes.

### A) Contenido — páginas por partido ⭐ (mayor impacto sostenido) — ✅ implementado
- [x] Ruta `/partidos/{slug}` (ej. `/partidos/2026-09-20-san-lorenzo`) con: ficha,
  resultado + **global**, **previa**, **datos curiosos**, **formaciones**, **eventos**,
  **antecedentes** y **notas** (secciones que se ocultan si están vacías).
- [x] Listado `/partidos` (próximos + resultados) con enlaces.
- [x] **Enlazado interno**: home → partido, partido → listado → partido, y "Ver todos".
- [x] **Forma reciente** de Boca (últimos 3) automática.
- [x] Title/description por partido (long-tail) + `SportsEvent` por página.
- [x] **`noindex`** si el score de contenido < 3 (evita thin content).
- [x] **Previa automática** desde la ficha para partidos próximos (texto único).
- [x] **"A confirmar"** en Formaciones/Eventos de partidos próximos.
- [x] **CTA de notificaciones** (compacto, suscripción global h1) en partidos próximos.
- [x] **Indexación**: finalizados con score ≥ 3; **hasta 2 próximos** con ficha válida.
- [ ] **Manual:** crear la pestaña **`Detalles`** en el Sheet y pegar su **gid** en
  `SHEET_DETAILS_GID` (`scripts/lib/parse.mjs`). Ver `docs/cargar-detalle-partido.md`.
- [ ] **Manual:** cargar el contenido rico (previa, formaciones, eventos, etc.) usando el
  prompt de `docs/prompt-ia-partido.md`.
- [ ] **Manual:** re-pegar `docs/auto_actualizar.gs` (ahora retiene **3** finalizados).

### B) Autoridad / off-page ⭐ (factor #1 para el head term)
- [ ] **Backlinks**: difundir en X, grupos de WhatsApp/Telegram de Boca, foros, Reddit,
  directorios deportivos.
- [ ] Buscar menciones de marca (generan búsquedas de marca = autoridad).

### C) Performance / Core Web Vitals
- [ ] **Reemplazar la isla React** (`client.Buyw3Q1S.js`, ~212 KB) por JS vanilla o Preact
  (~10-20 KB). Las tabs/filtros son simples.
- [ ] **Self-host** de IBM Plex Mono (o recortar pesos) para quitar Google Fonts.
- [ ] Medir LCP/CLS/TBT con PageSpeed/Lighthouse y anotar baseline.

### D) Long-tail + CTR
- [ ] Optimizar títulos/descripciones hacia consultas long-tail.
- [ ] Mantener el rich result de `SportsEvent` (ya válido).

### E) Medición
- [ ] GSC → **Rendimiento**: ver consultas, impresiones y posición; ajustar contenido a
  las queries que ya traen impresiones.

**Expectativas:** head term = meses (autoridad); long-tail = semanas (con A).

---

## ✅ Hecho (Etapa 1 — MVP pre-partido)

- **P2 — Solo aviso 1 h antes.** `scripts/notify.mjs` envía únicamente `h1` (≤60 min).
  Se eliminaron los recordatorios `h24` y `result`.
- **P3 — Sección en home.** `<Notifications />` en `src/pages/index.astro` debajo de la
  agenda; se oculta si faltan `PUBLIC_SUPABASE_URL`/`PUBLIC_VAPID_PUBLIC_KEY`.
- **P1 — Fix de duplicados.** `docs/auto_actualizar.gs`: `_rowExists()` identifica el
  partido por fecha (+ hora/torneo) y actualiza la fila existente; `limpiarDuplicados()`
  fusiona la fila "Próximo" con la "Finalizado" del mismo partido.
- Migración `supabase/migrations/0002_webpush_prefs.sql` (default `{"h1": true}`).
- Commits en `main`: `fa75998` (webpush), `ffd4e60` (dominio), `65a8458` (analítica).

---

## ✅ Dominio — `cuandojuegaelxeneize.com.ar`

- [x] DNS delegado a Cloudflare (`buck` / `selah.ns.cloudflare.com`) en NIC.ar.
- [x] Registros: `A @` a GitHub Pages (4 IPs) + `CNAME www` → `diegolu7.github.io`.
- [x] Proxy naranja activo; HTTPS con certificado Let's Encrypt válido.
- [x] `www` → 301 → apex; `http` → 301 → `https` (**Always Use HTTPS**).
- [x] **HSTS** activo (`max-age=15552000; includeSubDomains`, preload off).
- [x] `astro.config.mjs`, `public/CNAME`, `robots.txt`, `llms.txt` y `sitemap` con el dominio.
- [x] Sitio verificado en vivo: todas las rutas 200, `canonical`/`og:url` correctos.

---

## ✅ Cron confiable (Cloudflare Worker)

- [x] Worker `workers/cron-dispatcher` con Cron Trigger `*/15` que dispara
  `deploy.yml` y `notify.yml` por `workflow_dispatch` (el `schedule` de GitHub se
  espaciaba a cada ~3-6 h y no era confiable).
- [ ] **Manual:** crear el PAT de GitHub (Actions: read & write), `wrangler secret put
  GITHUB_TOKEN` y `wrangler deploy`. Ver `docs/cron-cloudflare.md`.

## ✅ Nav

- [x] Se quitó "Partidos" del nav (desktop y mobile) y se agregó **"Instalar App 📥"**
  (dispara el prompt de instalación vía `data-install-app`).

---

## 🔎 SEO / GEO

**Hecho (código):**
- [x] `robots.txt` limpio (un grupo `*`) + AI crawlers permitidos (GPTBot, OAI-SearchBot,
  ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended).
- [x] `meta robots="index, follow, max-snippet:-1, max-image-preview:large"` en páginas indexables.
- [x] `lastmod` real en el sitemap (home = `updatedAt` de `matches.json`).
- [x] `SportsEvent` completo (`location` con estadio, `image`, `description`, `endDate`);
  parser expone `venue` desde la columna `Lugar`.
- [x] **Página indexada en Google** (verificado en GSC → Inspección de URL).

**Pendiente (externo / tus cuentas):**
- [x] **Google Search Console**: propiedad verificada (TXT vía Cloudflare) y
  `sitemap-index.xml` enviado. La home ya figura **indexada**.
- [ ] GSC → *Solicitar indexación* de `/info/` y validar el `SportsEvent` en el
  Rich Results Test (debe quedar en 0 elementos no válidos).
- [ ] **Bing Webmaster Tools**: verificar + enviar sitemap.
- [x] **Cloudflare → Control de rastreo de IA**: "Bot Preference Sync" apagado; el
  `robots.txt` servido ya no tiene el bloque gestionado y permite los AI crawlers.
- [ ] **Backlinks / difusión** (redes, foros, grupos).
- [ ] **Paciencia**: dominio nuevo (alta 2026-09-11), indexar tarda días/semanas.
- [ ] Verificar avance con `site:cuandojuegaelxeneize.com.ar` y GSC → Páginas.

---

## 🐛 Fixes de datos

- [x] **Vigencia en hora Argentina:** el parser ya no usa la fecha del runner (UTC), que
  dropeaba partidos de la noche antes/después del inicio. Ahora usa el datetime del
  partido (UTC-3) con **gracia de 6 h**.
- [x] **Solo 2 finalizados visibles** (el parser recorta a los 2 más recientes, sin
  depender de la poda del GAS).
- [x] Cargado el resultado de la Vuelta a mano (São Paulo 1-1 Boca → **Global Boca 2-1**).

---

## ✅ Rediseño de la página del partido (UX/UI)

- [x] Componentes en `src/components/match/`: `MatchHero`, `MatchEssentials`,
  `MatchPreview`, `MatchKeyFacts`, `RecentForm`, `Lineups`, `MatchEvents`, `TechnicalDetails`.
- [x] **Próximo**: hero con hora grande + countdown + CTA; datos esenciales (con "A confirmar");
  previa; claves; forma reciente (partidos reales); formaciones (pendiente/probable).
- [x] **Finalizado**: hero con marcador + global + "Boca clasificó"; resumen; eventos; formaciones
  (lista por líneas); ficha técnica (acordeón); claves; forma reciente.
- [x] Íconos **Lucide** (sin emojis); sin secciones vacías (se ocultan).
- [x] Formaciones "list by lines" usando la formación + orden de titulares.
- [x] **Mini-cancha** (`Pitch.astro`): arqueros abajo, delanteros arriba, apellidos; chip de
  formación; fallback a lista si la formación no parsea.
- [x] **"Forma reciente de Boca" → "Últimos partidos"**.
- [x] **Header**: se quitó el subtítulo (gana espacio).
- [x] **Reducción de `·`**: metadata en líneas y listas con comas (0 `·` en todo el sitio).

---

## ✅ Resultado global (ida/vuelta)

- [x] **GAS `calcularGlobales()`**: suma ida + vuelta y escribe `Global Boca` / `Global Rival`
  en la fila de la Vuelta (sobrevive a la poda del Ida). Corre dentro de `actualizarResultadosBoca()`.
- [x] **Parser**: lee `Global Boca`/`Global Rival`/`Penales Boca`/`Penales Rival` y adjunta
  `aggregate` solo a la Vuelta.
- [x] **UI**: muestra "Global: Boca X - Y Rival" en la Vuelta (FeaturedCard + card normal),
  con penales si existen.
- [x] **Push**: el aviso de 1 h incluye rival + global + torneo.
- [x] `docs/formato.md` documenta las 4 columnas nuevas.
- [ ] **Manual:** agregar las columnas `Global Boca`, `Global Rival`, `Penales Boca`,
  `Penales Rival` al Sheet y re-pegar `docs/auto_actualizar.gs` en Apps Script.

---

## ✅ Analítica

- [x] **Microsoft Clarity** (`yihrh0k6ab`) en `Analytics.astro`, gateado por consentimiento.
- [x] **GA4** (`G-Y3RSGVB0D0`), mismo gate de consentimiento.
- [x] Banner y páginas legales (`cookies`, `privacidad`) actualizados.
- [x] **Consentimiento por región**: UE/EEE + UK + Suiza + Brasil → banner previo
  (Aceptar/Rechazar); resto del mundo → consentimiento implícito al navegar, sin aviso
  (frase en el footer + páginas legales + FAQ). Detección de país vía `/cdn-cgi/trace`
  (first-party, Cloudflare). Ante fallo de detección se asume implícito.
- [ ] Verificar que GA4/Clarity empiecen a registrar datos con tráfico real.

---

## ⚠️ Acciones manuales pendientes (críticas)

- [ ] **Pegar `docs/auto_actualizar.gs` en Apps Script** (Extensiones → Apps Script) y guardar.
- [ ] **Correr la migración `0002` en Supabase** (SQL Editor o `supabase db push`).
- [ ] **Google Search Console**: verificar propiedad por dominio (TXT en Cloudflare) y enviar sitemap.
- [ ] **Bing Webmaster Tools**: verificar y enviar sitemap.
- [ ] Revisar en Supabase `notification_sends`: posible **aviso h24** enviado el 2026-09-14 ~21:30 ART
  (código viejo antes del deploy).

---

## 🎯 Checklist partido — 2026-09-15 21:30 (São Paulo vs Boca)

- [ ] Confirmar que dispare y llegue el aviso de **1 h antes** (~20:30 ART).
- [ ] Probar el endpoint `send` con un `matchId` de prueba (curl) para validar suscripciones.
- [ ] Confirmar secrets: Supabase (`VAPID_*`, `SEND_SECRET`) y GitHub Actions
  (`SUPABASE_URL`, `SEND_SECRET`, `PUBLIC_SUPABASE_URL`, `PUBLIC_VAPID_PUBLIC_KEY`).
- [ ] Verificar el botón **"Activar notificaciones"** en la home desde el dominio nuevo.
- [ ] Post-partido: confirmar que el resultado se actualiza sin duplicar filas.

---

## ☁️ Cloudflare — resto recomendado

- [ ] Modo SSL/TLS en **Full (strict)** (SSL/TLS → Descripción general).
- [ ] **Versión mínima de TLS: 1.2**.
- [ ] **TLS 1.3** ON.
- [ ] **Reescritura automática de HTTPS** ON.
- [ ] HSTS **Preload**: dejar OFF por ahora.

---

## 🔜 Etapa 2 — Campanita "Avisame una hora antes" por partido

- [ ] **ID estable de partido.** Hoy el parser usa `id: sheet-{índice}`
  (`scripts/lib/parse.mjs`) y `notify.mjs` usa `{fecha}-{slug(rival)}`.
  Unificar a `boca-{slug(rival)}-{fecha}` para que la suscripción por partido no se rompa
  cuando cambia el orden/altura de las filas.
- [ ] **Módulo cliente compartido** (`src/lib/push.ts`): `getState / enable / disable / updatePrefs`.
  Reusar en `Notifications.astro` y en React.
- [ ] **Botón campana** en `FeaturedCard` (`src/components/MatchesTimeline.tsx`) y,
  opcionalmente, en las cards normales. Visible **siempre** (no depende de que la PWA
  esté instalada). En iOS sin instalar, mostrar instrucciones al tocar.
- [ ] **Suscripción por partido:** guardar `prefs.matches[]` y hacer que la Edge Function
  `send` incluya al suscripto si `prefs.h1 = true` **o** `matches` contiene el `matchId`.
- [ ] Migración `0003` para el nuevo modelo de prefs.

---

## 🔜 Etapa 3 — Automatización autónoma (ver `automatizar.md`)

Decisiones ya tomadas: **sin API deportiva**, **seguir con Google Sheets**,
corridas **09:00 / 12:00 / 17:00 ARG** + previa al partido (~90 min) y posterior
(~150 min, con reintento +60 min).

- [ ] **Decisión abierta:** `automatizar.md` propone persistencia en **JSON en Git**;
  hoy la fuente es **Google Sheets**. Definir si la automatización reemplaza la Sheet
  o si la Sheet queda como fuente manual de respaldo.
- [ ] Fase A: JSON `public/data/agenda-boca.json` + frontend desacoplado.
- [ ] Fase B: `normalize.js` / `validate.js` / `merge.js` (upsert, conflictos, snapshot seguro).
- [ ] Fase C: IA **GPT-5 nano** (structured output) con fallback **GPT-5 mini**.
  Requiere `OPENAI_API_KEY` en GitHub Secrets.
- [ ] Fase D: fuentes en orden **TyC → Olé → ESPN** (una por vez, tolerante a caídas).
- [ ] Fase E: `.github/workflows/update-boca.yml` (primero `workflow_dispatch`, luego cron).
- [ ] Reglas de confianza: 2+ fuentes coinciden → actualizar; conflicto → no sobrescribir + log.
- [ ] Nunca vaciar la agenda ante errores: conservar el último snapshot válido.

---

## ✅ Etapa 4 — Páginas por partido (implementado)

Ver la sección **"🚨 URGENTE → A) Contenido"** arriba. Resumen:
- Páginas `/partidos/{slug}` con ficha, resultado/global, previa, datos curiosos,
  formaciones, eventos, antecedentes, notas y forma reciente.
- Contenido rico **manual** vía pestaña `Detalles` del Sheet (`docs/cargar-detalle-partido.md`)
  y prompt de IA (`docs/prompt-ia-partido.md`).
- SEO: `SportsEvent` por página, title/description long-tail, `noindex` por score.
- Pendiente manual: crear la pestaña `Detalles` + pegar su `gid`.

---

## 💡 Propuestas

- **Historial de resultados.** Hoy `limpiarHistorial()` deja solo los 2 `Finalizado`
  más recientes. Evaluar ampliar a 5–10 para dar más contexto SEO.
- **Imagen descargable** para compartir la agenda en WhatsApp/Instagram (viralidad).
- **Twitter/X + WhatsApp** para alertas antes de cada partido.
- **MCP reutilizable** (opcional, segunda etapa): exponer `get_boca_schedule`,
  `update_boca_schedule`, `validate_boca_schedule` como tools. No es obligatorio
  mantener un servidor MCP encendido.
- **Monitoreo del cron:** alertar si el workflow falla 2 veces seguidas.

---

## ❓ Decisiones abiertas

1. **Sheets vs JSON en Git:** ¿la automatización de `automatizar.md` reemplaza la Sheet
   o la Sheet queda como fuente manual?
2. **OpenAI:** ¿se usará `OPENAI_API_KEY` para GPT-5 nano (Etapa 3)?
3. **Campanita:** modelo *sección = todos los partidos* / *campanita = solo ese partido*,
   con `h1` global en `false` por defecto para quienes solo tocan campanita.
4. **Notificación de resultado:** confirmado que **no** se envía por ahora
   (solo "empieza el partido"). Reevaluar como evolutivo.

---

## 🧹 Deuda técnica / notas

- `scripts/notify.mjs` y `scripts/lib/parse.mjs` calculan el `matchId` con lógicas
  distintas (ver Etapa 2).
- `web-push-notifications-spec.md` es una spec de referencia de otro proyecto
  (Laravel); no aplica directamente acá.
- `notas-sin-conexion.txt` contiene las notas originales de estos pendientes.
