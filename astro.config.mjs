// Configuration Astro : site 100 % statique + sitemap automatique
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import data from './src/data/data.json' with { type: 'json' };

// GITHUB_PAGES=1 : build pour https://reagzzzz.github.io/MontCafe/ (sous-dossier)
// Sinon : build à la racine (Netlify ou domaine perso, URL lue dans data.json)
const ghPages = process.env.GITHUB_PAGES === '1';

export default defineConfig({
  site: ghPages ? 'https://reagzzzz.github.io' : data.site.url,
  base: ghPages ? '/MontCafe/' : '/',
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  build: { inlineStylesheets: 'always' }, // CSS inliné : zéro requête bloquante
});
