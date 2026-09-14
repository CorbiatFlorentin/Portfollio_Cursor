import type { ProjectDto } from "../types.js";

type StaticProject = ProjectDto & { readmeMarkdown: string };

const staticProjectsWithReadme: StaticProject[] = [
  {
    id: "manual-jimmy-conciergerie",
    title: "JLS Conciergerie",
    description:
      "Site vitrine de JLS Conciergerie, spécialiste de la conciergerie Airbnb et de la location courte durée en Charente et Nouvelle-Aquitaine.",
    technologies: ["PHP", "JavaScript", "CSS"],
    liveUrl: "https://jlsconciergerie.fr/",
    readmeMarkdown: `# JLS Conciergerie

Site vitrine de JLS Conciergerie, spécialiste de la conciergerie Airbnb et de la location courte durée en Charente et Nouvelle-Aquitaine (Angoulême, Cognac, Saintes…).

Le site est entièrement gérable par le client depuis un espace d'administration, sans toucher au code, et pré-rendu côté serveur en PHP pour un référencement (SEO) optimal — sans build ni dépendance externe.

🔗 **Production :** [jlsconciergerie.fr](https://jlsconciergerie.fr/)

## Comment ça marche

\`\`\`
data/content.json    ← tout le contenu du site (FR + EN), édité via l'admin
render.php           ← génère le HTML côté serveur depuis content.json (SEO)
index.php            ← page publique (utilise render.php + injecte le contenu pour le JS)
admin/index.php      ← espace client (login + modules de gestion de contenu)
config.php           ← identifiants, session, CSRF, upload, fonctions communes
app.js / data.js     ← interactivité côté client (bascule FR/EN, animations, données EN)
styles.css           ← styles du site public
fonts/                ← polices auto-hébergées (Cormorant Garamond, Montserrat)
\`\`\`

Le flux de contenu :

1. Le client édite un module dans \`/admin\` → \`admin/index.php\` réécrit \`data/content.json\`.
2. Un visiteur arrive sur le site → \`index.php\` (via \`render.php\`) génère le HTML avec le contenu à jour : Google et les réseaux sociaux voient toujours la version courante, sans build manuel.
3. Le JavaScript (\`app.js\`, \`data.js\`) prend ensuite le relais côté client pour l'interactivité (bascule FR/EN, animations au scroll, formulaire de contact…).

Le site est bilingue FR/EN : bascule via un sélecteur en haut de page, ou directement via \`?lang=en\` pour le référencement international.

## Espace d'administration

Accessible sur \`/admin\`, protégé par un identifiant/mot de passe.

Modules gérables :

| Module | Contenu |
|---|---|
| Logements | Ajout / modification / suppression d'un bien (nom, ville, note, description, photo) |
| Avis clients | Témoignages |
| Chiffres clés | Les 4 statistiques mises en avant + titre de section |
| Historique | Étapes de la frise chronologique (année, titre, texte, photo) |
| Textes du site | Tous les titres et paragraphes (accueil, services, process, à-propos, FAQ, contact…) |
| Coordonnées & réseaux | Email, zone d'intervention, liens Facebook / Instagram, pied de page |

Toute modification est visible immédiatement sur le site public.

## Sécurité

- Mot de passe admin haché (bcrypt), jamais stocké en clair.
- Protection anti-CSRF sur tous les formulaires de l'admin.
- Upload sécurisé des photos : formats jpg/png/webp uniquement, 4 Mo max, vérification qu'il s'agit bien d'une image, nom de fichier aléatoire, exécution de code désactivée dans \`/uploads\`.
- Sauvegarde automatique (\`.bak\`) du contenu à chaque enregistrement ; le fichier de contenu n'est jamais écrasé en cas d'erreur d'encodage.
- Le fichier de contenu JSON n'est pas téléchargeable directement (bloqué via \`.htaccess\`).

## Développement local

Aucune dépendance ni build n'est nécessaire pour l'édition de contenu au quotidien.

Prérequis : PHP (testé avec PHP 8.3, sans dépendance d'extension — fonctionne même sans mbstring).

\`\`\`
php -S localhost:8000
\`\`\`

Ou, pour servir les fichiers statiques uniquement (sans PHP) :

\`\`\`
npx serve -l 4321 .
\`\`\`

### Scripts utilitaires (Python)

| Script | Rôle |
|---|---|
| \`build_php.py\` | Réinjecte la \`<head>\` (balises SEO) de index.html dans index.php |
| \`build_prerender.py\` | Génère un pré-rendu statique du site |
| \`download_fonts.py\` | Télécharge et auto-héberge les polices (conformité RGPD/CNIL, pas d'appel à Google Fonts) |
| \`make_fiche.py\` / \`make_reunion.py\` | Génération des documents PDF (fiche hébergement, compte-rendu réunion) |
| \`make_screens.py\` | Génération des captures d'écran du site (dossier \`screens/\`) |

## Déploiement (OVH)

1. Envoyer tous les fichiers par FTP à la racine du site.
2. Vérifier que \`data/\` et \`uploads/\` sont accessibles en écriture (droits 755).
3. OVH exécute le PHP nativement — aucune étape de build supplémentaire.

## Stack technique

- **Backend :** PHP (rendu serveur, admin, gestion du contenu JSON)
- **Frontend :** HTML / CSS / JavaScript vanilla (pas de framework, pas de build JS)
- **Contenu :** fichier JSON (\`data/content.json\`) édité via l'espace admin
- **Polices :** auto-hébergées (Cormorant Garamond, Montserrat)
- **SEO :** rendu serveur complet, données structurées Schema.org (LocalBusiness), sitemap, hreflang FR/EN
`
  }
];

export const staticProjects: ProjectDto[] = staticProjectsWithReadme.map(
  ({ readmeMarkdown, ...project }) => project
);

export const staticReadmes: Record<string, string> = Object.fromEntries(
  staticProjectsWithReadme.map((p) => [p.id, p.readmeMarkdown])
);
