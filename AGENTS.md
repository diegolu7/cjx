## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Data source

La agenda (próximos partidos, resultados, estados, alineaciones y estadísticas) viene de **ESPN**,
no de un Google Sheet. `npm run snapshot` la baja y escribe `src/data/matches.json`;
`npm run snapshot:dry` muestra el resumen sin escribir.

```
npm run snapshot     # actualiza src/data/matches.json
npm run snapshot:dry # simulación (no escribe)
npm test             # tests de contrato (node --test)
npm run check        # astro check
npm run build        # build SSG
```

Detalles de la integración: `docs/datos-espn.md`.

> Node local: el proyecto pide **Node >= 22.12** (`nvm use 22`). Con Node 20, `astro check/build` falla.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
