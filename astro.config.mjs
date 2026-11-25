// Configuration Astro : site 100 % statique + sitemap automatique + Tailwind
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import site from './src/data/site.json' with { type: 'json' };

export default defineConfig({
  site: site.site.url,
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'always' }, // CSS inliné : zéro requête bloquante
});
