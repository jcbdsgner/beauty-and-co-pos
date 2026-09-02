# La vue journée : chronologique par réservation, avec trois vues

Le Planning et le bloc « Le jour » de l'Accueil affichaient la journée **groupée par
praticienne**, une lane par **rendez-vous**. Deux symptômes au comptoir :

- une même cliente apparaît sur plusieurs groupes (une réservation à 3 prestations chez 3
  praticiennes = 3 lanes éparpillées ; une prestation « à 2 » = la cliente 2 fois) ;
- quand plusieurs réservations tombent à la même heure, la réceptionniste doit balayer 7 groupes
  pour retrouver **la** cliente qui se présente au comptoir — son geste n°1 (elle réagit, elle
  n'anticipe pas ; elle retrouve la cliente via la liste du jour, pas une recherche).

« Par praticienne » servait l'équipe, pas l'encaissement — et l'encaissement est le métier.

## Décision

**Vue par défaut : liste chronologique, une ligne = une réservation** (la payeuse). Triée par
heure de début, sous-tri par nom de payeuse à heure égale. La ligne porte : plage horaire
(`début → fin` du passage), payeuse + avatar, résumé des prestations, nombre de praticiennes,
`Encaisser` / `Voir la vente`, jeton `EN COURS` si une vente est ouverte, signal ambre si une
praticienne est absente. Une réservation à plusieurs prestations se **déplie** en sous-lignes
(prestation · praticienne · « pour {bénéficiaire} »). Taper la ligne ouvre la **fiche
réservation** (sheet inchangé).

**Trois vues, basculables** (`ChipFilter` sur la ligne de filtres du Planning) :

| Vue | Grain | Pour |
|---|---|---|
| **Liste chronologique** (défaut) | réservation | retrouver et encaisser une cliente |
| **Par praticienne** | rendez-vous | l'équipe, les absences, « voir seule » |
| **Grille calendrier** | rendez-vous | repérer trous et chevauchements |

**Surface partagée.** Le composant `DayList` (liste chronologique) est rendu **à l'identique**
par le Planning et par le bloc « Le jour » de l'Accueil. L'Accueil ne porte **que** cette vue
(pas de basculeur) — c'est le pilotage calme ; les trois vues et la gestion d'agenda (WeekStrip,
rail équipe, « Afficher les annulés ») vivent sur le Planning. Le compteur de rendez-vous du jour
ne vit plus que dans la cellule « Rendez-vous du jour » de « Le point du jour » (la légende « Le
jour · N rendez-vous » est retirée — « N rendez-vous » sur une liste de réservations était faux).

**Langage visuel inchangé.** « Le Tableau » (ADR 0005) : `Lane`, `FlipChip`, rail de légende,
groove, signal ambre unique, tokens rose/taupe/crème, cibles ≥ 56px. Aucune modification de
`DESIGN.md` au-delà des deux nouveaux composants. Une exploration « nouveau monde visuel pour
cet écran » a été ouverte puis **écartée par l'utilisateur** : rester cohérent avec le reste du
site.

**Non modifié.** Le modèle Réservation → Rendez-vous (ADR 0006/0009), les gestes (Encaisser /
Ajuster / Annuler / Reprogrammer), `useEncaissement` + garde praticienne absente, le vocabulaire.
Statut par ligne = minimum (`EN COURS` sinon rien ; pas de suivi d'« arrivée »). Pas de création
de rendez-vous dans l'app.

## Conséquences

- `lib/data/planning.ts` : `ReservationDayRow`, `groupDayByReservation(reservations, { includeCancelled })`,
  `RendezVousRow` (type nommé pour la ligne rendez-vous-grain).
- Nouveaux composants : `components/planning/day-list.tsx`, `components/planning/day-grid.tsx`.
- `PlanningBoard` : prop `initialGrouping: "praticienne" | "equipe"` → `initialView: "chrono" |
  "praticienne" | "grille"` (défaut `chrono`). `/planning` → `chrono`, `/equipe` → `praticienne`.
  La sélection de vue est un état local (non persisté — cohérent avec le reste du store).
- `app/page.tsx` : le bloc « Le jour » rend `DayList` au lieu des groupes par praticienne ;
  légende « Le jour » ; compteur retiré de la légende.
- `CONTEXT.md` (Accueil, Planning), `docs/USERFLOW.md`, `docs/CARTE-DES-ECRANS.md` amendés.

## Alternatives écartées

- **Nouveau langage visuel pour cet écran seul** (rail de tickets sombre, « poste de travail »).
  Exploré via le tirage impeccable, écarté par l'utilisateur : cohérence avec le reste du site
  avant tout. Le problème était l'architecture d'information, pas le vocabulaire visuel.
- **Kit de dashboard shadcn.** Même raison — un tableau générique ne résout pas « par
  praticienne buries la cliente ».
- **Ligne = rendez-vous, mais dédupliquée.** Une réservation reste l'unité qu'on encaisse ;
  regrouper à ce niveau est le modèle juste, pas un pansement d'affichage.
- **Un état « arrivée » coché à l'accueil.** Écarté (ADR 0009 tient : statut minimum) — la
  cliente se présente d'elle-même, elle est déjà là quand la réceptionniste cherche sa ligne.
