// Lecture et nettoyage des données gérées par Laurent depuis /admin/
// (src/data/site.json : horaires, carte, alerteVacances). Tout ce que
// l'admin produit passe par ici, pour qu'une saisie imparfaite ne casse
// jamais le site.
import site from '../data/site.json';

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
export const horaires = JOURS.map((jour) => ({ jour, creneaux: creneaux(site.horaires?.[jour]) }));

/** Cafés : on n'affiche que ceux "en rayon", et les catégories non vides */
export const cafes = {
  intro: site.carte?.intro ?? '',
  categories: (site.carte?.categories ?? [])
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

/** Bandeau d'alerte / vacances (null si vide) */
export const annonce = site.alerteVacances?.trim() ? { texte: site.alerteVacances.trim() } : null;

/** Infos fixes du commerce + SEO + mentions légales */
export const commerce = site.commerce;
export const infosSite = site.site;
export const mentionsLegales = site.mentionsLegales;
export const avis = site.avis;
export const atelier = site.atelier;
export const services = site.services;
