// Fait correspondre un nom de pays d'origine (tel que saisi dans la carte des cafés)
// à son drapeau emoji. Les assemblages maison ("Le Saint-Aubert", "Décaféiné"...)
// ne correspondent à aucun pays : aucun drapeau n'est alors affiché, ce qui est voulu.
const DRAPEAUX = {
  'éthiopie': '🇪🇹',
  'kenya': '🇰🇪',
  'rwanda': '🇷🇼',
  'burundi': '🇧🇮',
  'tanzanie': '🇹🇿',
  'ouganda': '🇺🇬',
  'colombie': '🇨🇴',
  'brésil': '🇧🇷',
  'bresil': '🇧🇷',
  'guatemala': '🇬🇹',
  'costa rica': '🇨🇷',
  'honduras': '🇭🇳',
  'nicaragua': '🇳🇮',
  'panama': '🇵🇦',
  'salvador': '🇸🇻',
  'el salvador': '🇸🇻',
  'mexique': '🇲🇽',
  'pérou': '🇵🇪',
  'perou': '🇵🇪',
  'bolivie': '🇧🇴',
  'équateur': '🇪🇨',
  'equateur': '🇪🇨',
  'cuba': '🇨🇺',
  'jamaïque': '🇯🇲',
  'jamaique': '🇯🇲',
  'république dominicaine': '🇩🇴',
  'republique dominicaine': '🇩🇴',
  'inde': '🇮🇳',
  'indonésie': '🇮🇩',
  'indonesie': '🇮🇩',
  'vietnam': '🇻🇳',
  'yémen': '🇾🇪',
  'yemen': '🇾🇪',
  'papouasie-nouvelle-guinée': '🇵🇬',
  'papouasie-nouvelle-guinee': '🇵🇬',
};

function cleAscii(nom) {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function drapeauPays(nom) {
  if (!nom) return '';
  const cle = nom.toLowerCase().trim();
  return DRAPEAUX[cle] || DRAPEAUX[cleAscii(nom)] || '';
}
