---
status: accepted
---

# Calendrier Accueil : palette multicolore par bloc (amende ADR 0019)

## Contexte

L'[ADR 0019](0019-accueil-bascule-vue-calendrier.md) a introduit `AccueilCalendar` en reprenant
seulement le *principe* des captures de référence (bloc positionné dans le temps + empilement
d'avatars + gestion du chevauchement), pas leur palette arc-en-ciel — au nom de la doctrine
« un seul signal » (ambre) actée par la refonte daisyUI.

À l'usage, le rendu neutre (`base-100` / `base-300` / `accent`) rendait la vue illisible : sans
couleur pour séparer les blocs à l'œil, et avec une échelle temporelle trop compacte (34px par
tranche de 30 min), le contenu d'un bloc (heure, nom, composition, avatars) dépassait la hauteur
réservée et se faisait rogner par le `overflow-hidden` dès qu'une réservation durait moins d'une
heure — capture à l'appui, le rendu était devenu illisible. Demande utilisateur, avec une seconde
capture de référence (agenda hebdomadaire coloré) : reprendre aussi la palette cette fois, et
casser explicitement la doctrine « un seul signal » pour cette vue précise.

## Décision

**`AccueilCalendar` devient l'exception documentée à la doctrine « un seul signal ».** Chaque
bloc reçoit une couleur de famille — rotation déterministe sur 5 familles selon l'ordre
chronologique des réservations du jour (pas par praticienne, pas par statut) — pour se distinguer
visuellement de ses voisines, comme dans un agenda personnel. Le fond de la carte est teinté, une
barre de 3px en haut porte la teinte saturée de la famille, l'heure et le jeton `+N` d'avatars
reprennent cette même teinte.

**Les 5 familles sont dérivées de teintes déjà en usage dans l'app**, pas inventées :
`--cal-amber-*` (= warning), `--cal-mint-*` (= success), `--cal-sky-*` (= info), plus deux
nouvelles déclinaisons cohérentes avec la marque : `--cal-lilac-*` (dérivée de `--brand-lilac`,
VIP) et `--cal-rose-*` (dérivée du rose `#fdcfca` de la palette b&co). Tokens posés dans
`app/globals.css`, commentés comme exception.

**L'ambre garde son sens de statut à l'intérieur des blocs.** Le point « à encaisser » reste
ambre plein quelle que soit la famille de couleur du bloc — la palette décorative ne doit jamais
être confondue avec le signal de statut.

**Correction de l'échelle, indépendante de la palette.** `SLOT_H` passe de 34px à 64px par
tranche de 30 min et une hauteur plancher (`MIN_CARD_H`, 118px) garantit que le contenu d'un bloc
(heure + nom + composition + avatars) n'est jamais rogné, même pour une réservation de 15–30 min.
`LANE_MIN_W` élargi (150 → 232px) pour la même raison en largeur.

## Conséquences

- `app/globals.css` : bloc de tokens `--cal-*` (5 familles bg/fg).
- `components/journee/accueil-calendar.tsx` : rotation de palette par index chronologique,
  nouvelle échelle, plancher de hauteur, conteneur à fond blanc explicite (`bg-base-100`,
  `rounded-box`, `border`).
- `DESIGN.md` : le One-Signal rule documente désormais son exception.
- `docs/CARTE-DES-ECRANS.md` amendé.
- Aucun changement de modèle de données ni de logique de statut — décoratif seulement.

## Alternatives écartées

- **Garder le neutre et corriger seulement l'échelle.** Aurait réglé le rognage mais pas la
  demande explicite de reprendre la palette de la référence ; écarté.
- **Étendre le multicolore à d'autres vues** (Planning, Fiche, etc.). Non demandé — l'exception
  reste strictement bornée à `AccueilCalendar`.
