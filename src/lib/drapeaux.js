// Fait correspondre un nom de pays d'origine (tel que saisi dans la carte des cafés)
// à son code pays ISO 3166-1 alpha-2, utilisé pour afficher un petit drapeau (via
// flagcdn.com, en SVG). On n'utilise pas les emoji drapeaux : Android et ChromeOS
// ne les affichent pas (choix délibéré de Google) et montrent le code-lettres brut
// à la place (ex. "ET" au lieu de 🇪🇹) — une vraie image est fiable partout.
// Les assemblages maison ("Le Saint-Aubert", "Décaféiné"...) ne correspondent à
// aucun pays : aucun drapeau n'est alors affiché, ce qui est voulu.
const CODES_PAYS = {
  'éthiopie': 'et',
  'kenya': 'ke',
  'rwanda': 'rw',
  'burundi': 'bi',
  'tanzanie': 'tz',
  'ouganda': 'ug',
  'colombie': 'co',
  'brésil': 'br',
  'bresil': 'br',
  'guatemala': 'gt',
  'costa rica': 'cr',
  'honduras': 'hn',
  'nicaragua': 'ni',
  'panama': 'pa',
  'salvador': 'sv',
  'el salvador': 'sv',
  'mexique': 'mx',
  'pérou': 'pe',
  'perou': 'pe',
  'bolivie': 'bo',
  'équateur': 'ec',
  'equateur': 'ec',
  'cuba': 'cu',
  'jamaïque': 'jm',
  'jamaique': 'jm',
  'république dominicaine': 'do',
  'republique dominicaine': 'do',
  'inde': 'in',
  'indonésie': 'id',
  'indonesie': 'id',
  'vietnam': 'vn',
  'yémen': 'ye',
  'yemen': 'ye',
  'papouasie-nouvelle-guinée': 'pg',
  'papouasie-nouvelle-guinee': 'pg',
};

function cleAscii(nom) {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Retourne le code ISO alpha-2 (ex. "et") ou '' si non reconnu.
export function codePays(nom) {
  if (!nom) return '';
  const cle = nom.toLowerCase().trim();
  return CODES_PAYS[cle] || CODES_PAYS[cleAscii(nom)] || '';
}
