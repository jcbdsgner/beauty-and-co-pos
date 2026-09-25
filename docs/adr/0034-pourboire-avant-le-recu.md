---
status: accepted
---

# Pourboire proposé avant le reçu

## Contexte

Demande du 25/09 : juste avant d'arriver au reçu, un dialogue doit demander si la cliente veut
laisser un pourboire — montants rapides 2k, 4k, 5k, 10k, 12k, 15k, 20k, 25k, 30k et « Autre »
(montant libre). Facultatif : on doit pouvoir continuer sans.

## Décision

*Révisé le 25/09 : le dialogue s'ouvre désormais à « Encaisser », avant le choix des moyens de
paiement (et non plus à « Confirmer l'encaissement »).*

- **Où** : « Encaisser » (ticket du panier) ouvre `TipDialog`, avant la station Règlement.
  « Sans pourboire » ou « Ajouter X F » y mènent ; le « × » reste sur le panier. Revenir au panier
  puis ré-encaisser rouvre le dialogue avec le pourboire déjà choisi.
- **Montant** : 9 tuiles + « Autre », qui ouvre le `NumericKeypad` et affiche le total réglé. Le
  dialogue ne demande plus de moyen de paiement.
- **Règlement** : le pourboire (`Sale.pendingTip`) s'ajoute au montant à encaisser (« dont X F de
  pourboire » sous le total) ; les parts couvrent vente + pourboire, et la monnaie à rendre en
  espèces se calcule sur ce total.
- **Moyen** : celui de la dernière part. À la confirmation, le pourboire est retiré des parts en
  partant de la dernière, pour que `payment.modes` reste la vente seule.
- **Modèle** : `Sale.tip?: { amount, mode }`, posé par `confirmPayment`. Ce n'est **ni une part**
  (`payment.modes` reste la vente seule, le Récap et la ventilation par moyen ne bougent pas),
  **ni une remise**, et il ne rapporte **aucun point** ni ne compte dans `totalSpent`.
- **Reçu** : ligne « Pourboire » dans la station Reçu, sur le ticket à l'écran et sur le reçu
  imprimé (avec « Total réglé »), et dans la vue reçu de l'Accueil.

## Conséquences

- Les pourboires n'apparaissent pas encore dans le Récap des ventes (pas de total par
  praticienne) — à décider si la direction veut les suivre.
