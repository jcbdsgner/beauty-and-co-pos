---
status: accepted
---

# Pourboire proposé avant le reçu

## Contexte

Demande du 25/09 : juste avant d'arriver au reçu, un dialogue doit demander si la cliente veut
laisser un pourboire — montants rapides 2k, 4k, 5k, 10k, 12k, 15k, 20k, 25k, 30k et « Autre »
(montant libre). Facultatif : on doit pouvoir continuer sans.

## Décision

- **Où** : « Confirmer l'encaissement » (station Règlement) ouvre `TipDialog`. La vente n'est
  encaissée qu'une fois le dialogue répondu — « Sans pourboire » ou « Ajouter X F ». Le « × »
  revient au Règlement sans rien encaisser (on peut encore corriger le paiement).
- **Montant** : 9 tuiles + « Autre », qui ouvre le `NumericKeypad` et affiche le total réglé.
- **Moyen** : 4 tuiles compactes, pré-sélection = moyen de la dernière part (Espèces si rien à
  régler). En espèces, le pourboire se prend d'abord sur la monnaie à rendre ; au-delà, la
  cliente remet des espèces en plus (`cashReceived` augmente, `change` descend à 0).
- **Modèle** : `Sale.tip?: { amount, mode }`, posé par `confirmPayment`. Ce n'est **ni une part**
  (`payment.modes` reste la vente seule, le Récap et la ventilation par moyen ne bougent pas),
  **ni une remise**, et il ne rapporte **aucun point** ni ne compte dans `totalSpent`.
- **Reçu** : ligne « Pourboire » dans la station Reçu, sur le ticket à l'écran et sur le reçu
  imprimé (avec « Total réglé »), et dans la vue reçu de l'Accueil.

## Conséquences

- Les pourboires n'apparaissent pas encore dans le Récap des ventes (pas de total par
  praticienne) — à décider si la direction veut les suivre.
