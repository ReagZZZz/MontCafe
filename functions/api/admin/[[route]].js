// Fonction Cloudflare Pages : backend de /admin/.
// Laurent se connecte par mot de passe, les modifications sont écrites
// directement dans src/data/site.json via l'API GitHub (pas de base de
// données, conformément aux principes KISS du projet).

const CHEMIN_SITE = 'src/data/site.json';
const DUREE_SESSION = 30 * 24 * 3600 * 1000; // 30 jours
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
const erreur = (message, status) => json({ erreur: message }, status);

// ---------- Session : jeton signé "expiration.signature" ----------
const cle = (env) => `${env.ADMIN_PASSWORD}|${env.GITHUB_TOKEN}`;

const signer = async (exp, env) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(cle(env)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(exp));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const egal = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const creerJeton = async (env) => {
  const exp = String(Date.now() + DUREE_SESSION);
  return `${exp}.${await signer(exp, env)}`;
};

const jetonValide = async (request, env) => {
  const [exp, sig] = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').split('.');
  if (!exp || !sig || Number(exp) <= Date.now()) return false;
  return egal(sig, await signer(exp, env));
};

// ---------- GitHub (API Contents) ----------
const gh = async (env, init = {}) => {
  const repo = env.GITHUB_REPO ?? 'ReagZZZz/montcafe';
  return fetch(`https://api.github.com/repos/${repo}/contents/${CHEMIN_SITE}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'montcafe-admin',
      ...(init.headers ?? {}),
    },
  });
};
const branche = (env) => env.GITHUB_BRANCH ?? 'main';

const lireSite = async (env) => {
  const r = await gh(env, { method: 'GET' });
  if (!r.ok) throw new Error(`Lecture site.json : GitHub ${r.status}`);
  const d = await r.json();
  const contenu = JSON.parse(decodeURIComponent(escape(atob(d.content.replace(/\n/g, '')))));
  return { contenu, sha: d.sha };
};

const ecrireSite = async (env, contenu, sha) => {
  const texte = JSON.stringify(contenu, null, 2) + '\n';
  const b64 = btoa(unescape(encodeURIComponent(texte)));
  const r = await gh(env, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Admin : mise à jour site.json',
      content: b64,
      sha,
      branch: branche(env),
    }, null, 0),
    headers: { 'content-type': 'application/json' },
  });
  if (r.status === 409 || r.status === 422) return { conflit: true };
  if (!r.ok) throw new Error(`Écriture site.json : GitHub ${r.status}`);
  const d = await r.json();
  return { sha: d.content.sha };
};

// ---------- Validation ----------
const texte = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const RE_HORAIRE = /^$|^\s*\d{1,2}[:hH]?\d{0,2}\s*-\s*\d{1,2}[:hH]?\d{0,2}\s*(,\s*\d{1,2}[:hH]?\d{0,2}\s*-\s*\d{1,2}[:hH]?\d{0,2}\s*)*$/;

const nettoyer = {
  alerteVacances: (v) => texte(v, 160),
  carte: (c) => ({
    intro: texte(c?.intro, 400),
    categories: (Array.isArray(c?.categories) ? c.categories : []).slice(0, 8).map((cat) => ({
      nom: texte(cat?.nom, 40),
      produits: (Array.isArray(cat?.produits) ? cat.produits : []).slice(0, 30).map((p) => ({
        nom: texte(p?.nom, 60),
        origine: texte(p?.origine, 60),
        notes: (Array.isArray(p?.notes) ? p.notes : []).map((n) => texte(n, 30)).filter(Boolean).slice(0, 4),
        torrefaction: String(Math.min(5, Math.max(1, Number(p?.torrefaction) || 3))),
        prix: texte(p?.prix, 20),
        format: texte(p?.format, 20),
        disponible: p?.disponible !== false,
      })).filter((p) => p.nom),
    })).filter((cat) => cat.nom),
  }),
  horaires: (c) => {
    const h = {};
    for (const j of JOURS) {
      const v = texte(c?.[j], 60);
      if (!RE_HORAIRE.test(v)) throw new Error(`Horaire invalide pour ${j}`);
      h[j] = v;
    }
    return h;
  },
};

// ---------- Routeur ----------
export async function onRequest(context) {
  const { request, env } = context;

  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
    return erreur("L'espace admin n'est pas encore configuré (variables ADMIN_PASSWORD et GITHUB_TOKEN).", 503);
  }
  const route = new URL(request.url).pathname.replace(/^\/api\/admin\/?/, '');

  try {
    if (route === 'login' && request.method === 'POST') {
      const { motDePasse } = await request.json().catch(() => ({}));
      if (typeof motDePasse === 'string' && motDePasse.length === env.ADMIN_PASSWORD.length && egal(motDePasse, env.ADMIN_PASSWORD)) {
        return json({ jeton: await creerJeton(env) });
      }
      await new Promise((r) => setTimeout(r, 1200));
      return erreur('Mot de passe incorrect.', 401);
    }

    if (!(await jetonValide(request, env))) return erreur('Session expirée, reconnectez-vous.', 401);

    if (route === 'donnees' && request.method === 'GET') {
      const { contenu, sha } = await lireSite(env);
      return json({
        sha,
        alerteVacances: contenu.alerteVacances ?? '',
        carte: contenu.carte ?? { intro: '', categories: [] },
        horaires: contenu.horaires ?? {},
      });
    }

    const m = route.match(/^donnees\/(alerteVacances|carte|horaires)$/);
    if (m && request.method === 'PUT') {
      const nom = m[1];
      const { contenu, sha } = await request.json();
      if (typeof sha !== 'string') return erreur('Version du fichier manquante.', 400);

      let propre;
      try { propre = nettoyer[nom](contenu); } catch (e) { return erreur(e.message, 400); }

      const { contenu: siteActuel, sha: shaReel } = await lireSite(env);
      if (shaReel !== sha) return erreur('Ces données ont été modifiées ailleurs entre-temps. Rechargez la page.', 409);

      const nouveauSite = { ...siteActuel, [nom]: propre };
      const res = await ecrireSite(env, nouveauSite, sha);
      if (res.conflit) return erreur('Ces données ont été modifiées ailleurs entre-temps. Rechargez la page.', 409);
      return json({ sha: res.sha, contenu: propre });
    }

    return erreur('Route inconnue.', 404);
  } catch (e) {
    console.error(e);
    return erreur("Problème de connexion avec l'enregistrement. Réessayez dans un instant.", 502);
  }
}
