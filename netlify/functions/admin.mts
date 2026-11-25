// =============================================================
// API de l'espace admin MontCafé (Netlify Function)
//
//   POST /api/admin/login            { motDePasse } -> { jeton }
//   GET  /api/admin/donnees          -> { annonce, cafes, horaires } (+ sha de chaque fichier)
//   PUT  /api/admin/donnees/:fichier { contenu, sha } -> { sha }
//
// Variables d'environnement (Netlify > Environment variables, portée "Functions") :
//   ADMIN_PASSWORD  mot de passe de Laurent
//   GITHUB_TOKEN    jeton GitHub "fine-grained", dépôt MontCafe, Contents: Read and write
//   GITHUB_REPO     (optionnel) défaut "ReagZZZz/MontCafe"
//   GITHUB_BRANCH   (optionnel) défaut "main"
//
// Seuls les 3 fichiers de src/data/boutique/ peuvent être lus/écrits.
// Chaque enregistrement crée un commit -> Netlify republie le site (~1 min).
// =============================================================
import { createHmac, timingSafeEqual } from 'node:crypto';

const env = (k: string): string | undefined =>
  (globalThis as any).Netlify?.env?.get(k) ?? process.env[k];

const FICHIERS = {
  annonce: 'src/data/boutique/annonce.json',
  cafes: 'src/data/boutique/cafes.json',
  horaires: 'src/data/boutique/horaires.json',
} as const;
type NomFichier = keyof typeof FICHIERS;

const DUREE_SESSION = 30 * 24 * 3600 * 1000; // 30 jours
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
const erreur = (message: string, status: number) => json({ erreur: message }, status);

// ---------- Session : jeton signé "expiration.signature" ----------
const cle = () => `${env('ADMIN_PASSWORD')}|${env('GITHUB_TOKEN')}`; // changer le mot de passe invalide les sessions
const signer = (exp: string) => createHmac('sha256', cle()).update(exp).digest('base64url');
const egal = (a: string, b: string) => {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
};
const creerJeton = () => { const exp = String(Date.now() + DUREE_SESSION); return `${exp}.${signer(exp)}`; };
const jetonValide = (req: Request) => {
  const [exp, sig] = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').split('.');
  return !!exp && !!sig && Number(exp) > Date.now() && egal(sig, signer(exp));
};

