---
status: accepted
---

# Planning : vue Mois, blocs à la prestation, palette élargie, tri par glisser-déposer

## Contexte

Retour utilisateur sur le Planning (ADR 0020), avec la même référence visuelle (capture d'un
calendrier d'équipe type Google/Outlook) qui avait déjà servi de base à cette refonte : quatre
ajustements demandés. (1) Une praticienne ne doit jamais paraître faire deux prestations à la
fois. (2) Un bloc ne doit montrer que la prestation à faire, pas la cliente — le détail au clic.
(3) Plus de couleurs pour distinguer les collaboratrices, et un tri de la sidebar par
glisser-déposer. (4) Un en-tête de navigation inspiré de la référence.

En creusant (1) et (2), les deux étaient déjà acquis dans le code existant : `DayTimeline` empile
déjà les rendez-vous qui se chevauchent en sous-lignes verticales (`pack`), et le bloc affichait
déjà le nom de la cliente en primaire avec le service en secondaire seulement si assez large —
pas d'inversion nécessaire pour l'empilement, juste pour le contenu du bloc. Restaient trois vrais
sujets de décision, tranchés en grill :

## Décisions

**Vue Mois rouverte.** ADR 0020 l'avait explicitement écartée, faute de forme utile pour une
frise horaire par collaboratrice à cette échelle. On reprend la grammaire déjà validée pour
Semaine (une ligne par collaboratrice, une cellule compacte par jour : horaire ou nombre de
rendez-vous) et on l'étend aux ~30 jours du mois affiché plutôt que 7, avec défilement
horizontal — `MonthTimeline`. Un vrai calendrier semaines × jours a été écarté : il aurait fallu
choisir une seule collaboratrice à la fois, perdant la comparaison d'équipe qui fait la force des
vues Jour/Semaine. « Créer un rendez-vous » **reste** hors du Planning (ADR 0006/0009 tiennent) —
la référence a un bouton Créer, mais la prise de RDV reste sur la plateforme externe.

**En-tête compact, sans sélecteur de jour indépendant.** `DateStrip` (bandeau mois + flèches
semaine, puis une rangée de 7 jours cliquables) est retiré et remplacé par `PeriodNav` : une seule
barre ◀ ▶ + libellé de période + bascule Jour/Semaine/Mois, à la lettre de la référence. Plus de
rangée de jours cliquables — pour atterrir sur un jour précis dans la semaine, on passe par la vue
Semaine et on clique une cellule (déjà le comportement de `WeekTimeline`/`MonthTimeline`). Un
bouton « Aujourd'hui » apparaît dès que la période affichée (jour, semaine ou mois) ne contient
plus la date du jour.

**Bloc = prestation seule.** Le bloc n'affiche plus que l'heure et le nom de la prestation ; le
nom de la cliente disparaît du bloc (il reste immédiat au clic, dans `AppointmentDetailSheet`).
Lecture pensée pour la praticienne qui balaie sa ligne : « quoi », pas « qui ».

**Palette élargie à 16 teintes, deuxième exception documentée à la règle du signal unique.**
`praticienne-colors.ts` portait déjà, sans ADR, une exception à la règle « ambre seul signal »
(DESIGN.md) — seulement 7 teintes pastel, qui se répétaient dès qu'une équipe dépassait 7
collaboratrices. On élargit à 16 teintes plus saturées (même principe fond clair + bordure +
texte + pastille), en excluant la bande de teinte 10–45° (zone de l'ambre `#b5590a`, seul signal
« à traiter » du POS) et le rose/taupe de marque. Cette ADR formalise ce que le fichier faisait
déjà : le Planning devient, à côté de l'Accueil (ADR 0022), une **deuxième** exception nommée à la
règle du signal unique — DESIGN.md amendé en conséquence. Contrairement à l'Accueil, on garde les
teintes en fond clair + texte foncé (pas d'aplat saturé avec texte blanc) : plus proche du
vocabulaire existant du Planning que de la référence à la lettre.

**Tri de la sidebar par glisser-déposer, dans chaque groupe de rôle, non persisté.** Les groupes
Coiffeur/Esthéticien/Ménage sont conservés (repère utile) ; à l'intérieur d'un groupe, l'ordre
devient libre par glisser-déposer au lieu d'être figé alphabétique. `movePraticienne` (store)
réordonne le tableau `praticiennes` ; `schedulable` (Planning) ne trie plus que par rôle
(`Array.prototype.sort` est stable, l'ordre à l'intérieur d'un rôle suit donc le tableau du
store). Pas de persistance (localStorage) : session-only, cohérent avec le reste du store, et
évite la garde d'hydratation supplémentaire qu'une lecture localStorage aurait demandée.

## Conséquences

- `lib/data/planning.ts` : nouveau type `PlanningPeriod = "jour" | "semaine" | "mois"`.
- `lib/store/app-store.ts` : nouveau mutateur `movePraticienne(draggedId, targetId)`.
- `lib/data/praticienne-colors.ts` : 16 teintes au lieu de 7.
- Nouveaux : `components/planning/period-nav.tsx` (remplace `date-strip.tsx`, supprimé),
  `components/planning/month-timeline.tsx`.
- `components/planning/day-timeline.tsx` : bloc à la prestation, `clients`/payeur retirés des
  props (plus utilisés — le détail vit dans `AppointmentDetailSheet`).
- `components/planning/roster-filter.tsx` : poignée de glisser-déposer par ligne.
- DESIGN.md, « The One-Signal rule » : deuxième exception (Planning) documentée à côté d'ADR 0022.

## Addendum — conformité Figma (node 270:2466)

Deux écarts trouvés en comparant `DayTimeline` à la maquette Figma de référence, corrigés :

- **Poignée de glisser-déposer aussi dans `DayTimeline`.** La maquette montre la poignée
  (`GripVertical`) sur l'étiquette de ligne du planning lui-même, pas seulement dans
  `RosterFilter`. Le tri était jusqu'ici réservé à la sidebar de filtre ; `DayTimeline` gagne la
  même poignée et le même `onReorder` (`movePraticienne`), pour pouvoir réordonner l'équipe
  directement depuis la grille.
- **Trait « maintenant » en couleur de marque, pas ambre.** Il utilisait `bg-warning` (`#b5590a`,
  la même teinte que le signal « à traiter »). La maquette Figma le montre dans `#886666` (couleur
  de marque, `bg-primary`) — cohérent avec la règle du signal unique que cette ADR formalise
  : le trait "maintenant" repère l'heure, ce n'est pas un signal « à traiter ». C'était une
  dérive locale de la règle, pas une exception voulue ; corrigée pour s'aligner sur le Figma.
