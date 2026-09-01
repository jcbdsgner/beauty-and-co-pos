# Retrait de l'en-tête ardoise — bandeau de section allégé

## Contexte

L'ADR 0005 (« Le Tableau ») a posé **l'ardoise `#2a2320`** comme *l'unique en-tête de section* :
une plaque debout, pleine largeur, texte blanc, présente en haut de chaque écran (Planning,
Clientèle, Relances, Catalogue, et par extension Accueil à la migration suivante).

Les maquettes Figma suivantes (Point de vente — `node-id=97-55` Planning, `node-id=97-629`
Accueil en fond de l'étape de paiement) **abandonnent cette plaque** : le titre de section y est un
simple `Planning` / `Accueil` en gras sombre posé sur le crème, sans cadre, sans ligne de
contexte. Le reste du langage — plaques à rainure, rail de légende, lanes, jeton d'état, signal
ambre — est inchangé.

À l'usage, la plaque ardoise n'apportait pas d'information : la réceptionniste connaît la section
où elle est (nav active), le jour vit dans le *week strip* juste dessous, le compte vit dans la
légende du tableau. Le bandeau était de la **chrome** qu'on lit par-dessus.

## Décision

**Retirer l'ardoise comme en-tête de section.** `BoardHeader` garde son API (`section`,
`context`, `action`, `reset`, `backHref`) mais rend désormais :

- un `<h1>` `text-[1.9rem]` 700, `tracking-[-0.02em]`, `ink-900`, sur le fond crème, `pl-1` ;
- `context` (quand fourni) en `text-sm` `ink-500` sous le titre — plus de sous-titre blanc ;
- `backHref` en pilule bordée `groove` sur blanc (au lieu d'un bouton sur l'ardoise) ;
- `reset` / `action` alignés à droite, inchangés.

Tous les appels existants (`app/page.tsx`, `app/relances`, `app/clientele`, `app/catalogue`,
`fidelite-view`, `planning-board`) fonctionnent sans modification.

## Conséquences

- **`components/ui/board.tsx`** : `BoardHeader` repeint (plaque ardoise → titre nu). Aucun autre
  primitive touché.
- **`app/globals.css`** : `--board-slate` / `--board-slate-line` **conservés** — ils servent
  encore la chrome des panneaux contextuels sombres (`fiche-cliente-view` en-tête collant,
  `appointment-detail-sheet`). Ces surfaces ne sont pas des en-têtes de section et ne sont pas
  couvertes par ce retrait ; leur sort sera tranché quand une maquette les cadrera.
- **`DESIGN.md`** : section *Colours* (puce Slate), *Layout* (« The slate board header »),
  *Typography* (« the one slate header »), *Components* (`BoardHeader`) et le front-matter
  `colors` mis à jour pour décrire le titre nu.
- **ADR 0005** : la clause « ardoise = l'unique en-tête de section » est **supersédée par cet
  ADR** ; le reste de 0005 tient.
- **Accueil / Comptoir / `/compte` / Récap** : la migration restante suit ce nouveau bandeau
  allégé, pas l'ardoise.

## Alternatives écartées

- **Garder l'ardoise, ne changer que le Planning** — écarté : deux traitements d'en-tête dans la
  même app, incohérence visible d'un onglet à l'autre.
- **Étendre le retrait aux en-têtes de panneau (Fiche, sheet RDV)** — écarté ici faute de
  maquette : ce sont des rôles distincts (chrome d'overlay, pas titre de page).