// ---------- GitHub (API Contents) ----------
const gh = async (chemin: string, init: RequestInit = {}) => {
  const repo = env('GITHUB_REPO') ?? 'ReagZZZz/MontCafe';
  return fetch(`https://api.github.com/repos/${repo}/contents/${chemin}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'montcafe-admin',
      ...(init.headers ?? {}),
    },
  });
};
const branche = () => env('GITHUB_BRANCH') ?? 'main';

const lireFichier = async (nom: NomFichier) => {
  const r = await gh(`${FICHIERS[nom]}?ref=${branche()}`);
  if (!r.ok) throw new Error(`Lecture ${nom} : GitHub ${r.status}`);
  const d = await r.json();
  return { contenu: JSON.parse(Buffer.from(d.content, 'base64').toString('utf8')), sha: d.sha as string };
};

const ecrireFichier = async (nom: NomFichier, contenu: unknown, sha: string) => {
  const r = await gh(FICHIERS[nom], {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `Admin : mise à jour ${nom}`,
      content: Buffer.from(JSON.stringify(contenu, null, 2) + '\n', 'utf8').toString('base64'),
      sha,
      branch: branche(),
    }),
  });
  if (r.status === 409 || r.status === 422) return { conflit: true as const };
  if (!r.ok) throw new Error(`Écriture ${nom} : GitHub ${r.status}`);
  const d = await r.json();
  return { sha: d.content.sha as string };
};

// ---------- Validation : on ne garde que les champs attendus ----------
const texte = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const RE_HORAIRE = /^$|^\s*\d{1,2}[:hH]?\d{0,2}\s*-\s*\d{1,2}[:hH]?\d{0,2}\s*(,\s*\d{1,2}[:hH]?\d{0,2}\s*-\s*\d{1,2}[:hH]?\d{0,2}\s*)*$/;

const nettoyer: Record<NomFichier, (c: any) => unknown> = {
  annonce: (c) => ({
    actif: c?.actif === true,
    ton: ['nouveaute', 'info', 'fermeture'].includes(c?.ton) ? c.ton : 'info',
    texte: texte(c?.texte, 160),
  }),
  cafes: (c) => ({
    intro: texte(c?.intro, 400),
    categories: (Array.isArray(c?.categories) ? c.categories : []).slice(0, 8).map((cat: any) => ({
      nom: texte(cat?.nom, 40),
      produits: (Array.isArray(cat?.produits) ? cat.produits : []).slice(0, 30).map((p: any) => ({
        nom: texte(p?.nom, 60),
        origine: texte(p?.origine, 60),
        notes: (Array.isArray(p?.notes) ? p.notes : []).map((n: unknown) => texte(n, 30)).filter(Boolean).slice(0, 4),
        torrefaction: String(Math.min(5, Math.max(1, Number(p?.torrefaction) || 3))),
        prix: texte(p?.prix, 20),
        format: texte(p?.format, 20),
        disponible: p?.disponible !== false,
      })).filter((p: any) => p.nom),
    })).filter((cat: any) => cat.nom),
  }),
  horaires: (c) => {
    const h: Record<string, string> = {};
    for (const j of JOURS) {
      const v = texte(c?.[j], 60);
      if (!RE_HORAIRE.test(v)) throw new Error(`Horaire invalide pour ${j}`);
      h[j] = v;
    }
    return h;
  },
};

// ---------- Routeur ----------
export default async (req: Request) => {
  if (!env('ADMIN_PASSWORD') || !env('GITHUB_TOKEN')) {
    return erreur("L'espace admin n'est pas encore configuré (variables ADMIN_PASSWORD et GITHUB_TOKEN).", 503);
  }
  const route = new URL(req.url).pathname.replace(/^\/api\/admin\/?/, '');

  try {
    // Connexion
    if (route === 'login' && req.method === 'POST') {
      const { motDePasse } = await req.json().catch(() => ({}));
      if (typeof motDePasse === 'string' && egal(motDePasse, env('ADMIN_PASSWORD')!)) {
        return json({ jeton: creerJeton() });
      }
      await new Promise((r) => setTimeout(r, 1200)); // freine les essais en série
      return erreur('Mot de passe incorrect.', 401);
    }

    if (!jetonValide(req)) return erreur('Session expirée, reconnectez-vous.', 401);

    // Lecture des 3 fichiers
    if (route === 'donnees' && req.method === 'GET') {
      const [annonce, cafes, horaires] = await Promise.all(
        (Object.keys(FICHIERS) as NomFichier[]).map(lireFichier),
      );
      return json({ annonce, cafes, horaires });
    }

    // Écriture d'un fichier
    const m = route.match(/^donnees\/(annonce|cafes|horaires)$/);
    if (m && req.method === 'PUT') {
      const nom = m[1] as NomFichier;
      const { contenu, sha } = await req.json();
      if (typeof sha !== 'string') return erreur('Version du fichier manquante.', 400);
      let propre;
      try { propre = nettoyer[nom](contenu); } catch (e) { return erreur((e as Error).message, 400); }
      const res = await ecrireFichier(nom, propre, sha);
      if ('conflit' in res) return erreur('Ces données ont été modifiées ailleurs entre-temps. Rechargez la page.', 409);
      return json({ sha: res.sha, contenu: propre });
    }

    return erreur('Route inconnue.', 404);
  } catch (e) {
    console.error(e);
    return erreur("Problème de connexion avec l'enregistrement. Réessayez dans un instant.", 502);
  }
};

export const config = { path: ['/api/admin/*'] };
