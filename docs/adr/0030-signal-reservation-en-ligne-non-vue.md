# Signal de réservation en ligne non vue, borné à l'Accueil

`Reservation` porte déjà `source` (`en_ligne` | `comptoir`) et `createdAt`, mais aucun état de
« vu » — rien n'avertissait la réceptionniste qu'une cliente venait de réserver en ligne pendant
qu'elle travaillait ailleurs dans l'app. On ajoute un champ optionnel `seen?: boolean` sur
`Reservation` (absent ou `true` ⇒ vue — le cas par défaut, celui de toute réservation déjà dans le
seed ; seul `false`, posé explicitement, signale une arrivée pas encore remarquée), réservé
**uniquement** aux réservations `source: "en_ligne"` —
jamais sur une réservation `source: "comptoir"` (ADR 0027) : la réceptionniste assiste à sa création
de bout en bout, elle ne peut pas lui être « nouvelle ». Se lève à l'ouverture de sa fiche
réservation, symétrique à `Conversation.unread` (Messages, voir **Non lu** dans `CONTEXT.md`). Le
signal vit uniquement sur l'Accueil (item de sidebar + liste du jour — remplacée par une bande dédiée, voir la révision du 25/09 ci-dessous) : depuis l'ADR 0020, c'est le
seul endroit de l'app où les réservations du jour se consultent — le Planning n'a pas de lieu pour
le résoudre.

## Alternative écartée

Étendre le signal à toute réservation, comptoir compris. Écarté : la réceptionniste serait notifiée
de ses propres actions au moment même où elle les effectue.

## Conséquences

- `CONTEXT.md` : nouvelle entrée **Non vue**.
- Pas de synchro live simulée — le seed pose `seen: false` sur une ou deux réservations `en_ligne`
  du jour, comme `conversations.ts` démarre déjà certains fils à `unread: true`.

## Révision du 25/09 — la bande « Réservations reçues »

Le point taupe sur l'avatar de la carte du jour était trop discret, et limité au jour affiché : une
cliente qui réserve en ligne pour samedi ne se voyait nulle part aujourd'hui. Il est **remplacé**
par une bande rose tout en haut de l'Accueil (au-dessus des Cartes cadeaux),
[`AccueilUnseenReservations`](../../components/journee/accueil-unseen-reservations.tsx) :

- elle liste **toutes** les réservations **Non vues**, quel que soit leur jour, indépendamment de la
  recherche, des dates Du/Au et du filtre de salon de la section « Rendez-vous » ;
- la plus récemment reçue en tête (`createdAt`), avec « Reçue il y a N min », le jour et l'heure du
  passage, la payeuse, la composition, les prestations, les praticiennes et le salon ;
- toucher une ligne ouvre la fiche réservation (ce qui la marque vue — inchangé) et la retire de la
  bande ; « Tout marquer comme vu » la vide d'un geste ; au-delà de 4 lignes, le reste se déplie ;
- la bande disparaît quand il n'y a plus rien.

Le point de la sidebar reste (il signale depuis n'importe quelle section) mais suit la même règle :
tout jour confondu (`isUnseenReservation`). Toujours **en ligne uniquement** — une réservation créée
au comptoir (ADR 0032) n'y apparaît pas. Titre « Réservations reçues », pas « Nouvelles réservations »
(terme écarté par `CONTEXT.md`, voir **Non vue**).
