# Pendientes — Cuando Juega el Xeneize

> Documento vivo con tareas pendientes, propuestas y decisiones abiertas.
> Última actualización: 2026-09-14

---

## ✅ Hecho (Etapa 1 — MVP pre-partido, 2026-09-14)

- **P2 — Solo aviso 1 h antes.** `scripts/notify.mjs` envía únicamente `h1` (≤60 min).
  Se eliminaron los recordatorios `h24` y `result`.
- **P3 — Sección en home.** `<Notifications />` se muestra en `src/pages/index.astro`
  debajo de la agenda; se oculta si faltan `PUBLIC_SUPABASE_URL`/`PUBLIC_VAPID_PUBLIC_KEY`.
- **P1 — Fix de duplicados.** `docs/auto_actualizar.gs`: `_rowExists()` identifica el
  partido por fecha (+ hora/torneo) y actualiza la fila existente; `limpiarDuplicados()`
  ahora fusiona la fila "Próximo" con la "Finalizado" del mismo partido.
- Migración `supabase/migrations/0002_webpush_prefs.sql` (default `{"h1": true}`).
- Pusheado a `main` (commit `fa75998`).

### Acciones manuales pendientes de la Etapa 1
- [ ] **Pegar `docs/auto_actualizar.gs` en Apps Script** (Extensiones → Apps Script) y guardar.
- [ ] **Correr la migración `0002` en Supabase** (SQL Editor o `supabase db push`).

---

## 🌐 Dominio propio — `cuandojuegaelxeneize.com.ar`

Configuración del sitio (ya aplicada en el repo):
- `astro.config.mjs`: `site = https://cuandojuegaelxeneize.com.ar`, `base = /`.
- `public/CNAME` con `cuandojuegaelxeneize.com.ar`.
- `public/robots.txt` y `public/llms.txt` con las URLs del dominio.

### Pasos en Cloudflare (DNS)
- [ ] Apex `cuandojuegaelxeneize.com.ar` → **A** a GitHub Pages:
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- [ ] Apex IPv6 (opcional) → **AAAA**: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
  `2606:50c0:8002::153`, `2606:50c0:8003::153`.
- [ ] `www` → **CNAME** a `diegolu7.github.io`.
- [ ] Dejar los registros en **DNS only (nube gris)** hasta que GitHub emita el
  certificado; luego se puede activar el proxy (naranja) con SSL **Full**.
- [ ] SSL/TLS en Cloudflare: modo **Full (strict)**.

### Pasos en GitHub
- [ ] Repo → **Settings → Pages → Custom domain**: `cuandojuegaelxeneize.com.ar`.
- [ ] Activar **Enforce HTTPS** (puede tardar unos minutos).
- [ ] Re-deploy (push o `workflow_dispatch`) para que tome `CNAME` y `site`.

### Post-dominio
- [ ] **Google Search Console**: verificar por dominio (TXT en Cloudflare) y enviar sitemap.
- [ ] **Bing Webmaster Tools**: verificar y enviar sitemap.

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

## 📊 Analítica (2026-09-14)

- [x] **Microsoft Clarity** instalado (`yihrh0k6ab`) en `src/components/Analytics.astro`,
  gateado por consentimiento de cookies. Textos legales actualizados.
- [x] **GA4** instalado (`G-Y3RSGVB0D0`), mismo gate de consentimiento.
- [ ] Verificar en GA4 y Clarity que empiecen a verse datos tras el deploy y con el dominio activo.

---

## 💡 Propuestas

- **Historial de resultados.** Hoy `limpiarHistorial()` deja solo los 2 `Finalizado`
  más recientes. Evaluar ampliar a 5–10 para dar más contexto SEO.
- **Imagen descargable** para compartir la agenda en WhatsApp/Instagram (viralidad).
- **Twitter/X + WhatsApp** para alertas antes de cada partido.
- **Google Search Console + GA4** (verificar que estén activos).
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
