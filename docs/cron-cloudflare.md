# Cron confiable con Cloudflare Worker

El `schedule` de GitHub Actions se espacia a cada ~3-6 h en este repo, así que los
resultados y el aviso de 1 h no son confiables. Este Worker usa un **Cron Trigger de
Cloudflare** (confiable) y dispara los workflows de GitHub por API.

```
Cloudflare Worker (cron */15)
        │  POST /actions/workflows/{deploy.yml,notify.yml}/dispatches
        ▼
GitHub Actions (workflow_dispatch)
        ├─ Deploy a GitHub Pages  → snapshot + build + deploy
        └─ Notificaciones Web Push → snapshot + envío del aviso
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

# guardar el token como secret
npx wrangler secret put GITHUB_TOKEN     # pegar el PAT

# deploy (sube el Worker y registra el cron)
npx wrangler deploy
```

Al terminar, Wrangler muestra la URL del Worker, ej.:
`https://cjx-cron-dispatcher.<tu-subdominio>.workers.dev`

## 3. Verificar

- **Cloudflare → Workers & Pages → `cjx-cron-dispatcher` → Settings → Triggers**:
  debe figurar el Cron `*/15 * * * *`.
- **Forzar un disparo a mano:**
  ```bash
  curl https://cjx-cron-dispatcher.<tu-subdominio>.workers.dev
  ```
  Debe responder `{"ok":true,...}` y en GitHub → Actions aparecerán runs nuevos
  (evento `workflow_dispatch`).

## 4. Configuración

`wrangler.toml`:

| Variable | Valor |
|---|---|
| `GITHUB_OWNER` | `diegolu7` |
| `GITHUB_REPO` | `cjx` |
| `GITHUB_REF` | `main` |
| `WORKFLOWS` | `deploy.yml,notify.yml` |
| `GITHUB_TOKEN` | *(secret, se carga con `wrangler secret put`)* |

Para cambiar la frecuencia, editá `crons` en `wrangler.toml` y volvé a deployar.
El mínimo de Cloudflare es `* * * * *` (cada 1 min).

## 5. Costos

Cloudflare Workers Free: 100.000 requests/día y Cron Triggers incluidos.
Con `*/15` son ~96 disparos/día → muy por debajo del límite. **$0**.

## Notas

- Los `schedule` de GitHub se dejan como *fallback*; el Worker es el mecanismo confiable.
- El dedupe del aviso (`notification_sends` en Supabase) evita notificaciones repetidas
  aunque corran deploy y notify a la vez.
