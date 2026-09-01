# Langage visuel « Le Tableau » sur Planning · Clientèle · Relances · Catalogue

> **Mise à jour (ADR 0007)** : la clause « ardoise = l'unique en-tête de section » est retirée —
> l'en-tête de section est désormais un titre nu sur le crème. Le reste de « Le Tableau »
> (plaques à rainure, rail de légende, lanes, jeton d'état, signal ambre) tient.

## Contexte

Après le maquettage des sections partagées (`components/ui/*` repeints sur shadcn), les quatre
sections **Planning, Clientèle, Relances, Catalogue** restaient des variations du même patron :
un `PageHeader` éditorial, puis une pile de cartes blanches arrondies sur ombre ambiante. Ce
patron — fond crème, cartes à grand rayon, un accent — est *exactement* la forme par défaut que
ce type d'app produit ; il ne dit rien du métier réel (un comptoir interrompu toute la journée
qui répond à « qui, quand, quoi ensuite ») et ne se distingue ni d'un back-office générique ni de
son opposé prévisible (dashboard sombre, accent néon).

## Décision

Refondre ces quatre sections dans un **nouveau langage visuel — « Le Tableau »** — reconstruit à
partir des job stories (`docs/REFONTE-2.md` §2), pas des écrans existants. De l'ancien système, on
ne garde que **la palette b&co (rose / taupe / crème), Cabinet Grotesk et le logo** (imposés par
`AGENTS.md`).

Le monde : des **plaques de tableau d'affichage** accrochées au mur crème. Chaque zone de contenu
est une plaque (rose = *il y a quelque chose à faire*, taupe = *voici où en sont les choses*,
ardoise = l'unique en-tête de section), encadrée d'une **rainure** (double filet en creux, jamais
d'ombre portée). Un **rail de légende** (heures / lettres / noms, capitales tracées) court à
gauche de chaque tableau. Les lignes (*lanes*) portent un **jeton d'état qui bascule
mécaniquement** au changement — jamais la couleur seule. **Un seul signal : l'ambre**, pour *ce
qui a changé / maintenant / demande une décision* — il pulse une fois puis tient un liseré sur la
ligne jusqu'à acquittement. Les lignes **se reclassent sur place**.

Direction retenue via `concept-seed.mjs` (clé `5a6bc1b7`, mode *operate*) : direction fondée #7 de
la liste — le *tableau des départs / répertoire à pastilles*, fusionné avec la grammaire
« la ligne se reclasse sur place et retient son changement jusqu'à ce qu'on l'ait vu ». Choisie
devant le grand livre de rendez-vous et le fichier à fiches cartonnées parce qu'un tableau se lit
comme une **infrastructure**, ce dont une caisse interruptible a besoin. `DESIGN.md` réécrit porte
le contrat complet.

## Conséquences

- **`DESIGN.md`** entièrement réécrit sur ce monde ; l'ancien (« The Salon Counter » — plat,
  pilules, cartes) est remplacé, pas amendé.
- **`components/ui/board.tsx`** : nouvelles primitives `BoardHeader`, `Board`, `Lane`, `FlipChip`,
  `WeekStrip`, `PlateIndex`/`Plate`. Réutilisées par les quatre sections.
- **`app/globals.css`** : tokens `--board-*` (ardoise, rainure, ambre) + keyframes
  `chip-flip` / `lane-pulse` / `lane-fill`, tous coupés sous `prefers-reduced-motion`.
- **Équipe fondue dans le Planning** : le roster devient le rail de légende (statut + menu par
  praticienne) ; `/equipe` reste un raccourci qui ouvre le tableau, rail déplié sur l'équipe.
- **`Relance` promue dans le store** (`lib/store/app-store.ts`) : slice `relances` réel, partagé
  par la Fiche cliente et La Tournée du matin ; « Proposer » crée réellement une carte, l'undo est réel.
- **Sélecteurs Entreprise / Salon retirés du Planning** (cosmétiques, non branchés).
- **Sous-vues de la Tournée du matin** : réglage de vue sur le bandeau du tableau, plus des
  `Tabs` imbriqués.
- **Migration partielle assumée** : `Accueil`, le `Comptoir`, `/compte` et `Récap des ventes`
  gardent l'ancien langage dans ce passage et migreront ensuite. Les atomes partagés (`Button`,
  `Dialog`, `Toast`, `ConfirmDialog`, `Field`, inputs) sont conservés fonctionnels pour les deux
  mondes ; là où le tableau avait besoin d'une forme propre, il a une primitive `board`, pas une
  édition destructrice d'un atome partagé.
- **`docs/USERFLOW.md`** : sections Planning / Clientèle / Relances / Catalogue **assainies** —
  plus aucune prescription de composant, de mise en page ni de style ; seulement parcours,
  capacités par lieu, cas limites. Le détail vit dans `docs/REFONTE-2.md`.

## Alternatives écartées

- **Polir l'ancien langage** (resserrer l'espace, calmer les ombres) — écarté : la demande était
  une rupture, et la forme « cartes sur crème » est le défaut même qu'on cherche à quitter.
- **Grand livre de rendez-vous** (papier réglé, ruban, tampons) — plus « résonnant » avec l'objet
  remplacé, mais nostalgique là où le poste a besoin d'un affichage d'infrastructure.
- **Registre wax / pagne** (motif imprimé comme grammaire structurelle) — fort et dakarois, mais
  risque de lutte lisibilité / motif à distance de comptoir.
