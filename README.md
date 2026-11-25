# MontCafé – site vitrine (Astro statique)

## Identité
Palette de la baie (brume, grève, ardoise) + échelle de torréfaction du grain vert au grain foncé, utilisée comme signature (bande du hero, niveaux des cafés, étapes de l'atelier). Police : Bricolage Grotesque auto-hébergée.

## Lancer
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
# Mise en ligne : chaque push sur main publie automatiquement sur GitHub Pages (.github/workflows/pages.yml)

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
Outil : Pages CMS (https://app.pagescms.org), configuré par `.pages.yml` à la racine. `/admin/` redirige vers lui.
Laurent y modifie : l'annonce du bandeau, les cafés du moment (« En rayon » pour masquer un café épuisé) et les horaires.
Ces données sont dans `src/data/boutique/*.json` ; `data.json` (mentions légales, SEO, coordonnées) n'est pas exposé.
Chaque enregistrement crée un commit sur `main` → le workflow republie le site en ~1 minute.

Mise en place (Paul, une fois) :
1. app.pagescms.org > se connecter avec GitHub > installer l'appli GitHub sur le dépôt MontCafe.
2. Ouvrir le dépôt dans Pages CMS > Collaborateurs > inviter l'e-mail de Laurent.
3. Laurent reçoit un e-mail et se connecte avec ce même e-mail : pas de compte GitHub.
