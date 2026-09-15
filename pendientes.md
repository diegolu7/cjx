# Pendientes — Cuando Juega el Xeneize

> Documento vivo con tareas pendientes, propuestas y decisiones abiertas.
> Última actualización: 2026-09-15

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

## 🔜 Etapa 4 — Sección por partido (evolutivo)

- [ ] Página/detalle por partido: formaciones de los equipos, datos curiosos,
  historial entre equipos, etc.
- [ ] Definir fuente de esos datos (puede reusar la pipeline de IA de la Etapa 3).
- [ ] SEO: `SportsEvent` por cada partido + navegación interna.

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
