// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://cuandojuegaelxeneize.com.ar';

// Datos del snapshot (para lastmod y para excluir páginas noindex del sitemap).
let dataUpdatedAt;
let noindexPaths = new Set();
try {
  const data = JSON.parse(
    readFileSync(new URL('./src/data/matches.json', import.meta.url), 'utf8'),
  );
  dataUpdatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
  /** @type {{ slug?: string, indexable?: boolean }[]} */
  const matchList = data.matches ?? [];
  noindexPaths = new Set(
    matchList
      .filter((m) => m?.indexable !== true)
      .map((m) => `/partidos/${m.slug}/`),
  );
} catch {
  dataUpdatedAt = undefined;
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: '/',
  integrations: [
    sitemap({
      // Las páginas por partido sin contenido suficiente van con noindex → fuera del sitemap.
      filter: (page) => {
        try {
          return !noindexPaths.has(new URL(page).pathname);
        } catch {
          return true;
        }
      },
      serialize(item) {
        // La home cambia cuando cambian los datos: le ponemos el lastmod real.
        if (dataUpdatedAt && item.url === `${SITE}/`) {
          return { ...item, lastmod: dataUpdatedAt.toISOString() };
        }
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
