# Fiche réservation en panneau latéral, avec annulation de la réservation entière

La fiche réservation (Accueil et Planning) était un dialogue centré, modal — masquant la liste
derrière un overlay opaque, cohérent avec les autres formulaires de saisie de l'app (`Dialog`,
qui bloque volontairement le clic hors champ et Échap pour protéger une saisie en cours). Mais
la fiche réservation n'est **pas une saisie** : c'est une vue de lecture avec des actions
ponctuelles (Annuler, Modifier, Encaisser) — rien ne s'y perd à un clic distrait. On lui donne
donc un traitement différent : un **panneau latéral droit** qui glisse par-dessus la page sans
la masquer complètement (la liste de l'Accueil ou la grille du Planning reste visible derrière),
et qui se ferme au clic hors panneau ou à Échap — nouvelle variante `side` du `Dialog`,
distincte de la variante `sheet` existante (qui ancre en bas, façon formulaire).

Le panneau montre pour la première fois le détail complet groupé **par bénéficiaire** plutôt
qu'en liste plate de rendez-vous, et les **avantages** de la payeuse (carte cadeau, points
fidélité, abonnement, pack) — jusqu'ici visibles seulement au Comptoir — en lecture seule. Son
bouton « Annuler » devient un geste de **réservation entière** (toutes les lignes actives
annulées d'un coup, motif facultatif partagé) : un nouveau niveau, distinct de l'annulation
d'un rendez-vous précis qui reste possible ligne par ligne depuis « Modifier » (ADR 0009). Une
réservation dont toutes les lignes sont annulées ne peut plus être ni modifiée, ni encaissée —
mêmes gestes masqués qu'aujourd'hui pour un rendez-vous unique annulé.

## Conséquences

- Nouvelle action store `cancelReservation(reservationId, reason?)`, en plus de
  `cancelAppointment` (inchangée).
- `components/ui/molecules/dialog.tsx` : `variant` gagne `"side"`.
- `CONTEXT.md` : nouvelle entrée **Fiche réservation** ; entrée **Rendez-vous** précise les deux
  niveaux d'annulation.
