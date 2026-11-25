// Utilitaires horaires : conversion pour l'affichage et pour Schema.org
// Les données viennent de src/data/data.json

const JOURS_SCHEMA = {
  lundi: 'Monday', mardi: 'Tuesday', mercredi: 'Wednesday', jeudi: 'Thursday',
  vendredi: 'Friday', samedi: 'Saturday', dimanche: 'Sunday',
};

// "13:30" -> "13h30", "19:00" -> "19h"
export const hFr = (h) => h.replace(/^0/, '').replace(':00', 'h').replace(':', 'h');

// Texte lisible d'une journée : "10h – 12h30 · 13h30 – 19h" ou "Fermé"
export const texteJour = (creneaux) =>
  creneaux.length ? creneaux.map(([a, b]) => `${hFr(a)} – ${hFr(b)}`).join(' · ') : 'Fermé';

// Tableau openingHoursSpecification pour le JSON-LD
export const horairesSchema = (horaires) =>
  horaires.flatMap(({ jour, creneaux }) =>
    creneaux.map(([opens, closes]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: JOURS_SCHEMA[jour],
      opens,
      closes,
    }))
  );
