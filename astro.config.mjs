// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://cuandojuegaelxeneize.com.ar';

// lastmod del sitemap = cuándo se actualizaron los datos (matches.json).
let dataUpdatedAt;
try {
  const data = JSON.parse(
    readFileSync(new URL('./src/data/matches.json', import.meta.url), 'utf8'),
  );
  dataUpdatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
} catch {
  dataUpdatedAt = undefined;
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: '/',
  integrations: [
    react(),
    sitemap({
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
