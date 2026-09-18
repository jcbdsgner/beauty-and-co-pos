---
status: accepted
---

# Planning : refonte totale — un calendrier par collaboratrice, seul écran

## Contexte

Demande utilisateur explicite : refaire le module Planning **entièrement**, en oubliant le design
actuel. Référence fournie (capture d'un calendrier d'équipe type Google/Outlook) : une **ligne par
collaborateur**, le temps qui défile **horizontalement**, des blocs colorés positionnés par heure
de début + durée, une sidebar de filtre par collaborateur, une bascule Jour/Semaine/Mois. Ajout
demandé : une **zone grisée** par collaborateur pour ses heures hors salon — généralement 8 à 10h
de présence par jour, 1 à 2 jours de repos par semaine.

L'existant (ADR 0014) empilait trois préoccupations dans le Planning : une vue « Rendez-vous »
(liste par réservation, pour encaisser — partagée en théorie avec l'Accueil) et une vue
« Planning » (grille heures × colonnes-praticiennes, pour l'équipe). En pratique, l'Accueil avait
déjà forké son propre `AccueilDayList` (refonte daisyUI) : la vue « Rendez-vous » du Planning
(`DayList`/`WeekList`) n'était donc déjà plus partagée avec rien — elle ne servait plus qu'au
Planning lui-même, en double de l'Accueil.

Précision recueillie en grill : la refonte couvre **tout** le module, pas seulement l'ex-vue
« Planning ». Les réservations ne sont plus consultables en liste nulle part dans le Planning —
ce geste reste uniquement sur l'Accueil.

## Décision

**Un seul écran, un seul objet : le programme de chaque praticienne.** Plus de bascule de vue —
le Planning affiche toujours le même calendrier par collaboratrice. La liste de réservations à
encaisser (ex-vue « Rendez-vous », `DayList`/`WeekList`) est **retirée du Planning** ; elle
continue de vivre, inchangée, sur l'Accueil (`AccueilDayList`) — seul endroit désormais.

**Axe renversé : une ligne par praticienne, le temps horizontal.** Suit la référence à la lettre,
plutôt que l'actuel « colonne par praticienne, temps vertical » (`DayGrid`). Chaque ligne porte :
avatar + nom + horaire du jour à gauche, une frise horaire à droite avec les rendez-vous
positionnés dedans (durée = largeur du bloc). Un clic sur un bloc ouvre la fiche réservation —
mêmes gestes qu'avant (ajuster, reprogrammer, annuler, encaisser), rien ne change côté
`AppointmentDetailSheet`/`EditRendezVousDialog`.

**Zone grisée = hors horaire hebdomadaire.** Chaque praticienne porte désormais un **horaire
hebdomadaire récurrent** (`weeklySchedule` : pour chaque jour de semaine, une plage de présence ou
`null` = repos) plutôt que l'ancien `shiftStart`/`shiftEnd`/`workingToday` qui ne décrivait
qu'« aujourd'hui ». La frise grise tout ce qui tombe hors de la plage du jour affiché ; un jour de
repos grise la ligne entière avec un badge « Repos ». Cet horaire est cohérent quel que soit le
jour affiché — navigation possible sans que la zone grisée devienne fausse (un vrai gain sur
l'existant, qui ne calculait le voile hors-shift que pour le jour du seed). `unavailableToday`
(absence de dernière minute) reste un champ à part, posé par-dessus pour le jour courant
seulement — un jour normalement travaillé peut devenir absent, l'horaire hebdomadaire ne bouge
pas.

**Sidebar de filtre, pas un rail de colonnes.** Reprend le principe de la référence (liste de
collaboratrices, avatar + case à cocher pour afficher/masquer sa ligne) plutôt que l'ancien rail de
colonnes du `DayGrid`. Un clic « Isoler » sur une ligne la montre seule (remplace « Voir seule ») ;
`?staff=<id>` reste supporté en query param (lien existant depuis la Fiche cliente, « praticienne
préférée ») pour préselectionner une collaboratrice à l'ouverture. Ménage figure dans la liste (sans
jamais tenir de rendez-vous, ADR historique) ; Accueil (la fonction comptoir) n'y figure pas.

**Jour + Semaine ; pas de Mois.** La bascule Jour/Semaine existante est conservée. Mois (visible
dans la référence) est **délibérément hors périmètre** : une frise horaire par collaboratrice n'a
pas de forme utile à l'échelle du mois pour ce métier (pas de multi-jour, pas de RTT à visualiser) ;
à rouvrir si le besoin se confirme.

**Langage visuel : daisyUI natif, pas « Le Tableau ».** Le Planning était le dernier écran à
porter encore les primitives `board-groove`/`board-amber`/plaque rose de l'ADR 0005 (déjà retiré
partout ailleurs, refonte daisyUI). Cette réécriture totale est l'occasion de les faire disparaître
ici aussi — nouveaux composants en classes daisyUI pures (`base-100`, `base-300`, `base-content`,
`primary`, `warning`), cohérents avec l'Accueil et la Sidebar. `components/ui/board.tsx` n'est **pas**
supprimé : Clientèle, Messages et Catalogue en dépendent encore, migration séparée.

**« Créer un rendez-vous » quitte le Planning.** Il ne vivait déjà que par la fiche réservation
(externe, ADR 0006) ; avec la liste de réservations retirée, il n'a plus de point d'ancrage
naturel au Planning. Reste uniquement sur l'en-tête de l'Accueil.

**Équipe se fond entièrement ici.** `/equipe` (ADR 0005) devenait déjà le Planning ouvert sur sa
vue « Planning » — avec une seule vue restante, la route redirige simplement vers `/planning`.

## Conséquences

- `lib/data/types.ts` : `Praticienne.weeklySchedule` (`Record<jour, {start,end} | null>`) remplace
  `shiftStart`/`shiftEnd`/`workingToday`. `unavailableToday` inchangé.
- `lib/data/praticiennes.ts` : seed avec horaires hebdomadaires réalistes (8-10h/jour, 1-2 jours de
  repos) ; nouveaux helpers `scheduleFor(p, date)`, `isWorkingOn(p, date)`.
- Supprimés (morts avec la vue « Rendez-vous » du Planning, déjà non partagés avec l'Accueil) :
  `components/planning/day-list.tsx`, `week-list.tsx`, `day-grid.tsx`, `week-grid.tsx`.
- Nouveaux : `components/planning/collaborator-row.tsx` (une ligne), `day-timeline.tsx` (vue Jour),
  `week-timeline.tsx` (vue Semaine), `roster-filter.tsx` (sidebar de filtre).
- `components/planning/planning-board.tsx` réécrit : plus de `PlanningView`/`SegmentedToggle`,
  orchestration date + filtre + période seulement.
- `app/equipe/page.tsx` : redirige vers `/planning`.
- `components/journee/replace-staff-dialog.tsx` : `p.workingToday` → `isWorkingOn(p, new Date())`.
- `CONTEXT.md` (Planning, Accueil, nouvelle entrée Praticienne), `docs/CARTE-DES-ECRANS.md`,
  `docs/USERFLOW.md` amendés.
- **Non modifié** : le modèle Réservation → Rendez-vous, `AppointmentDetailSheet`,
  `EditRendezVousDialog`, `useEncaissement`, `lib/data/planning.ts` (toujours utilisé par
  l'Accueil et par les nouvelles vues Planning pour `flattenRendezVous`/`RendezVousRow`).

## Alternatives écartées

- **Garder l'axe colonnes-praticiennes / temps vertical.** Écarté : demande explicite de suivre la
  référence, et une ligne pleine largeur par praticienne lit mieux la zone grisée en tête/fin de
  ligne qu'un voile en haut/bas d'une colonne étroite.
- **Ne redessiner que l'ex-vue « Planning », garder « Rendez-vous » dans le module.** Écarté par
  l'utilisateur en grill — la liste de réservations ne vit plus que sur l'Accueil.
- **Vue Mois complète, fidèle à la référence.** Écarté pour cette passe — pas de forme utile
  identifiée pour une frise horaire par collaboratrice à l'échelle du mois.
- **Horaire toujours "du jour" (`shiftStart`/`shiftEnd`), recalculé au survol d'un autre jour par
  un seed factice.** Écarté : la zone grisée doit rester juste en naviguant dans le temps, un
  horaire hebdomadaire réel est le modèle honnête.
