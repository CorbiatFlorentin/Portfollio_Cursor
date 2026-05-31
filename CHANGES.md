# Résumé des changements — à pousser

## Contexte
Série d'améliorations de performance, UX et qualité de code sur le portfolio.
Aucun changement de fonctionnalité visible côté utilisateur, hormis l'ajout des skeletons et la disparition de la lenteur au chargement des dossiers.

---

## 1 — Prefetch des projets pendant l'intro (`client/src/App.vue`)

**Problème :** `fetchProjects()` ne démarrait qu'après la fin de l'animation d'intro (~3-4s), laissant le bureau vide plusieurs secondes supplémentaires.

**Fix :** L'appel est lancé dès le montage de `App.vue`, avant même que l'utilisateur clique sur l'écran. Quand `DesktopOS` monte, le résultat est déjà en cache.

---

## 2 — Skeleton loaders sur le bureau (`client/src/components/DesktopOS.vue`)

**Problème :** Pendant le chargement des projets, le bureau affichait un espace vide sans feedback.

**Fix :** 4 blocs gris pulsants (animation `skeleton-pulse`) apparaissent à la place des dossiers tant que `loading` est `true`. Chaque bloc a un délai CSS décalé (`--delay`) pour un effet de vague. Ils disparaissent dès que l'API répond.

---

## 3 — Cache `sessionStorage` pour les projets (`client/src/api/projects.ts`)

**Problème :** Chaque visite ou navigation déclenchait un appel réseau vers Render, même si les données n'avaient pas changé.

**Fix :**
- Les projets sont mis en cache dans `sessionStorage` avec un TTL de **10 minutes**.
- Si le cache est valide, `fetchProjects()` retourne immédiatement (synchrone).
- Une `inflight` promise partagée empêche deux appels simultanés de partir en même temps (ex: `App.vue` + `DesktopOS` au même moment).

---

## 4 — Keep-alive Render (`client/src/App.vue`)

**Problème :** Le serveur Render (free tier) se met en veille après 15 min d'inactivité, causant un cold start de 30-60 secondes au prochain visiteur.

**Fix :** Un `setInterval` pinge `/api/health` toutes les **10 minutes** tant que la page est ouverte. Le timer est nettoyé au démontage (`onUnmounted`).

---

## 5 — Cache in-memory serveur pour les README (`server/src/routes/readme.ts`)

**Problème :** Chaque ouverture d'une fenêtre projet déclenchait un appel vers l'API GitHub pour récupérer le README, consommant le quota de rate-limiting.

**Fix :** Un `Map` en mémoire côté serveur stocke le HTML du README avec un TTL de **30 minutes**. Les appels répétés pour le même repo sont servis directement depuis le cache.

---

## 6 — Cache client pour les README (`client/src/api/projects.ts`)

**Problème :** Fermer et rouvrir une fenêtre projet déclenchait un nouvel appel réseau pour le README.

**Fix :** Un `Map<projectId, html>` en mémoire côté client évite tout refetch pour un README déjà chargé dans la session. Idem : une `inflight` Map empêche les doubles requêtes simultanées.

---

## 7 — Nettoyage dépendances serveur (`server/package.json`)

**Supprimés :**
- `nodemailer` — remplacé par Resend lors d'une migration précédente, la dépendance était restée.
- `gsap` — importé par erreur côté serveur, jamais utilisé.
- `@types/nodemailer` — type associé à nodemailer.

**Résultat :** Le bundle serveur est plus léger, le `npm install` en prod plus rapide.

---

## 8 — CORS localhost en développement (`server/src/index.ts`)

**Problème :** Seul `https://portfollio-corbiat-florentin.vercel.app` était autorisé en CORS, bloquant les appels depuis `localhost:5173` en dev.

**Fix :** `http://localhost:5173` est ajouté aux origines autorisées uniquement quand `NODE_ENV !== "production"`. En prod sur Render, seul le domaine Vercel est accepté.

---

## 9 — Synchronisation du type `Project` (`client/src/types/project.ts`)

**Problème :** Le serveur exposait un champ `stars?: number` dans `ProjectDto`, absent du type `Project` côté client. TypeScript ignorait silencieusement la donnée.

**Fix :** Ajout de `stars?: number` dans le type `Project` côté client pour aligner les deux côtés du contrat.

---

## 10 — Optimisation boucle RAF du parallax (`client/src/composables/useParallax.ts`)

**Problème :** La boucle `requestAnimationFrame` tournait en continu à 60fps même quand la souris ne bougeait pas, consommant du CPU inutilement.

**Fix :**
- La boucle s'arrête automatiquement quand `|dx|` et `|dy|` sont tous les deux sous **0.05px** (valeurs snappées sur la cible).
- Elle redémarre dès le prochain `pointermove`.
- Résultat : zéro RAF en idle, pleine fluidité pendant le mouvement.

---

## Fichiers modifiés

| Fichier | Type |
|---------|------|
| `client/src/App.vue` | Prefetch + keep-alive |
| `client/src/api/projects.ts` | Cache sessionStorage + cache README |
| `client/src/components/DesktopOS.vue` | Skeleton loaders |
| `client/src/composables/useParallax.ts` | Optimisation RAF |
| `client/src/types/project.ts` | Champ `stars` |
| `server/src/index.ts` | CORS dev |
| `server/src/routes/readme.ts` | Cache in-memory 30 min |
| `server/package.json` | Suppression deps inutilisées |
