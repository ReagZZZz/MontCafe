// Configuration Astro : site 100 % statique + sitemap automatique
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import data from './src/data/data.json' with { type: 'json' };

export default defineConfig({
  site: data.site.url,
  output: 'static',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' }, // CSS inliné : zéro requête bloquante
});
