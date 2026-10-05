# Web Push (Supabase) — Documentación

Notificaciones push para "Cuando Juega el Xeneize": un único aviso **1 hora antes** del inicio del partido. Sin recordatorios de 24 h ni de resultado final (quedan como evolutivo). Costo **$0** (Supabase Free + GitHub Actions en repo público + Web Push estándar).

---

## 1. Arquitectura

```
Navegador (PWA instalada)
  │ "Activar notificaciones" (gesto)
  │ Notification.requestPermission() → pushManager.subscribe(VAPID pública)
  │ POST /functions/v1/subscribe {endpoint, keys, prefs, enabled}
  ▼
Supabase
  ├─ Edge Function subscribe  (pública, service role → upsert)
  ├─ Edge Function send       (protegida con SEND_SECRET → fan-out + dedupe + cleanup 410)
  ├─ Edge Function ping       (protegida con PING_SECRET → upsert de keepalive)
  ├─ tabla push_subscriptions (endpoint único, keys, prefs jsonb, enabled)
  ├─ tabla notification_sends (match_id + type únicos → dedupe)
  └─ tabla keepalive          (una fila: last_ping)
  ▲
GitHub Action "Notificaciones Web Push" (cron */15)
  └─ lee src/data/matches.json → calcula avisos debidos → POST /functions/v1/send
  ▲
GitHub Action "Keepalive Supabase" (cron diario)
  └─ POST /functions/v1/ping   ← evita que el plan Free pause el proyecto
```

**Service Worker:** `public/sw.js` (ya incluido) maneja `push` y `notificationclick`. Se registra solo en producción.

---

## 2. Requisitos

