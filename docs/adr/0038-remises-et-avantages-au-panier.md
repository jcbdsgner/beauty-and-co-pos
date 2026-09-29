---
status: accepted
---

# Remises et avantages reviennent au panier, derrière une seule ligne

## Contexte

ADR 0031 avait sorti la remise du panier : tout ce qui change ce qui est dû (remise accordée,
points, carte cadeau, prestations déjà payées) se réglait à la station Règlement, dans le ticket
de droite. Demande du 29/09 : « tout ce qui est remise doit se retrouver dans le premier écran de
nouvelle vente », sans prendre de place.

## Décision

- Au **panier**, une seule ligne de 56 px au pied du ticket, au-dessus du total : **« Remises et
  avantages »**. À droite, ce qui est déjà déduit (« −23 700 F », vert) ; sinon « À utiliser »
  avec le halo rose (`highlight-rose`) quand la cliente détient quelque chose de pas encore
  dépensé (points, carte cadeau, prestation déjà payée) ; sinon « Aucune ».
- Elle ouvre le dialogue **« Remises et avantages »** (`RemisesDialog`) : exactement le mécanisme
  d'ADR 0031, déplacé — « Accorder une remise » → sélection des lignes → compositeur % / montant /
  code manager au-delà de 10 %, plafond 20 % ; étiquette « Remise −X · modifier » par ligne ; puis
  **Avantages de la cliente** (déjà payé, carte cadeau, points). Pied : total en direct +
  « Terminé ». Un dialogue et non un dépliage : la composition d'une remise demande la liste des
  lignes en grand, que le pied du panier ne peut pas donner sans écraser les lignes.
- Les lignes du panier et du Règlement portent l'étiquette « Remise −10 % » en lecture.
- Le **Règlement** ne fait plus que le paiement : son ticket est en lecture seule. Pour changer
  une remise, « ← Panier ».

Inchangés : ordre de calcul, seuils (ADR 0008), motif demandé après l'encaissement, ventilation
au pied du ticket.

## Conséquences

- Remplace, dans ADR 0031, la règle « remises et avantages au Règlement seulement » ; le reste
  (ticket à droite sur 3 stations, remise par ligne, 1–3 parts) tient.
