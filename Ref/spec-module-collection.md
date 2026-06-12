# Spec — Application de gestion de collection Warhammer

> **Destinataire** : Fable 5, en mode autonome (Claude Code).
> **Nature du projet** : application web privée, mono-utilisateur, auto-hébergée. C'est un cadeau personnel, pas un livrable client. On optimise le plaisir d'usage et la finition, pas le temps facturé — mais chaque feature doit rester **utile**, pas gadget.
> **Méthode de travail attendue** : tu développes **module par module**, dans l'ordre du chapitre « Ordre de développement ». À la fin de chaque module, tu vérifies tous les **Critères de fait** du module avant de passer au suivant. Tu ne passes pas au module N+1 si un critère du module N n'est pas rempli.

---

## 1. Contexte fonctionnel

L'utilisateur possède une grande collection de figurines, objets et décors Warhammer (1240+ items à l'import initial) répartis sur plusieurs systèmes de jeu (Warhammer 40000, Warcry, Hero Quest, Dreadfleet…). Il veut suivre l'avancement de peinture de chaque item à travers un pipeline de 6 stades, organiser sa collection, retrouver ses recettes de peinture, exposer ses figurines terminées, et préparer ses listes de tournoi.

L'application a **un seul utilisateur** (lui). Pas d'inscription, pas de rôles, pas de partage public. Un login protège l'accès, point.

**Flux principal** :
1. Au premier lancement, il **importe un fichier Excel** pour peupler la base.
2. Ensuite il gère tout via l'interface : ajout d'items, mise à jour de l'avancement, recettes, photos, listes.

---

## 2. Stack technique (imposée)