- Proyecto en [supabase.com](https://supabase.com) (plan Free).
- Node 22 + `npx`.
- Repo público en GitHub (Actions gratis) — ya lo tenemos.

---

## 3. Paso a paso (configuración de Supabase — la hacés vos)

### 3.1 Crear el proyecto
1. Crear proyecto Free. Anotar:
   - **Project URL** → `https://<ref>.supabase.co`
   - **anon key** (no la usamos en el cliente por ahora, pero sirve)
   - **service_role key** (secreta; la usan las Edge Functions automáticamente)

### 3.2 Crear las tablas
Opción A (dashboard): pegar `supabase/migrations/0001_webpush.sql` en **SQL Editor → Run**.
Opción B (CLI): `supabase db push`.

### 3.3 Generar claves VAPID
```bash
npx web-push generate-vapid-keys
```
Guardar `Public Key` y `Private Key`.

### 3.4 Configurar secrets de las Edge Functions
```bash
supabase login
supabase link --project-ref <ref>
supabase secrets set \
  VAPID_PUBLIC_KEY="<public>" \
  VAPID_PRIVATE_KEY="<private>" \
  VAPID_SUBJECT="mailto:delnorte.destinos@gmail.com" \
  SEND_SECRET="<token-largo-aleatorio>" \
  PING_SECRET="<otro-token-largo-aleatorio>"
```
`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta Supabase automáticamente.

### 3.5 Deployar las Edge Functions
```bash
# subscribe: pública (llamada desde el navegador)
supabase functions deploy subscribe --no-verify-jwt

# send: protegida por SEND_SECRET (llamada por el GitHub Action)
supabase functions deploy send --no-verify-jwt

# ping: protegida por PING_SECRET (llamada por el workflow de keepalive)
supabase functions deploy ping --no-verify-jwt
```
> `--no-verify-jwt` porque no usamos usuarios autenticados de Supabase; `send` y `ping` igual exigen su secret.

> Se puede agregar `--project-ref <ref>` a los tres comandos para evitar el `link`
> (que pide la contraseña de la base de datos).

---

## 4. Configuración del sitio (GitHub)

### 4.1 Variables públicas (build)
GitHub → repo → **Settings → Secrets and variables → Actions → Variables**:
| Variable | Valor |
|---|---|
| `PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `PUBLIC_VAPID_PUBLIC_KEY` | clave pública VAPID |

El workflow `deploy.yml` ya las inyecta en el build.

### 4.2 Secrets para el emisor y el keepalive
**Settings → Secrets and variables → Actions → Secrets**:
| Secret | Valor |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SEND_SECRET` | el mismo token del paso 3.4 |
| `PING_SECRET` | el mismo token del paso 3.4 |

### 4.3 Local (desarrollo)
Copiar `.env.example` a `.env` y completar. (`.env` está gitignoreado.)

---

## 5. Componente del sitio

- `src/components/Notifications.astro`: botón **Activar/Desactivar** (un solo aviso, 1 h antes).
- Se muestra en la **home** (debajo de la agenda) y en **`/info`** (`#notificaciones`).
- En la home, si faltan `PUBLIC_SUPABASE_URL`/`PUBLIC_VAPID_PUBLIC_KEY`, no se renderiza. En `/info` muestra "Próximamente" (el sitio no se rompe).
- Flujo: pide permiso → `subscribe()` → guarda la suscripción en Supabase.
- **iOS**: requiere la PWA **instalada** (iOS 16.4+); si no, muestra las instrucciones.

---

## 6. Emisor de avisos

- `scripts/notify.mjs`: lee `src/data/matches.json` y, según la hora actual (Argentina, UTC-3):
  - **h1**: faltan ≤ 60 min para el inicio (único aviso que se envía).
  - Llama a `POST /functions/v1/send` con `{ matchId, type, title, body, url }`.
- `.github/workflows/notify.yml`: corre **cada 15 min** (snapshot + envío).
- **Dedupe**: la Edge Function `send` registra `(match_id, type)` en `notification_sends`; si ya existe, **no repite**.
- **Limpieza**: ante `404/410` (suscripción vencida), borra la fila.

> ⚠️ **El cron de avisos NO mantiene vivo el proyecto.** `notify.mjs` sale con
> `return` temprano cuando no hay partido en la próxima hora, así que de las ~96
> corridas diarias solo ~4 llegan a tocar Supabase. Eso es menos actividad que la que
> Supabase exige para no pausar. Para eso está el keepalive de la sección 9.

---

## 6 bis. Keepalive (evitar la pausa del plan Free)

```
.github/workflows/keepalive.yml   (cron diario 08:23 ART)
  └─ node scripts/keepalive.mjs
       └─ POST /functions/v1/ping   (Bearer PING_SECRET)
            └─ Edge Function ping → UPSERT en tabla keepalive
```

- `supabase/functions/ping/index.ts`: hace un **UPSERT real** contra Postgres
  (actualiza `keepalive.last_ping`). No es un health-check: Supabase excluye los
  health-checks del conteo de actividad, así que un ping que no consulte la DB no
  serviría. Se protege con `PING_SECRET`, no con JWT.
- `scripts/keepalive.mjs`: sale con **código 1** ante cualquier fallo, para que GitHub
  Actions avise por email. Un keepalive que falla en silencio es peor que no tenerlo.
- Ver el estado de un vistazo:
  ```sql
  select * from public.keepalive;   -- last_ping debería ser de hoy
  ```
- **Dos capas de disparo**, a propósito:
  1. `keepalive.yml` (GitHub Actions, diario).
  2. El Cloudflare Worker (`workers/cron-dispatcher`), que ya corre cada 15 min con un
     Cron Trigger confiable. GitHub desactiva los `schedule` de repos públicos a los
     60 días sin actividad; el Worker no tiene ese problema.

> El ping **no reanuda** un proyecto pausado: solo lo evita. Si ya está pausado,
> hay que ir al dashboard → **Resume project** (ventana de 90 días).

---

## 7. Probar

### 7.1 Enviar una notificación de prueba
```bash
curl -X POST "https://<ref>.supabase.co/functions/v1/send" \
  -H "Authorization: Bearer <SEND_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"matchId":"test-1","type":"h1","title":"Prueba","body":"Funciona 🎉","url":"./"}'
```
Debe llegar al dispositivo suscripto. Para repetir la prueba, cambiar `matchId` o borrar la fila en `notification_sends`.

### 7.2 Casos a validar
- Permiso concedido / denegado.
- Activar/desactivar y cambiar preferencias (se guardan).
- iOS sin instalar (muestra instrucciones) y con la PWA instalada.
- Dedupe (no repite) y cleanup 410.

> El push real requiere HTTPS: probar en la **URL desplegada** (GitHub Pages) o en `localhost`.

---

## 8. Legal

- `src/pages/privacidad.astro` ya menciona: endpoint de push + preferencias, fin (avisos de partidos) y derecho a desactivar/eliminar.
- El permiso de notificaciones es **separado** del consentimiento de cookies.
- El opt-in es **explícito** (botón), nunca automático.

---

## 9. Costos y límites (Supabase Free)

- 500 MB de base de datos · **500.000 invocaciones** de Edge Functions/mes (usamos ~3.000) · 5 GB egress · 2 proyectos.
- ⚠️ **Los proyectos Free se pausan tras 7 días sin actividad suficiente en la base.**
  Supabase no publica un umbral exacto, pero su guía es *"unas pocas peticiones a la
  base por día a lo largo de la semana"*. Por eso el keepalive de la sección 6 bis
  corre **todos los días**: 30 invocaciones/mes contra las 500.000 del plan ($0).
  - Antes se pensaba que el cron de avisos (`*/15`) ya mantenía el proyecto vivo. **No**:
    ese cron mantiene vivos los *workflows de GitHub*, no la base de datos. Fue
    justamente el motivo por el que el proyecto `cjx` se pausó el 2026-10-05.
  - Alternativa: el plan **Pro ($25/mes)** nunca pausa el proyecto e incluye backups
    diarios y 2M de invocaciones. Para este proyecto, el keepalive propio sale gratis.
- GitHub Actions: gratis en repo público.

---

## 10. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| `401 unauthorized` en `send` | `SEND_SECRET` distinto entre Supabase y GitHub | Igualar ambos |
| `401 unauthorized` en `ping` | `PING_SECRET` distinto entre Supabase y GitHub | Igualar ambos |
| No se guarda la suscripción | Función `subscribe` con JWT requerido o sin CORS | Deploy con `--no-verify-jwt`; CORS ya incluido |
| No llegan notificaciones | Preferencia apagada / permiso denegado / SW no registrado | Revisar prefs, permiso y que sea build de **producción** |
| iOS no recibe | PWA no instalada | Instalar y activar desde el ícono |
| Workflow "Keepalive Supabase" en rojo | Secret desincronizado, o proyecto pausado | Correr `node scripts/keepalive.mjs` en local; ver la fila de abajo |
| `keepalive.last_ping` tiene más de 2 días | El cron dejó de disparar | Verificar que el workflow corrió; si no, disparar a mano |
| **Proyecto Supabase pausado** | Inactividad | **Ir al dashboard → Resume project** (90 días de ventana). Ningún ping lo reactiva solo |
| Error con `web-push` en Deno | Compatibilidad npm | Usar `npm:web-push@3.6.7` (ya configurado) |

---

## 11. Mapa de archivos

```
supabase/
├─ migrations/0001_webpush.sql      # tablas + RLS + trigger
├─ migrations/0002_webpush_prefs.sql# solo aviso h1
├─ migrations/0003_keepalive.sql    # tabla keepalive (1 fila)
└─ functions/
   ├─ subscribe/index.ts            # registra/actualiza suscripción (pública)
   ├─ send/index.ts                 # fan-out + dedupe + cleanup (SEND_SECRET)
   └─ ping/index.ts                 # keepalive (PING_SECRET)
src/
├─ components/Notifications.astro   # UI + suscripción (aviso 1 h antes)
└─ pages/privacidad.astro           # mención de datos de push
scripts/
├─ notify.mjs                       # emisor de avisos (cron */15)
└─ keepalive.mjs                    # ping diario (evita la pausa)
.github/workflows/
├─ notify.yml                       # cron cada 15 min
└─ keepalive.yml                    # cron diario (evita la pausa)
workers/cron-dispatcher/            # cron de respaldo vía Cloudflare
public/sw.js                        # handlers push/notificationclick
.env.example                        # variables necesarias
```
