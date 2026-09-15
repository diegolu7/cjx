# seo.md — SEO / GEO (implementado y pendientes)

## Implementado

**Técnico**
- `public/robots.txt` con sitemap y crawlers de IA (GPTBot, Google-Extended, PerplexityBot, ClaudeBot).
- `sitemap-index.xml` / `sitemap-0.xml` vía `@astrojs/sitemap`.
- `canonical` + Open Graph + Twitter Cards (`og:locale=es_AR`, `og:image`).
- `lang="es-AR"`.
- Página `404` propia (noindex).
- **Un solo H1 por página** (marca del header dejó de ser H1).

**Datos estructurados (JSON-LD)**
- Site-wide: `WebSite` + `Organization`.
- Home: `SportsEvent` (próximo partido) + `SportsTeam`.
- `/info`: `FAQPage`.
- Páginas legales: `BreadcrumbList`.

**Contenido / GEO**
- `public/llms.txt` con resumen, hechos clave y links.
- **SSG**: la agenda (featured + timeline) está en el HTML → rastreable por buscadores y LLMs. El próximo partido también se expone en JSON-LD `SportsEvent`.

**Performance**
- Isla con `client:visible`; `preload` de la fuente.
- Imagen OG 1200×630 (85 KB).

## Pendientes (requieren tus cuentas)

1. **Google Search Console**: verificar propiedad por dominio `https://cuandojuegaelxeneize.com.ar/` (DNS TXT en Cloudflare), enviar `sitemap-index.xml`.
2. **Bing Webmaster Tools**: verificar y enviar sitemap.
3. **GA4**: reemplazar `G-XXXXXXXXXX` en `src/components/Analytics.astro` por el Measurement ID real.
4. **Validaciones**: Rich Results Test (SportsEvent, FAQ, Breadcrumb) y PageSpeed/Lighthouse.
5. **Dominio propio**: `site`, `base`, `robots.txt`, `llms.txt` y `public/CNAME` ya apuntan a `cuandojuegaelxeneize.com.ar`. Falta configurar DNS en Cloudflare y el custom domain en GitHub Pages (ver `pendientes.md`).

## Guardrails legal-safe
- Sin "oficial"; disclaimer visible; marcas en uso descriptivo; sin escudo/colores institucionales.
- Datos estructurados **veraces** (no marcar eventos falsos).
- Sin keyword stuffing / cloaking / doorway / texto oculto.
- Consentimiento de cookies para Analytics.
- Verificación de marca "Xeneize" en INPI (pendiente, abogado).
