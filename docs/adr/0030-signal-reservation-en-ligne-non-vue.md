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
signal vit uniquement sur l'Accueil (item de sidebar + liste du jour) : depuis l'ADR 0020, c'est le
seul endroit de l'app où les réservations du jour se consultent — le Planning n'a pas de lieu pour
le résoudre.

## Alternative écartée

Étendre le signal à toute réservation, comptoir compris. Écarté : la réceptionniste serait notifiée
de ses propres actions au moment même où elle les effectue.

## Conséquences

- `CONTEXT.md` : nouvelle entrée **Non vue**.
- Pas de synchro live simulée — le seed pose `seen: false` sur une ou deux réservations `en_ligne`
  du jour, comme `conversations.ts` démarre déjà certains fils à `unread: true`.
