# Acompte reflété en lecture seule depuis la Réservation, jamais collecté dans l'app

Certaines réservations arrivent de la plateforme externe avec un acompte déjà réglé par la
cliente au moment de la prise de rendez-vous. L'ADR 0009 avait écarté de rapatrier le parcours
de booking — dont l'acompte — dans le point de vente, jugeant ça de la surface morte à
dupliquer. Mais ne rien afficher forcerait la réceptionniste à redemander à l'encaissement une
somme déjà payée ailleurs : un vrai trou dans le calcul, pas une réouverture du parcours de
réservation.

## Décision

`Reservation` gagne un champ `depositPaid?: number`, lu tel quel comme le reste de la
réservation — aucune saisie ni modification possible dans l'app, cohérent avec « la réservation
arrive verbatim ». À l'ouverture d'une vente depuis « Encaisser » (`openNewTab`), ce montant est
copié sur `Sale.depositPaid`, au même titre que les lignes de panier issues des rendez-vous
planifiés.

Au comptoir, `computeTotals` déduit `depositPaid` du `total` pour produire `amountDue` (le
**Reste à encaisser**) : c'est ce montant, pas le `total`, que le panneau paiement fait
correspondre aux modes de règlement. L'acompte n'est **pas** un mécanisme de Remise — il
n'entre jamais dans la ventilation des remises (`DiscountBreakdown`) et s'affiche comme une
ligne à part, toujours visible quand elle existe. Les points fidélité gagnés restent calculés
sur le `total` complet, acompte compris : la cliente a acheté toute la prestation, l'acompte
n'est qu'un règlement fractionné.

Cette lecture seule ne contredit pas l'ADR 0009 : on ne rapatrie ni la prise d'acompte ni son
édition, seulement l'affichage d'un fait déjà réglé ailleurs.

## Conséquences

- `Reservation.depositPaid?: number`, `Sale.depositPaid?: number` (`lib/data/types.ts`).
- `computeTotals` gagne `depositPaid` et `amountDue` ; `confirmPayment` valide les modes contre
  `amountDue`, pas `total`.
- `CONTEXT.md` : nouvelle entrée **Acompte**, sous **Réservation**.
- `docs/USERFLOW.md` : § Comptoir à amender (panneau remise inline + ligne acompte) — voir aussi
  l'ADR sur le panneau déroulant remplaçant le dialog de remise.
