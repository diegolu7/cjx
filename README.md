# Cuando Juega el Xeneize

Sitio no oficial que muestra próximos partidos, rivales, horarios y resultados de Boca Juniors.

**Propuesta de valor:** "Entrás, ves cuándo juega Boca, y te vas. Sin vueltas."

## Stack

- Astro + TypeScript (100% estático, sin islands)
- Tailwind CSS v4 (tokens mapeados desde `design.md`)
- Datos: API de **ESPN** (`npm run snapshot` → `src/data/matches.json`)

## Desarrollo

```sh
npm install
npm run dev       # servidor de desarrollo
npm run build     # build estático → ./dist
npm run preview   # previsualizar el build
npm run check     # typecheck (astro check)
npm run snapshot  # actualiza la agenda desde ESPN
npm test          # tests de contrato
```

> Requiere Node >= 22.12 (usar `nvm use 22`).

## Docs

- `docs/datos-espn.md` — de dónde salen los partidos (operativo)
- `docs/plan-i18n.md` — plan de traducción ES/EN
- `docs/plan-en-vivo.md` — plan del indicador EN VIVO
- `PLAN.md` — plan maestro (histórico: el backend ya no es el Google Sheet)
- `design.md` — fuente de verdad del diseño UI/UX

Sitio no afiliado a AFA ni al Club Atlético Boca Juniors. Información oficial: [bocajuniors.com.ar](https://www.bocajuniors.com.ar).
