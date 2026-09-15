---
status: accepted
---

# Accueil : « Le jour » devient « Rendez-vous », composition de la réservation, extras pré-commandés

## Contexte

Le Figma 242:1735 reprend l'Accueil (Cartes cadeaux inchangées) et livre une nouvelle version de
la section chronologique : légende **« Rendez-vous »** (plus « Le jour »), grille fixe de 3
colonnes, et un sous-titre de carte qui n'est plus le résumé des prestations mais une
**composition** du passage (« 1 femme + 1 enfant », « 2 femmes »…). Le mockup ne montre que deux
lignes de prestations par carte, mais un passage réel peut en porter beaucoup plus (même
prestation deux fois avec 4 praticiennes, plusieurs boissons pré-commandées, jusqu'à 3 produits à
emporter) — sans quoi la carte grossit sans limite et la grille perd son alignement.

## Décision

### 1. Légende renommée, grille fixe

- La section s'appelle désormais **« Rendez-vous »** sur l'Accueil (`app/page.tsx`) ; `CONTEXT.md`
  (entrée **Accueil**) suit. « Le jour » reste le nom de la vue chronologique partagée avec le
  Planning ([ADR 0014](0014-vue-journee-par-reservation-trois-vues.md)) — seule l'étiquette de
  section sur l'Accueil change.
- `AccueilDayList` passe en grille **fixe 3 colonnes** (`grid-cols-3`, pas de repli responsive —
  l'app est bureau uniquement).

### 2. Composition de la réservation

- Nouveau type `BeneficiaryKind = "femme" | "homme" | "enfant"` et champ optionnel
  `RendezVous.beneficiaryKind` — ne tranche que pour un·e bénéficiaire en texte libre qu'une
  prestation Mini&Co ne classe pas déjà « enfant » (un mari, un frère accompagnateur).
- `reservationComposition()` (`lib/data/planning.ts`) compte les bénéficiaires **distincts** des
  rendez-vous actifs (pas les rendez-vous eux-mêmes) : une prestation Mini&Co vaut toujours
  « enfant » ; sinon `beneficiaryKind` s'il est posé ; sinon « femme » (fiche connue ou payeuse).
  Une payeuse qui ne reçoit elle-même aucune prestation (elle dépose ses enfants) n'apparaît pas.

### 3. Extras pré-commandés (boisson / produit à emporter)

- Nouveau type `ReservationExtra` (`kind: "produit" | "boisson"`, `refId`, `qty`) et champ
  optionnel `Reservation.extras`. Jamais de prestation ici — elle naît toujours d'un Rendez-vous.
- Affichés comme des lignes de plus sur la carte et dans `AppointmentDetailSheet`, et ajoutés
  verbatim au panier par `openNewTab` à « Encaisser » — le même geste règle tout d'un coup, comme
  pour les prestations.

### 4. La carte ne grossit jamais

- Au plus **3 lignes** visibles (prestations puis extras) ; le reste se résume en
  « + N de plus ». Le détail complet vit dans la fiche réservation, jamais dans la carte.
- Une prestation « à 2 » affiche ses deux praticiennes sur la même ligne (`A + B`) — supporte le
  cas « même prestation deux fois, 4 praticiennes » sans ligne supplémentaire par praticienne.

## Conséquences

- `lib/data/types.ts` : `BeneficiaryKind`, `RendezVous.beneficiaryKind`, `ReservationExtra`,
  `Reservation.extras`.
- `lib/data/planning.ts` : `reservationComposition()` ; seed `RESERVATIONS` étoffé (composition et
  extras variés — 2/3 femmes, 1 femme + 1 homme, 2 enfants, boissons, produits, 4 praticiennes).
- `lib/data/menu.ts` / `lib/data/boissons.ts` : `produitById()`, `boissonById()`.
- `lib/data/clientele.ts` : cliente `cl-10` (Aminata Fall) pour le cas « 2 enfants ».
- `components/journee/accueil-day-list.tsx` : grille 3 colonnes, composition, cap 3 lignes + extras.
- `components/planning/appointment-detail-sheet.tsx` : section extras, total unifié.
- `lib/store/app-store.ts` : `openNewTab` ajoute les extras au panier.
- `CONTEXT.md` : entrée **Accueil** amendée (« Rendez-vous », pas « Le jour »).
