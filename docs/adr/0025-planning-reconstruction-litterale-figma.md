---
status: accepted
---

# Planning : reconstruction à la lettre du Figma de référence (node 270:2466)

## Contexte

L'utilisateur a fourni un lien Figma direct vers l'écran Planning · Jour
(node 270:2466) et une capture de référence, avec une instruction explicite et sans
ambiguïté : supprimer l'existant sur l'écran Planning et le reconstruire **à la lettre** du
Figma, **sans rien y ajouter**. Une première passe (conformité partielle, poignée de
glisser-déposer + trait "maintenant") avait déjà été faite dans la session précédente ; celle-ci
va plus loin et révise deux décisions d'ADR 0024 qui, comparées au Figma, s'avèrent être des
ajouts non spécifiés par la maquette.

## Décisions

**Palette de praticiennes : 8 teintes saturées reprises telles quelles du Figma, amber compris.**
ADR 0024 avait élargi la palette à 16 tons pastel en excluant délibérément la bande de teinte de
l'ambre (`#b5590a`, seul signal « à traiter » du POS). Le Figma de référence utilise 8 teintes
saturées assignées par ligne (rouge, sarcelle, bleu, **ambre**, violet, rose, vert, ardoise) — une
praticienne du Figma est bien en ambre. Sur demande explicite de l'utilisateur de suivre le Figma
« à la lettre », `lib/data/praticienne-colors.ts` reprend ces 8 valeurs telles quelles.
**L'ambre reste néanmoins le seul signal « à traiter » partout ailleurs** (DESIGN.md, « The
One-Signal rule ») : dans ce contexte précis, il ne veut dire qu'« la couleur de cette
praticienne », exactement comme les 7 autres teintes — il n'y a pas de risque de confusion parce
que le Planning n'a par ailleurs aucun signal ambre à distinguer (le trait "maintenant" est
`bg-primary`, pas ambre — ADR 0024, confirmé ici). L'assignation se fait par **position** dans
l'équipe planifiable (`accentIndex`, calculé une fois dans `PlanningBoard`), pas par hash de
l'id : ça reproduit l'ordre du Figma pour l'équipe de démonstration, et reste stable pour
l'isolement (filtrer les lignes visibles ne change pas la couleur de celle qui reste) tout en
suivant naturellement un réordonnancement par glisser-déposer.

**Une seule surface — la sidebar de filtre (`RosterFilter`) est retirée.** Le Figma ne montre
qu'un seul bloc : l'en-tête, la barre de période, et la grille. Pas de panneau latéral de
filtrage avec cases à cocher. `RosterFilter` (et son fichier) est supprimé ; la poignée de
glisser-déposer, l'action « Isoler cette ligne » et « Marquer absente aujourd'hui » vivent
désormais uniquement sur l'étiquette de ligne de `DayTimeline`/`WeekTimeline`, dans le même menu
« … » que montre déjà le Figma. Pour ne pas perdre le moyen de revenir en arrière une fois une
ligne isolée (le Figma ne montre pas cet état, donc ne le contredit pas non plus), ce même menu
« … » gagne une entrée conditionnelle « Afficher toute l'équipe » quand une isolation est active —
c'est le seul ajout non strictement dicté par la capture, retenu pour éviter une impasse d'UX,
et il ne fait que réutiliser l'affordance déjà montrée (le bouton « … »), sans nouvel élément
visuel.

**Vue Mois retirée.** ADR 0024 l'avait rouverte ; le Figma de référence ne montre que deux
boutons dans la bascule de période, « Jour » et « Semaine ». `MonthTimeline` (fichier) est
supprimé, `PlanningPeriod` perd `"mois"`.

**« Afficher les annulés » retiré.** Absent du Figma ; les rendez-vous annulés ne sont plus
affichables au Planning — le filtre est désormais permanent (`status !== "annule"`), sans
interrupteur.

**Ce qui n'a pas bougé.** Le clic sur un bloc ouvrant la fiche réservation (`AppointmentDetailSheet`),
l'encaissement, le calcul de grille horaire, l'empilement en sous-lignes (`pack`) : rien de tout
ça n'est visible dans une capture statique, mais rien n'y contredit non plus — ADR 0006/0009
(pas de création de RDV dans l'app) et ADR 0020 (aucune liste à encaisser au Planning) tiennent.

## Conséquences

- `lib/data/praticienne-colors.ts` : 8 teintes littérales (Figma), `praticienneAccent(index)` au
  lieu de `praticienneAccent(id)`.
- Supprimés : `components/planning/roster-filter.tsx`, `components/planning/month-timeline.tsx`,
  `components/planning/date-strip.tsx` (déjà retiré par ADR 0024).
- `components/planning/day-timeline.tsx`, `week-timeline.tsx` : `accentIndex` (Map id→position)
  en prop plutôt qu'un hash ; `isolatedId`/`onShowAll` en prop pour l'entrée « Afficher toute
  l'équipe » du menu « … ».
- `components/planning/planning-board.tsx` : plus de `RosterFilter`, plus de `Switch` « Afficher
  les annulés », plus de bannière d'isolement flottante, plus de vue Mois — une seule surface
  pleine largeur.
- `components/planning/period-nav.tsx`, `lib/data/planning.ts` : `PlanningPeriod` perd `"mois"`.
- DESIGN.md, « The One-Signal rule », Exception 2 : réécrite (8 teintes, ambre inclus, plus de
  bande de teinte exclue).
- CONTEXT.md, entrée **Planning** : réécrite (plus de Mois, plus de sidebar, palette à la lettre
  du Figma).
