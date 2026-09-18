---
status: accepted
---

# Accueil : bascule Rendez-vous « Liste / Calendrier », abandon du « pas de basculeur »

## Contexte

L'[ADR 0014](0014-vue-journee-par-reservation-trois-vues.md) fixait l'Accueil sur une seule vue
(« pilotage calme ») : les trois vues basculables (Liste chronologique / Par praticienne / Grille
calendrier) restaient réservées au Planning. Demande utilisateur : pouvoir, depuis l'Accueil,
basculer la section « Rendez-vous » sur une vue façon agenda — inspirée de deux captures de
référence (une semaine type Google Calendar, blocs colorés par événement + avatars ; une
illustration de la gestion du chevauchement, plusieurs événements simultanés posés côte à côte).
Le besoin : voir d'un coup d'œil la charge de la journée **dans le temps**, pas seulement une
liste triée — sans dupliquer la « Grille calendrier » du Planning, qui est au grain
rendez-vous / colonnes-praticienne et sert un autre usage (repérer un trou par praticienne).

## Décision

**Deux vues, basculables** (`SegmentedToggle`, même pattern que le Planning) sur la section
« Rendez-vous » de l'Accueil :

- **Liste** (défaut, `AccueilDayList` inchangé, grille 3 cartes) ;
- **Calendrier** (nouveau, `AccueilCalendar`) : la journée en cours en une seule colonne
  verticale (rail heures), un bloc = **une réservation entière** (grain réservation, pas
  rendez-vous), positionné par son passage `start → end`. Les réservations qui se chevauchent
  dans le temps (peu importe la praticienne) sont posées côte à côte en colonnes étroites, sur le
  principe de lane-packing déjà utilisé par `DayGrid` du Planning (`pack()`), adapté ici au niveau
  réservation plutôt que par colonne de praticienne.

Cette bascule renverse la clause « l'Accueil ne porte que cette vue (pas de basculeur) » de
l'ADR 0014 — assumé. Le « pilotage calme » reste vrai sur l'axe temporel : aucune navigation de
date/semaine n'est ajoutée à l'Accueil, qui reste borné à **aujourd'hui**. Seul l'axe « forme
d'affichage » s'ouvre.

**Grain réservation, pas rendez-vous.** Contrairement à la Grille calendrier du Planning (une
colonne par praticienne, un bloc par rendez-vous), le bloc calendrier de l'Accueil reste au grain
réservation — cohérent avec le principe fondateur de l'ADR 0014 (« une réservation, c'est ce qu'on
encaisse, ne jamais l'éparpiller »). Chaque bloc porte : payeuse, heure `start → end`, composition
(ADR 0018), et un empilement d'avatars (cercles superposés + jeton `+N` au-delà de 3) pour les
praticiennes distinctes de la réservation — `ReservationDayRow.staffIds`, déjà calculé, aucun
changement de modèle.

**Palette : pas de code couleur par événement.** Les captures de référence utilisent une couleur
par bloc ; ce projet a une doctrine « un seul signal » (ambre) depuis la refonte daisyUI — le
calendrier de l'Accueil reprend donc le même traitement neutre que les cartes existantes
(`base-100` / `base-300` / `accent`), l'ambre restant réservé aux statuts (« à encaisser »,
« en cours »). Seul le **principe** des captures est repris (bloc positionné dans le temps +
empilement d'avatars + gestion du chevauchement), pas leur palette arc-en-ciel.

**Survol.** Sur un bloc — notamment un bloc rétréci par le chevauchement — le survol ouvre un
`Tooltip` (primitive déjà existante, Radix) qui détaille payeuse, heure, composition et le nom de
chaque praticienne : pas de clic, pas de nouveau pattern d'interaction. Le clic garde le geste
existant : ouvre la fiche réservation (`AppointmentDetailSheet`).

**Pas de bouton Encaisser sur le bloc**, comme les blocs de `DayGrid` — trop étroit en cas de
chevauchement. `Encaisser` reste accessible depuis la fiche réservation ouverte au clic.

## Conséquences

- Nouveau composant `components/journee/accueil-calendar.tsx` (`AccueilCalendar`).
- `app/page.tsx` : état local `view: "liste" | "calendrier"` (non persisté, cohérent avec le
  Planning), `SegmentedToggle` sur la section « Rendez-vous ».
- `CONTEXT.md` (Accueil) et `docs/CARTE-DES-ECRANS.md` amendés.
- Aucun changement à `lib/data/planning.ts` — `ReservationDayRow` porte déjà `staffIds`, `start`,
  `end`.

## Alternatives écartées

- **Réutiliser tel quel `DayGrid` du Planning.** Écarté : grain rendez-vous / colonnes-praticienne,
  pas le besoin exprimé (grain réservation, une seule colonne façon agenda personnel). Aurait aussi
  réintroduit l'éparpillement d'une réservation sur plusieurs colonnes que l'ADR 0014 a corrigé.
- **Palette multicolore par réservation**, fidèle aux captures. Écarté : contredit la doctrine
  « un seul signal » du langage visuel actuel (refonte daisyUI).
- **Ajouter aussi la navigation semaine/jour sur l'Accueil.** Non demandé, écarté pour l'instant —
  reste fidèle à « aujourd'hui seulement » ; à rouvrir si le besoin se confirme.
