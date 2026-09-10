# Cuando Juega el Xeneize

Sitio no oficial que muestra próximos partidos, rivales, horarios y resultados de Boca Juniors.

**Propuesta de valor:** "Entrás, ves cuándo juega Boca, y te vas. Sin vueltas."

## Stack

- Astro + TypeScript
- React (islands) — tabs y filtros
- Tailwind CSS v4 (tokens mapeados desde `design.md`)
- Backend: Google Sheets publicado como CSV

## Desarrollo

```sh
npm install
npm run dev       # servidor de desarrollo
npm run build     # build estático → ./dist
npm run preview   # previsualizar el build
npm run check     # typecheck (astro check)
```

> Requiere Node >= 22.12 (usar `nvm use 22`).

## Docs

- `PLAN.md` — plan maestro (Google Sheet, Apps Script, fases, SEO/legal)
- `design.md` — fuente de verdad del diseño UI/UX

Sitio no afiliado a AFA ni al Club Atlético Boca Juniors. Información oficial: [bocajuniors.com.ar](https://www.bocajuniors.com.ar).
