// Lecture et nettoyage des données gérées par Laurent depuis /admin/
// (src/data/boutique/*.json). Tout ce que l'admin produit passe par ici,
// pour qu'une saisie imparfaite ne casse jamais le site.
import horairesBruts from '../data/boutique/horaires.json';
import cafesBruts from '../data/boutique/cafes.json';
import annonceBrute from '../data/boutique/annonce.json';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

// "9h", "9:00", "13h30" -> "09:00", "13:30"
const heure = (h) => {
  const m = String(h).trim().match(/^(\d{1,2})\s*[:hH]?\s*(\d{2})?$/);
  return m ? `${m[1].padStart(2, '0')}:${m[2] ?? '00'}` : null;
};

// "10:00-12:30, 13:30-19:00" -> [["10:00","12:30"],["13:30","19:00"]]
const creneaux = (texte = '') =>
  String(texte)
    .split(/[,;]/)
    .map((c) => c.split(/[-–à]/).map(heure))
    .filter(([a, b]) => a && b);

/** Horaires de la semaine, lundi -> dimanche */
export const horaires = JOURS.map((jour) => ({ jour, creneaux: creneaux(horairesBruts[jour]) }));

/** Cafés : on n'affiche que ceux "en rayon", et les catégories non vides */
export const cafes = {
  intro: cafesBruts.intro ?? '',
  categories: (cafesBruts.categories ?? [])
    .map((cat) => ({
      nom: cat.nom,
      produits: (cat.produits ?? [])
        .filter((p) => p.nom && p.disponible !== false)
        .map((p) => ({
          ...p,
          notes: (p.notes ?? []).filter(Boolean),
          torrefaction: Math.min(5, Math.max(0, Number(p.torrefaction) || 0)),
        })),
    }))
    .filter((cat) => cat.nom && cat.produits.length),
};

/** Bandeau d'annonce (null si désactivé ou vide) */
export const annonce = annonceBrute.actif && annonceBrute.texte?.trim() ? annonceBrute : null;