- **Framework** : Next.js (dernière stable, App Router)
- **Langage** : **TypeScript**
- **UI** : React + **Tailwind CSS**
- **Base de données** : **PostgreSQL**
- **ORM** : **Drizzle ORM**. Migrations via `drizzle-kit generate` puis `drizzle-kit migrate`. **Jamais `push`.**
- **Auth** : **Auth.js (NextAuth)**, provider Credentials, **un seul compte** (identifiants en variables d'env). Pas de page d'inscription.
- **Validation** : **Zod** systématiquement, côté serveur, sur toute donnée entrante (Server Actions, parsing Excel).
- **Parsing Excel** : **SheetJS** (`xlsx`).
- **Drag & drop (Kanban)** : **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`). Pas de lib drag deprecated.
- **Icônes** : `lucide-react`.
- **Dates** : `date-fns` si manipulation non triviale.
- **Stockage des photos** : volume disque local monté dans le conteneur (cf. Déploiement). Pas d'object storage en v1.

### Conventions de code (strictes)

- **Identifiants en anglais** : variables, fonctions, types, fichiers, composants, routes, Server Actions, colonnes de BDD, valeurs d'enum.
- **Textes affichés en français** : labels, boutons, titres, messages d'erreur visibles, métadonnées.
- **Server Components par défaut**, `'use client'` uniquement quand l'interactivité l'exige (Kanban, lightbox, formulaires interactifs, filtres temps réel).
- Pas de `any`, pas de `@ts-ignore`/`@ts-expect-error` pour faire taire le compilateur.
- Pas de magic strings/numbers : constantes nommées.

---

## 3. Modèle de données

### 3.1 Enums

```ts
// Type d'item — label FR : figurine / objet / décor
export const itemType = pgEnum('item_type', ['figurine', 'object', 'scenery']);

// État d'un stade — label FR : non fait / en cours / terminé
export const stageState = pgEnum('stage_state', ['not_started', 'in_progress', 'done']);

// Technique de peinture d'une étape de recette
// label FR : base / lavis / éclairci / brossage à sec / contraste / glacis / rehaut d'arête
export const paintTechnique = pgEnum('paint_technique', [
  'base', 'wash', 'layer', 'drybrush', 'contrast', 'glaze', 'edge_highlight',
]);
```

### 3.2 Tables

```ts
// game — système de jeu (niveau racine de la hiérarchie)
game {
  id        serial PK
  name      text NOT NULL UNIQUE
}

// faction — armée/faction, rattachée à un jeu. N'a de sens que pour les figurines.
// Porte aussi le thème couleur de l'armée (cf. module Thème).
faction {
  id            serial PK
  name          text NOT NULL
  gameId        FK -> game.id NOT NULL
  primaryColor  text NULL        // hex, ex "#1a1a1a"
  secondaryColor text NULL       // hex
  UNIQUE(name, gameId)
}

// box — boîte/set de provenance. Rattachée à un jeu.
box {
  id      serial PK
  name    text NOT NULL
  gameId  FK -> game.id NOT NULL
  UNIQUE(name, gameId)
}

// scheme — recette de peinture nommée et réutilisable
scheme {
  id      serial PK
  name    text NOT NULL UNIQUE
  notes   text NULL
}

// schemeStep — étape ordonnée d'une recette
schemeStep {
  id          serial PK
  schemeId    FK -> scheme.id NOT NULL (ON DELETE CASCADE)
  position    integer NOT NULL          // ordre d'affichage, 1, 2, 3...
  zone        text NOT NULL             // ex "Armure", "Tissu", "Métal" (texte libre FR)
  paintName   text NOT NULL             // ex "Abaddon Black" (texte libre)
  technique   paintTechnique NOT NULL
}

// item — la pile possédée (cf. règle quantité ci-dessous)
item {
  id            serial PK
  name          text NOT NULL
  type          itemType NOT NULL
  quantity      integer NOT NULL DEFAULT 1   // nombre d'exemplaires possédés (>= 1)
  gameId        FK -> game.id NOT NULL
  boxId         FK -> box.id NULL
  factionId     FK -> faction.id NULL
  schemeId      FK -> scheme.id NULL

  // pipeline — 6 stades, chacun un état à 3 valeurs
  purchase      stageState NOT NULL DEFAULT 'not_started'
  cleanMount    stageState NOT NULL DEFAULT 'not_started'
  undercoat     stageState NOT NULL DEFAULT 'not_started'
  paint         stageState NOT NULL DEFAULT 'not_started'
  plinth        stageState NOT NULL DEFAULT 'not_started'   // socle
  varnish       stageState NOT NULL DEFAULT 'not_started'   // vernis

  isFavorite    boolean NOT NULL DEFAULT false              // "coup de cœur"
  completedAt   timestamp NULL                              // posé quand varnish passe à 'done' (cf. règle)
  createdAt     timestamp NOT NULL DEFAULT now()
  updatedAt     timestamp NOT NULL DEFAULT now()
}

// itemPhoto — photos d'un item (avant/après, WIP, final)
itemPhoto {
  id         serial PK
  itemId     FK -> item.id NOT NULL (ON DELETE CASCADE)
  filename   text NOT NULL          // nom du fichier sur le volume
  isPrimary  boolean NOT NULL DEFAULT false   // photo de couverture
  createdAt  timestamp NOT NULL DEFAULT now()
}

// roster — liste/armée de tournoi
roster {
  id         serial PK
  name       text NOT NULL
  gameId     FK -> game.id NOT NULL
  eventDate  date NULL              // pour le compte à rebours
  createdAt  timestamp NOT NULL DEFAULT now()
}

// rosterItem — jonction many-to-many roster <-> item
rosterItem {
  id              serial PK
  rosterId        FK -> roster.id NOT NULL (ON DELETE CASCADE)
  itemId          FK -> item.id NOT NULL (ON DELETE CASCADE)
  quantityNeeded  integer NOT NULL DEFAULT 1
  UNIQUE(rosterId, itemId)
}
```

### 3.3 Règles de cohérence (à coder dans la couche validation, pas seulement en BDD)

1. **Monotonie du pipeline.** Les stades sont séquentiels dans cet ordre : `purchase → cleanMount → undercoat → paint → plinth → varnish`. Un stade ne peut pas être `done` ou `in_progress` si un stade **antérieur** est encore `not_started`. Exemple interdit : `varnish = done` alors que `paint = not_started`. À vérifier dans chaque Server Action qui modifie un stade, et au parsing de l'import. Si une mise à jour viole la règle, on rejette avec un message FR clair.

2. **`completedAt`.** Posé automatiquement à la date courante quand `varnish` passe à `done`. Remis à `null` si `varnish` repasse en dessous de `done`.

3. **Cohérence du jeu.** Si `boxId` est renseigné, `box.gameId` doit valoir `item.gameId`. Idem pour `factionId`. Vérif à l'insert et à l'update.

4. **`quantity >= 1`.**

5. **Une seule photo `isPrimary` par item.** Si on en marque une nouvelle, l'ancienne repasse à `false`.

### Critères de fait — Modèle de données
- [ ] Schéma Drizzle complet écrit, tous les enums et tables ci-dessus présents.
- [ ] Migration générée avec `drizzle-kit generate` et appliquée avec `migrate`.
- [ ] Les 5 règles de cohérence sont implémentées dans des helpers réutilisables (pas dupliquées dans chaque action).
- [ ] Un fichier de seed minimal permet de lancer l'app avec quelques données de test sans import.

---

## 4. Import Excel

L'utilisateur importe un fichier Excel pour peupler la base au démarrage (et éventuellement ré-importer plus tard).

### 4.1 Format du template imposé

Le fichier comporte **une ou plusieurs feuilles**. Chaque ligne = un item. Colonnes, dans l'ordre :

| Col | Contenu | Mapping |
|-----|---------|---------|
| A | Nom de l'item | `name` |
| B | Faction / catégorie | `faction` (texte) — voir note |
| C | Boîte | `box` (texte) |
| D | Jeu | `game` (texte) |
| E | purchase | `0/1/2` |
| F | cleanMount | `0/1/2` |
| G | undercoat | `0/1/2` |
| H | paint | `0/1/2` |
| I | plinth (socle) | `0/1/2` |
| J | varnish | `0/1/2` |
| K | Quantité | entier >= 1 |

Mapping des états : `0 = not_started`, `1 = in_progress`, `2 = done`.

**Note sur la colonne B (faction/catégorie)** : dans les données réelles, cette colonne contient soit une vraie faction (« Black Templar »), soit une catégorie générique (« Objets », « Décors »). Règle de résolution :
- Si la valeur de B vaut `Objets` (insensible à la casse) → `type = 'object'`, `factionId = null`.
- Si la valeur de B vaut `Décors`/`Decors` → `type = 'scenery'`, `factionId = null`.
- Sinon → `type = 'figurine'`, et B est une vraie faction à résoudre/créer.

### 4.2 Résolution des entités liées

`game`, `faction`, `box` sont normalisées dans leurs tables. Pour chaque ligne :
- On cherche le `game` par nom (exact, trim). S'il n'existe pas, on le crée.
- Idem `box` (rattachée au game résolu) et `faction` (rattachée au game résolu), si applicable.
- **On résout par correspondance exacte après trim. Pas de fuzzy-matching.** Le template est strict : c'est à l'utilisateur de fournir un fichier propre. On ne devine pas que « Black Templars » = « Black Templar ».

### 4.3 Validation (protection de l'utilisateur)

L'import **ne doit jamais** insérer en aveugle ni crasher en entier sur une ligne fautive.

- Chaque ligne est validée par un **schéma Zod** : nom non vide, états dans `{0,1,2}`, quantité entier >= 1, monotonie du pipeline respectée.
- Une ligne invalide est **rejetée** (pas insérée), pas l'ensemble du fichier.
- À la fin, l'app affiche un **rapport d'import** : nombre de lignes importées, nombre rejetées, et **pour chaque ligne rejetée : son numéro (feuille + ligne) et la raison en français**. Ex : « Feuille "Figurines", ligne 47 : état peinture = 5, attendu 0, 1 ou 2 ».

### 4.4 Stratégie de ré-import

Au lancement de l'import, l'utilisateur choisit explicitement :
- **Remplacer** : vide les tables `item` (et données liées) et réimporte tout. Confirmation obligatoire (action destructive).
- **Ajouter** : insère les nouvelles lignes sans toucher à l'existant.

Pas d'upsert intelligent en v1 (pas de clé naturelle fiable sur un item). Ces deux modes suffisent.

### Critères de fait — Import
- [ ] Lecture de toutes les feuilles du fichier via SheetJS.
- [ ] Mapping colonnes → champs correct, y compris la résolution de la colonne B en `type`.
- [ ] `game`/`faction`/`box` créés à la volée par correspondance exacte trim.
- [ ] Validation Zod par ligne, monotonie incluse.
- [ ] Lignes fautives rejetées individuellement, jamais de crash global.
- [ ] Rapport d'import affiché avec numéro de ligne + raison FR pour chaque rejet.
- [ ] Deux modes (Remplacer / Ajouter), Remplacer derrière confirmation.
- [ ] Import de 1240+ lignes testé et performant (insertion par batch, pas ligne par ligne en boucle naïve).

---

## 5. Export

L'utilisateur doit pouvoir récupérer sa collection.

- Bouton « Exporter ma collection » → génère un `.xlsx` au **même format que le template d'import** (colonnes A→K), pour que l'export soit ré-importable.
- Inclut toutes les feuilles ou une seule feuille à plat (au choix d'implémentation, mais ré-importable).

### Critères de fait — Export
- [ ] Export `.xlsx` généré côté serveur, téléchargeable.
- [ ] Le fichier exporté est ré-importable sans erreur par le module Import.

---

## 6. Module Collection (cœur)

### 6.1 Vue liste

Écran principal : la collection, avec **filtres** et **recherche**. Indispensable à 1240+ items.

- **Recherche texte** sur `name` (insensible à la casse, temps réel ou sur submit).
- **Filtres** combinables : par `game`, `faction`, `box`, `type`, et par état d'un stade donné. Plus un filtre « coup de cœur » (favoris uniquement).
- Affichage : tableau ou grille de cartes (au choix, mais lisible et dense). Chaque ligne/carte montre : photo de couverture (si présente), nom, faction, jeu, quantité, et une mini-représentation de l'avancement (cf. barres, module 7).
- Pagination ou virtualisation : 1240 items ne se rendent pas d'un bloc. Prévoir pagination serveur ou scroll virtualisé.

### 6.2 Détail / édition d'un item

- Vue détail : toutes les infos, les 6 stades modifiables, la recette assignée, les photos, le statut favori.
- Modifier un stade respecte la **monotonie** (UI qui empêche les états impossibles, + validation serveur).
- Toggle **favori** (étoile).

### 6.3 Ajout rapide

- Formulaire d'ajout express d'un item (name, type, game, faction/box optionnels, quantité). Les stades démarrent à `not_started`. Accessible en 1 clic depuis la liste.

### 6.4 Actions groupées (non négociable)

- Sélection multiple d'items dans la liste (cases à cocher).
- Action groupée : **passer un stade donné à un état donné** sur toute la sélection (ex. « les 10 sélectionnés → undercoat = done »). Monotonie vérifiée par item ; les items pour qui l'action serait incohérente sont signalés, pas appliqués silencieusement.

### 6.5 Scinder un lot

- Action « Scinder » sur un item de `quantity > 1` : crée une copie de la ligne, répartit la quantité entre les deux (ex. 10 → 6 + 4), pour suivre des avancements divergents au sein d'un même type (cas réel : 6 figs peintes sur 10, 4 encore en cours).
- La copie hérite de toutes les métadonnées (game, faction, box, scheme), seule la quantité et ensuite les stades divergent.

### Critères de fait — Collection
- [ ] Liste filtrable (game/faction/box/type/stade/favori) + recherche texte fonctionnelle.
- [ ] Pagination ou virtualisation : 1240 items s'affichent sans ramer.
- [ ] CRUD complet d'un item, stades modifiables avec monotonie respectée (UI + serveur).
- [ ] Ajout rapide opérationnel.
- [ ] Actions groupées sur sélection multiple, avec gestion des cas incohérents.
- [ ] Scission de lot opérationnelle, métadonnées héritées.
- [ ] Toutes les mutations passent par des Server Actions validées Zod.

---

## 7. Module Progression visuelle

### 7.1 Barres de progression à 3 niveaux

Une barre représente l'avancement d'un item (ou d'un agrégat) à travers les 6 stades, avec 3 niveaux de remplissage par stade (non fait / en cours / terminé — visuellement distincts, ex. vide / hachuré / plein).

- **Par item** : compacte, affichée dans la liste et le détail.
- **Par faction** : agrégée (ex. « Black Templar : 34 % terminé »).
- **Globale** : sur toute la collection.

Définition du % « terminé » d'un agrégat : proportion de stades `done` sur le total de stades concernés (6 × nombre d'items), pondérée par la quantité. Documente la formule choisie en commentaire.

### 7.2 Vue Kanban « atelier »

Tableau type Kanban, **stades en colonnes**, items en cartes déplaçables (dnd-kit).

- **Colonnes** : Acheté, Monté, Sous-couché, Peint, Socle, Vernis, **Terminé** (7e colonne pour les items dont tous les stades sont `done`).
- **Règle de placement d'une carte** : la colonne d'un item = **le premier stade (dans l'ordre du pipeline) qui n'est pas `done`**. Si ce stade est `in_progress`, la carte le signale visuellement (badge « en cours »). Si tous les stades sont `done` → colonne Terminé.
- **Drag d'une carte vers la colonne suivante** = passer le stade courant à `done` (la carte se recalcule alors vers la colonne du stade suivant). Respecte la monotonie : on ne peut pas sauter de colonne vers la droite en sautant un stade.
- Le Kanban est filtrable (au moins par game et faction) pour ne pas afficher 1240 cartes d'un coup.

### 7.3 Vue « En cours » transversale

- Un écran qui liste **tous les items ayant au moins un stade `in_progress`**, peu importe lequel — c'est l'atelier réel de l'utilisateur à l'instant T. Pur calcul, pas de nouvelle donnée.

### Critères de fait — Progression visuelle
- [ ] Barre 3 niveaux par item, par faction, globale, avec distinction visuelle claire des 3 états.
- [ ] Kanban fonctionnel avec dnd-kit, 7 colonnes, règle de placement implémentée exactement comme spécifiée.
- [ ] Drag = avancement de stade, monotonie respectée, recalcul de la carte.
- [ ] Kanban filtrable, performant.
- [ ] Vue « En cours » transversale opérationnelle.

---

## 8. Module Recettes de peinture (centrepiece)

Permet de noter et retrouver comment une armée/figurine a été peinte. C'est la feature la plus précieuse pour l'utilisateur : reproductibilité après des mois.

- CRUD de `scheme` (recette nommée).
- Chaque recette a des **étapes ordonnées** (`schemeStep`) : zone (texte FR libre, ex « Armure »), peinture utilisée (texte libre, ex « Abaddon Black »), technique (enum). Réorganisables (position).
- Assignation d'une recette à un item (`item.schemeId`). Depuis le détail item, on voit la recette appliquée, dépliée avec ses étapes.
- Une recette est réutilisable sur plusieurs items (relation un scheme → plusieurs items).

> Hors v1 : inventaire des peintures possédées (stock). Les noms de peinture sont du texte libre pour l'instant. Ne pas construire de table d'inventaire de peintures.

### Critères de fait — Recettes
- [ ] CRUD recette + étapes ordonnées et réordonnables.
- [ ] Assignation d'une recette à un item, affichage déplié dans le détail item.
- [ ] Une même recette assignable à plusieurs items.

---

## 9. Module Galerie photos

- Upload d'une ou plusieurs photos par item, stockées sur le **volume disque local** (cf. Déploiement). Nom de fichier généré (pas le nom d'origine brut), références en BDD (`itemPhoto`).
- Marquage d'une photo « de couverture » (`isPrimary`), affichée dans la liste collection.
- **Galerie / « salle des trophées »** : un écran qui affiche les items **terminés** (`varnish = done`) avec leur photo, en grille.
- **Lightbox** au clic : carousel des photos de l'item, navigation clavier. **Réutiliser le composant lightbox accessible existant** (focus trap, Échap pour fermer, flèches ← →, `aria-modal`, restauration du focus). Ne pas réinventer ni importer une lib lourde.
- Validation upload : types image autorisés (jpeg/png/webp), taille max raisonnable, conversion/optimisation si possible (webp). Pas de SVG (surface d'attaque).

### Critères de fait — Galerie
- [ ] Upload multi-photos par item, stockage volume local, refs en BDD.
- [ ] Photo de couverture marquable, une seule par item.
- [ ] Galerie des items terminés en grille.
- [ ] Lightbox accessible (focus trap, Échap, flèches, restauration focus).
- [ ] Validation des fichiers uploadés (type, taille), pas de SVG.

---

## 10. Module Listes de tournoi

Le pont entre la collection et la préparation d'event. **Pas un constructeur de listes** (pas de datasheets, pas de points officiels, pas de validation de légalité — c'est volontaire).

- CRUD de `roster` : nom, jeu, date d'event optionnelle.
- Ajout d'items à une liste via `rosterItem` (relation many-to-many), avec `quantityNeeded`.
- **Jauge « battle ready »** : un item compté dans la liste est battle ready quand `paint = done` **ET** `plinth = done`. La liste affiche « X / Y figs prêtes » et la liste des items qui restent à finir.
  > Définition modifiable en un point : `battle ready = paint done && plinth done`. Si on veut inclure le vernis, c'est ici et nulle part ailleurs.
- **Compte à rebours** : si `eventDate` est renseignée, afficher les jours restants avant l'event, à côté du nombre d'items restants à finir (« 12 jours — 7 figs restantes »).

> Hors v1 : champ points manuel par item, validation de légalité, suivi de résultats de parties, outils d'organisateur de tournoi. Ne pas les coder.

### Critères de fait — Listes tournoi
- [ ] CRUD roster avec date d'event optionnelle.
- [ ] Ajout/retrait d'items dans une liste (many-to-many, quantityNeeded).
- [ ] Jauge battle ready calculée (paint && plinth done), liste des items restants.
- [ ] Compte à rebours affiché si date renseignée.

---

## 11. Module Thème par faction

- Chaque `faction` porte 1 à 2 couleurs (`primaryColor`, `secondaryColor`, hex).
- Quand l'UI affiche le contexte d'une faction (vue filtrée sur une faction, détail d'un item de cette faction), les **accents de couleur** de l'interface reprennent ces teintes (bordures, badges, barres). Implémentation via variables CSS injectées, pas de rebuild Tailwind.
- Couleurs éditables depuis la gestion des factions. Fallback sur un thème neutre si non renseignées.

### Critères de fait — Thème faction
- [ ] Couleurs éditables par faction.
- [ ] Accents UI adaptés à la faction affichée, via variables CSS.
- [ ] Fallback neutre propre si pas de couleur.

---

## 12. Module Wishlist (« à acheter »)

- Gratuit à partir de l'existant : un item avec `purchase = not_started` est « voulu mais pas acheté ».
- Écran dédié « À acheter » : liste tous les items `purchase = not_started`, regroupés par jeu/faction.
- Action rapide « marquer comme acheté » (passe `purchase` à `done`) directement depuis cet écran.

### Critères de fait — Wishlist
- [ ] Écran « À acheter » listant les items `purchase = not_started`.
- [ ] Action « marquer acheté » depuis l'écran.

---

## 13. Module Dashboard (accueil)

Écran d'accueil après login, motivant et synthétique.

- **Barre de progression globale** + barres par faction (top factions).
- **Répartition** : nombre d'items par stade atteint (combien achetés, montés, sous-couchés, peints, socle, vernis). Simple compteurs, pas de graphe complexe imposé — une représentation lisible suffit.
- **Bilan annuel** : « X figurines terminées cette année » (à partir de `completedAt` de l'année courante).
- **Succès** : 3 à 4 succès thématiques, dérivés des données (aucune table dédiée), affichés débloqué/verrouillé :
  - « Première armée 100 % peinte » (une faction dont tous les items ont `varnish = done`).
  - « Pile of shame sous les 100 » (moins de 100 items avec `paint = not_started`).
  - « 1000 figurines terminées » (somme des quantités des items `varnish = done` >= 1000).
  - « Atelier propre » (aucun item `in_progress` — tout est soit pas commencé soit fini).

### Critères de fait — Dashboard
- [ ] Barres globale + par faction.
- [ ] Répartition par stade (compteurs).
- [ ] Bilan annuel basé sur completedAt.
- [ ] 3-4 succès dérivés des données, état débloqué/verrouillé affiché.

---

## 14. Authentification & sécurité

- **Auth.js**, provider Credentials, **un seul compte**. Identifiant + hash du mot de passe en variables d'env (le mot de passe n'est jamais en clair dans le code). Pas de page d'inscription, pas de récupération de mot de passe.
- Toutes les routes applicatives et Server Actions exigent une session valide. Un middleware protège tout sauf la page de login.
- Cookies de session `httpOnly`, `secure`, `sameSite: 'lax'`.
- Pas de secret en `NEXT_PUBLIC_`.
- Validation Zod sur **toutes** les Server Actions et le parsing d'import.
- Pas de `dangerouslySetInnerHTML`.
- Headers de sécurité dans `next.config`. **HSTS** : ne l'activer avec `includeSubDomains; preload` **que** si l'app est exposée sur un vrai domaine possédé. Comme le déploiement cible est derrière Tailscale (hostname `ts.net` non possédé), conditionner l'activation de HSTS derrière une variable d'env `APP_PUBLIC_DOMAIN` ; sinon ne pas l'émettre.
- Upload de fichiers : validation type + taille, stockage hors webroot exécutable, noms de fichiers générés.

### Critères de fait — Auth & sécurité
- [ ] Login mono-compte fonctionnel, mot de passe hashé, identifiants en env.
- [ ] Middleware protégeant toute l'app sauf login.
- [ ] Cookies sécurisés.
- [ ] Zod sur toutes les Server Actions et l'import.
- [ ] Headers de sécurité, HSTS conditionné par `APP_PUBLIC_DOMAIN`.
- [ ] Upload sécurisé.

---

## 15. Gestion d'erreur (Niveau 2)

- `error.tsx` à la racine + sur les segments de route critiques (collection, import, kanban).
- `not-found.tsx` racine, `loading.tsx` sur les routes avec data fetching.
- Try/catch dans les Server Actions, messages utilisateur **en français**, clairs.
- Logs serveur structurés (JSON) avec `console.error`, **sans** données sensibles ni stack trace exposée au client en prod.
- Pas de `try/catch` qui avale l'erreur sans la logger ni la remonter.

### Critères de fait — Gestion d'erreur
- [ ] `error.tsx` racine + segments critiques, `not-found.tsx`, `loading.tsx` où pertinent.
- [ ] Server Actions avec try/catch et messages FR.
- [ ] Logs structurés serveur, pas de fuite d'info sensible.

---

## 16. Déploiement (auto-hébergé)

Cible : serveur Hetzner de l'utilisateur, **Docker Compose**, accès derrière **Tailscale** (pas d'exposition publique).

- `docker-compose.yml` avec : service **app** (Next.js en build standalone), service **db** (PostgreSQL), volume persistant pour la base, **volume persistant pour les photos uploadées**.
- `Dockerfile` multi-stage pour Next.js (output standalone).
- Variables d'env : `DATABASE_URL`, identifiants auth, `AUTH_SECRET`, `APP_PUBLIC_DOMAIN` (optionnel, pour HSTS).
- Les **migrations Drizzle** s'appliquent au démarrage ou via une commande dédiée documentée (jamais `push`).
- HTTPS fourni par `tailscale serve`.
- README de déploiement : commandes pour build, up, appliquer les migrations, créer le compte initial, chemins des volumes.

### Critères de fait — Déploiement
- [ ] `Dockerfile` standalone + `docker-compose.yml` (app + db + 2 volumes).
- [ ] Migrations appliquées proprement, jamais `push`.
- [ ] Volume photos persistant et bien monté.
- [ ] README de déploiement complet (build, up, migrate, compte initial, volumes).

---

## 17. Ordre de développement (sprints)

Tu suis cet ordre. Chaque sprint se termine quand ses critères de fait sont remplis.

1. **Fondations** : setup Next.js + TS + Tailwind + Drizzle + Postgres, schéma complet, migrations, seed minimal, helpers de cohérence (monotonie, completedAt, cohérence game). → Modèle de données.
2. **Auth** : login mono-compte, middleware, sécurité de base.
3. **Import / Export** : parsing Excel, validation Zod, rapport d'import, export `.xlsx`. (Permet de charger les vraies données tôt.)
4. **Collection** : liste filtrable + recherche + pagination, CRUD item, ajout rapide, actions groupées, scission de lot.
5. **Progression visuelle** : barres 3 niveaux, Kanban atelier, vue « En cours ».
6. **Recettes de peinture**.
7. **Galerie photos** (upload + lightbox réutilisé + salle des trophées).
8. **Listes de tournoi** (rosters + battle ready + compte à rebours).
9. **Wishlist**, **Thème faction**, **Dashboard** (succès, bilan annuel).
10. **Gestion d'erreur niveau 2** transverse + **Déploiement** Docker/Tailscale + README.

---

## 18. Hors périmètre v1 — NE PAS CODER

Pour éviter le sur-développement, ces éléments sont **explicitement exclus de la v1**. Ne les implémente pas, même si l'occasion semble se présenter :

- **Journal de campagne / mode Crusade** (parties jouées, XP d'unité, honneurs, cicatrices). Prévu v2. C'est un module entier à part entière.
- **Constructeur de listes d'armée** avec datasheets, wargear, points officiels, validation de légalité. Hors sujet (outils gratuits existants, maintenance des données GW intenable).
- **Champ points manuel** par item / total de points de liste. Reporté v2.
- **Inventaire des peintures possédées** (stock de pots). v2 ; en v1 les peintures sont du texte libre dans les recettes.
- **Suivi de résultats de parties / win-rate**. Hors périmètre.
- **Sous-cibles de peinture** (décomposer une grosse pièce en sous-éléments peints séparément). v2.
- **Multi-utilisateur, partage public, app mobile/PWA, notifications/rappels**. Hors périmètre.

Si un besoin de ces catégories apparaît pendant le dev, tu le **notes** dans le README (« pistes v2 ») mais tu ne le codes pas.

---

## 19. Rappels transverses (sur tout le projet)

- Server Components par défaut, `'use client'` justifié.
- Zod côté serveur sur toute entrée.
- Identifiants anglais / textes FR.
- Pas de `any`, pas de magic strings/numbers, pas de console.log oubliés.
- Accessibilité : HTML sémantique, labels associés, navigation clavier, focus visible, `alt` sur les images, contraste suffisant.
- Pas de dépendance lourde sans raison ; les libs imposées (SheetJS, dnd-kit) suffisent pour leurs domaines.
- À la fin de chaque module : repasser ses **Critères de fait** un par un avant d'enchaîner.
