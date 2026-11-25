# MontCafé – site vitrine (Astro statique)

## Identité
Palette de la baie (brume, grève, ardoise) + échelle de torréfaction du grain vert au grain foncé, utilisée comme signature (bande du hero, niveaux des cafés, étapes de l'atelier). Police : Bricolage Grotesque auto-hébergée.

## Lancer
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
# Mise en ligne : Netlify, relié au dépôt GitHub ; chaque push sur main republie le site

## Modifier le contenu (30 secondes)
Tout est dans `src/data/data.json` : horaires, téléphone, adresse, cafés/prix, réseaux, mentions légales.
- Un prix à "A_CONFIRMER" est masqué automatiquement sur le site.
- Réseaux : renseigner l'URL Instagram/Facebook → l'icône apparaît toute seule.
- Visuel du hero : la baie du Mont est dessinée en SVG dans `src/components/Hero.astro` (aucune photo nécessaire).
- Avis Google : mettre à jour `avis.note` et `avis.nombre` de temps en temps.
- Cafés : `torrefaction` de 1 (très claire) à 5 (foncée), `notes` = 2-3 arômes.

## Arborescence
src/data/data.json            ← données client (seul fichier à toucher)
src/layouts/Base.astro        ← <head> SEO, Open Graph
src/components/               ← Hero, Avis, Atelier, Carte, Infos, Footer, BarreActions, Schema (JSON-LD), StatutOuverture
src/pages/index.astro         ← page unique
src/pages/mentions-legales.astro

## À valider avec le client avant mise en ligne
- Adresse boutique : Google indique 5 place Saint-Aubert, le RCS 3 place Saint-Aubert (siège).
- Gamme réelle, niveaux de torréfaction et prix (les cafés actuels sont des exemples, dont les noms d'assemblage « Le Saint-Aubert » et « Grève »).
- E-mail, n° TVA intracom, comptes Instagram/Facebook, vraie photo, nom de domaine (data.json > site.url + public/robots.txt).

## Espace admin (Laurent)
Adresse : `/admin/` (page `src/pages/admin.astro`), connexion par simple mot de passe, session de 30 jours.
Laurent y gère : les cafés du moment (« En rayon » pour masquer un café épuisé), l'annonce du bandeau et les horaires.

Fonctionnement : la page appelle `netlify/functions/admin.mts` (route `/api/admin/*`), qui vérifie le mot de passe,
puis lit/écrit uniquement `src/data/boutique/*.json` sur GitHub. Chaque enregistrement = 1 commit sur `main`
→ Netlify republie le site (~1 min). `data.json` (mentions légales, SEO, coordonnées) n'est jamais exposé.

Variables Netlify (Project configuration > Environment variables, portée Functions incluse) :
- `ADMIN_PASSWORD` : mot de passe de Laurent (le changer déconnecte toutes les sessions)
- `GITHUB_TOKEN` : jeton GitHub fine-grained, dépôt MontCafe uniquement, permission Contents : Read and write
- `GITHUB_REPO` / `GITHUB_BRANCH` : optionnels (défauts `ReagZZZz/MontCafe` / `main`)
