// Génère les liens d'action à partir des infos du commerce
export const liens = (c) => {
  const adresse = `${c.nom}, ${c.adresse.rue}, ${c.adresse.codePostal} ${c.adresse.ville}`;
  return {
    // Ouvre directement le guidage Google Maps (appli native sur mobile)
    itineraire: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresse)}&destination_place_id=${c.googlePlaceId}`,
    appel: `tel:${c.telephone}`,
    // Iframe sans clé API, chargée uniquement au clic
    embed: `https://www.google.com/maps?q=${encodeURIComponent(adresse)}&output=embed`,
  };
};
