# Cron confiable con Cloudflare Worker

El `schedule` de GitHub Actions se espacia a cada ~3-6 h en este repo, así que los
resultados y el aviso de 1 h no son confiables. Este Worker usa un **Cron Trigger de
Cloudflare** (confiable) y dispara los workflows de GitHub por API.

Además, el Worker mantiene vivo el proyecto de Supabase: GitHub desactiva los
`schedule` de repos públicos a los 60 días sin actividad, así que no conviene que el
keepalive dependa **solo** de GitHub Actions.

```
Cloudflare Worker
 ├─ cron */15        → POST /actions/workflows/{deploy,notify}.yml/dispatches
 ├─ cron 7 4 * * *   → POST {SUPABASE_URL}/functions/v1/ping   (keepalive diario)
 └─ GET manual       → hace las dos cosas

GitHub Actions (workflow_dispatch)
 ├─ Deploy a GitHub Pages  → snapshot + build + deploy
 ├─ Notificaciones Web Push → snapshot + envío del aviso
 └─ Keepalive Supabase      → cron diario propio (segunda capa)
```

## 1. Crear el token de GitHub

GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
→ *Generate new token*:

- **Repository access:** solo `diegolu7/cjx`.
- **Permissions → Repository permissions → Actions:** `Read and write`.
- Generar y **copiar el token** (`github_pat_...`).

> Alternativa: un token clásico con el scope `workflow`.

## 2. Instalar el Worker

Desde `workers/cron-dispatcher`:

```bash
# login (una vez)
npx wrangler login

# guardar los tokens como secrets
npx wrangler secret put GITHUB_TOKEN     # PAT de GitHub
npx wrangler secret put PING_SECRET      # el mismo PING_SECRET de Supabase

# deploy (sube el Worker y registra los crons)
npx wrangler deploy
```

Al terminar, Wrangler muestra la URL del Worker, ej.:
`https://cjx-cron-dispatcher.<tu-subdominio>.workers.dev`

> `SUPABASE_URL` va como **var** en `wrangler.toml` (no es secreto: ya está expuesto
> en el bundle del sitio). `PING_SECRET` va como secret.

## 3. Verificar

- **Cloudflare → Workers & Pages → `cjx-cron-dispatcher` → Settings → Triggers**:
  deben figurar los crons `*/15 * * * *` y `7 4 * * *`.
- **Forzar un disparo a mano:**
  ```bash
  curl https://cjx-cron-dispatcher.<tu-subdominio>.workers.dev
  ```
  Debe responder `{"ok":true,"results":[...],"ping":{"ok":true,...}}` y en
  GitHub → Actions aparecerán runs nuevos (evento `workflow_dispatch`).
- **Verificar que el keepalive llegó a la base:**
  ```sql
  select * from public.keepalive;   -- last_ping debería ser de hoy
  ```

## 4. Configuración

`wrangler.toml`:

| Variable | Tipo | Valor |
|---|---|---|
| `GITHUB_OWNER` | var | `diegolu7` |
| `GITHUB_REPO` | var | `cjx` |
| `GITHUB_REF` | var | `main` |
| `WORKFLOWS` | var | `deploy.yml,notify.yml` |
| `SUPABASE_URL` | var | `https://<ref>.supabase.co` |
| `GITHUB_TOKEN` | secret | `wrangler secret put` |
| `PING_SECRET` | secret | `wrangler secret put` (mismo que en Supabase) |

Para cambiar la frecuencia, editá `crons` en `wrangler.toml` y volvé a deployar.
El mínimo de Cloudflare es `* * * * *` (cada 1 min).

## 5. Costos

Cloudflare Workers Free: 100.000 requests/día y Cron Triggers incluidos.
Con `*/15` son ~96 disparos/día → muy por debajo del límite. **$0**.
El ping diario suma 1 request más. **$0**.

## Notas

- Los `schedule` de GitHub se dejan como *fallback*; el Worker es el mecanismo confiable.
- El dedupe del aviso (`notification_sends` en Supabase) evita notificaciones repetidas
  aunque corran deploy y notify a la vez.
- **No agregar `keepalive.yml` a `WORKFLOWS`**: el Worker dispara esa lista cada 15 min
  y el keepalive necesita correr **una vez por día**, no 96.
- El ping **no reanuda** un proyecto ya pausado. Solo lo evita. Si el proyecto se pausó,
  hay que ir al dashboard → **Resume project**.
