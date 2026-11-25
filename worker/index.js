// Point d'entrée du Worker : sert le site statique (dist/, via le
// binding ASSETS) et intercepte /api/admin/* pour l'espace boutique.
import { handleAdmin } from './admin.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/admin/')) {
      return handleAdmin(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
