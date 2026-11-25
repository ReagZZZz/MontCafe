# MontCafé – site vitrine (Astro statique)

## Lancer
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/ (à déployer sur Netlify : build "npm run build", dossier "dist")

## Modifier le contenu (30 secondes)
Tout est dans `src/data/data.json` : horaires, téléphone, adresse, cafés/prix, réseaux, mentions légales.
- Un prix à "A_CONFIRMER" est masqué automatiquement sur le site.
- Réseaux : renseigner l'URL Instagram/Facebook → l'icône apparaît toute seule.
- Photo du hero : remplacer `src/assets/hero.jpg` (Astro la convertit en WebP).

## Arborescence
src/data/data.json            ← données client (seul fichier à toucher)
src/layouts/Base.astro        ← <head> SEO, Open Graph
src/components/               ← Hero, Carte, Infos, Footer, BarreActions, Schema (JSON-LD), StatutOuverture
src/pages/index.astro         ← page unique
src/pages/mentions-legales.astro

## À valider avec le client avant mise en ligne
- Adresse boutique : Google indique 5 place Saint-Aubert, le RCS 3 place Saint-Aubert (siège).
- Gamme réelle et prix (les cafés actuels sont des exemples).
- E-mail, n° TVA intracom, comptes Instagram/Facebook, vraie photo, nom de domaine (data.json > site.url + public/robots.txt).
