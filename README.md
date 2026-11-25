# MontCafé – site vitrine (Astro statique + Tailwind)

## Identité
Palette de la baie (brume, grève, ardoise) + échelle de torréfaction du grain vert au grain foncé, utilisée comme signature (bande du hero, niveaux des cafés, étapes de l'atelier). Police : Bricolage Grotesque auto-hébergée.

## Lancer
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
# Mise en ligne : Cloudflare Worker (assets + API), relié au dépôt GitHub ; chaque push sur main republie le site
npx wrangler dev   # pour tester le Worker en local (site + /api/admin/*)

## Modifier le contenu (30 secondes)
Tout est dans `src/data/site.json` : horaires, téléphone, adresse, cafés/prix, réseaux, mentions légales.
- Un prix à "A_CONFIRMER" est masqué automatiquement sur le site.
- Réseaux : renseigner l'URL Instagram/Facebook → l'icône apparaît toute seule.
- Visuel du hero : la baie du Mont est dessinée en SVG dans `src/components/Hero.astro` (aucune photo nécessaire).
- Avis Google : mettre à jour `avis.note` et `avis.nombre` de temps en temps.
- Cafés : `torrefaction` de 1 (très claire) à 5 (foncée), `notes` = 2-3 arômes.
- `alerteVacances` : bandeau en haut du site, affiché uniquement si le texte n'est pas vide.
- `commande.formulaireAction` : URL Formspree qui reçoit les commandes (voir ci-dessous).

## Arborescence
src/data/site.json            ← toutes les données variables (seul fichier à toucher)
src/layouts/Base.astro        ← <head> SEO, Open Graph
src/components/               ← Hero, Avis, Atelier, Carte, Infos, Footer, BarreActions, Schema (JSON-LD), StatutOuverture, Annonce
src/pages/index.astro         ← page d'accueil
src/pages/commander.astro     ← formulaire de commande à emporter (→ Formspree)
src/pages/mentions-legales.astro
src/pages/admin.astro         ← espace boutique de Laurent
worker/index.js               ← point d'entrée du Worker (sert dist/ + route /api/admin/*)
worker/admin.js                ← backend de l'admin (lecture/écriture GitHub)
wrangler.jsonc                 ← config du Worker (assets, nom, date de compatibilité)

## Commande à emporter (`/commander/`)
Formulaire HTML pur (aucun JavaScript requis, aucune base de données) : il envoie directement un e-mail
via **Formspree**, conformément au principe KISS du projet (pas de backend pour une simple prise de
commande sans paiement en ligne).

À faire avant mise en ligne :
1. Créer un compte gratuit sur [formspree.io](https://formspree.io) avec l'e-mail de Laurent (ou le tien,
   à transférer ensuite).
2. Créer un formulaire ("New Form"), copier son URL (`https://formspree.io/f/xxxxxxxx`).
3. Remplacer `A_CONFIRMER` dans `src/data/site.json > commande.formulaireAction` par cette URL.
4. Commit + push : Cloudflare Pages republie automatiquement.

Chaque commande (nom, téléphone, créneau de retrait, cafés cochés, précisions) arrive par e-mail à
Laurent. Pas de paiement en ligne : le client règle au retrait, comme convenu.

## À valider avec le client avant mise en ligne
- Adresse boutique : Google indique 5 place Saint-Aubert, le RCS 3 place Saint-Aubert (siège).
- Gamme réelle, niveaux de torréfaction et prix (les cafés actuels sont des exemples, dont les noms d'assemblage « Le Saint-Aubert » et « Grève »).
- E-mail, n° TVA intracom, comptes Instagram/Facebook, vraie photo, nom de domaine (site.json > site.url + public/robots.txt).

## Espace admin (Laurent)
Adresse : `/admin/` (page `src/pages/admin.astro`), connexion par simple mot de passe, session de 30 jours.
Laurent y gère : les cafés du moment (« En rayon » pour masquer un café épuisé), l'alerte/bandeau et les horaires.
Il n'a jamais besoin d'un compte GitHub.

Fonctionnement : la page appelle `/api/admin/*`, intercepté par `worker/index.js` et traité par
`worker/admin.js`, qui vérifie le mot de passe puis lit/écrit `src/data/site.json` sur GitHub via son API.
Chaque enregistrement = 1 commit sur `main` → le Worker republie le site au prochain déploiement (déclenché
par le push, ~30 s).

## Déploiement (Cloudflare Worker)
Cloudflare a fusionné Pages et Workers : ce projet est déployé comme un **Worker avec assets statiques**
(domaine `*.workers.dev` ou domaine perso), pas comme un projet « Pages » classique.

1. Sur dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository** (ou « Connect to Git »
   selon la version de l'interface) → dépôt `ReagZZZz/MontCafe`, branche `main`.
2. Build command : `npm run build` (génère `dist/`). Le fichier `wrangler.jsonc` à la racine indique à
   Cloudflare où sont les assets (`dist/`) et le code du Worker (`worker/index.js`) — à vérifier dans
   **Settings → Build** que la commande de déploiement utilise bien `wrangler deploy` (c'est la valeur par
   défaut quand un `wrangler.jsonc` est détecté).
3. **Settings → Variables and Secrets** :
   - `ADMIN_PASSWORD` : mot de passe de Laurent (le changer déconnecte toutes les sessions) — type **Secret**
   - `GITHUB_TOKEN` : jeton GitHub fine-grained, dépôt `MontCafe` uniquement, permission **Contents: Read and write** — type **Secret**
   - `GITHUB_REPO` / `GITHUB_BRANCH` : optionnels (défauts `ReagZZZz/montcafe` / `main`) — type **Text**
4. Déployer. Teste ensuite `/admin/` (connexion) et `/commander/` (envoi d'une commande test).

Pour tester en local avant de pousser : créer un fichier `.dev.vars` (jamais commité) avec
`ADMIN_PASSWORD=...` et `GITHUB_TOKEN=...`, puis `npx wrangler dev`.
