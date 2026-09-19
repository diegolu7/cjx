# Auto-post en X (Twitter)

Cuando el emisor (`scripts/notify.mjs`) envía el aviso de **1 h antes**, además publica un
post en X con el enlace al partido. Es **opcional**: si no hay credenciales, no publica.

> Cuenta: https://x.com/cuandojuegaCABJ

---

## 1. Crear la app en X (una vez)

1. Entrá a **https://developer.x.com** con la cuenta `@cuandojuegaCABJ`.
2. **Developer Portal → Projects & Apps → Create App**.
3. En **User authentication settings**:
   - App permissions: **Read and write**.
   - Type of App: **Web App / Automated App**.
   - Callback URL: `https://cuandojuegaelxeneize.com.ar` (cualquiera válida).
   - Website URL: `https://cuandojuegaelxeneize.com.ar`.
4. En **Keys and tokens** generá:
   - **API Key** y **API Key Secret**.
   - **Access Token** y **Access Token Secret** (con permiso **Read and write**).

> ⚠️ El plan **Free** de la API de X permite **~500 posts/mes**. Nosotros publicamos
> **1 post por partido** (≤ ~8/mes), así que sobra.

---

## 2. Cargar los secrets en GitHub

Repo → **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Valor |
|---|---|
| `X_API_KEY` | API Key |
| `X_API_SECRET` | API Key Secret |
| `X_ACCESS_TOKEN` | Access Token |
| `X_ACCESS_SECRET` | Access Token Secret |

---

## 3. Cómo funciona

- El workflow **Notificaciones Web Push** (`notify.yml`) corre cada 15 min.
- Cuando corresponde el aviso de 1 h, llama a la Edge Function `send` (que **deduplica**).
- Si el push **no** fue un duplicado, publica en X:

```
Boca juega en 1 hora
Boca vs São Paulo · Global 1-0 · 21:30 · Copa Sudamericana
https://cuandojuegaelxeneize.com.ar/partidos/2026-09-15-sao-paulo/
```

- **Dedupe**: si el push se saltó (ya enviado), tampoco se publica en X → **1 post por partido**.

---

## 4. Probar

Con los secrets cargados, podés forzar el workflow desde GitHub → **Actions →
"Notificaciones Web Push" → Run workflow**. Si hay un partido en la ventana de 1 h,
se publicará; si no, no habrá nada que publicar.

> Los enlaces de X son **nofollow** (no pasan autoridad SEO), pero suman **tráfico,
> marca y menciones** (útil para GEO y búsquedas de marca).
