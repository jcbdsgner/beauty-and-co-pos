---
status: accepted
---

# Catalogue : retrait du volet « Les Planches », nouvelle UI en vitrine

## Contexte

Le Catalogue avait trois volets — **Les Planches** (styles signature curatés, un lookbook), **Produits**
et **Boissons** — partageant tous la grammaire « Le Tableau » (`components/ui/board.tsx`) : une
plaque à rainure, une grille de tuiles carrées collées (`gap-px bg-base-300`), une légende en
petites capitales. C'est la même charpente visuelle que Planning ou Clientèle, alors que le
Catalogue n'a rien d'opérationnel — on ne fait qu'y feuilleter, jamais y encaisser.

La demande : retirer complètement le volet Les Planches (les styles signature n'y sont plus
montrés) et refaire l'UI des deux volets restants dans un langage visuel entièrement différent de
« Le Tableau ».

## Décision

### 1. Les Planches disparaît du Catalogue

- `app/catalogue/page.tsx` : `VoletSwitch` à 3 valeurs → sélecteur à 2 valeurs (`produits` |
  `boissons`), défaut `produits`.
- `components/catalogue/catalogue-styles.tsx`, `style-detail-dialog.tsx`, `style-meta.ts` supprimés
  — plus aucun appelant.
- `lib/data/styles.ts` (`STYLES`, `styleById`) **reste** : `components/messages/conversation-panel.tsx`
  l'utilise pour illustrer une suggestion de la conseillère. Le type `Style` et ses données
  survivent, seul le volet Catalogue qui les exposait disparaît.

### 2. Une grammaire propre au Catalogue, pas « Le Tableau »

Nouveau fichier `components/catalogue/catalogue-parts.tsx` — vitrine plutôt que tableau :
- `CatalogueSwitch` : pilule à 2 options dans l'en-tête (remplace `VoletSwitch`, ses onglets
  soulignés).
- `CategoryRail` : nav verticale sticky des catégories de produits (remplace les chips de
  catégorie sur la ligne de légende).
- `SubFilter` : pilules de gamme (remplace le second niveau de `ChipFilter`).
- `StockLine` : point de couleur + libellé (remplace le texte de stock en pied de tuile).
- `StatPill`, `CatalogueEmpty` : équivalents vitrine de `Legend`/`BoardEmpty`.

Les deux volets passent en cartes flottantes indépendantes (`rounded-2xl`, ombre portée, légère
translation au survol) sur le fond crème de la page, séparées par de l'espace — pas la grille de
tuiles carrées à hairlines collées d'avant. Le prix flotte en pastille sur la photo plutôt qu'en
ligne de texte sous la tuile.

- **Produits** garde son rail catégorie → gamme (Kérastase et ses gammes, les 4 autres marques à
  plat) et son regroupement par gamme quand aucune n'est choisie ; la synthèse rupture/à
  réapprovisionner devient deux pastilles au lieu d'une bande de légende.
- **Boissons** n'a toujours pas de rail (le bar n'a pas de catégorie) ; la carte montre nom, photo,
  composition et prix, plus large et avec la fiche technique visible sans interaction.

## Conséquences

- `app/catalogue/page.tsx`, `components/catalogue/catalogue-produits.tsx`,
  `components/catalogue/catalogue-boissons.tsx` réécrits ; nouveau
  `components/catalogue/catalogue-parts.tsx`.
- `components/ui/board.tsx` : commentaire d'en-tête et `docs/CARTE-DES-ECRANS.md` mis à jour — le
  Catalogue n'est plus un appelant de « Le Tableau ».
- `CONTEXT.md` : entrées **Catalogue** (deux volets, vitrine) et **Style** (n'illustre plus que les
  Messages) amendées.
- Aucun changement de modèle de données (`Produit`, `Boisson` inchangés) ; la baisse de stock reste
  au Comptoir.

## Alternatives écartées

- **Garder Les Planches, juste la reskin** — écarté : la demande est le retrait pur du volet, pas
  sa refonte.
- **Réutiliser `Board`/`ChipFilter` avec un thème de couleur différent** — écarté : une simple
  reteinte reste visuellement la même charpente (tuiles collées à rainures) ; la demande est un
  changement de grammaire, pas de palette.
