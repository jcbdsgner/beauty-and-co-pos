# Règlement : la remise quitte le panier, remise par ligne, paiement en trois parts

Jusqu'ici la remise se posait **sur le panier** (dialogue « Ajouter une remise » en pied de
ticket), s'appliquait à **toutes les prestations** du ticket, et le paiement acceptait au plus
**deux** moyens. L'écran de paiement remplaçait le ticket par un récapitulatif différent.

## Décision

L'encaissement devient **trois stations sur la même feuille**, et **le ticket ne bouge jamais** :
il occupe la colonne de droite du Comptoir du premier article au reçu imprimé. Seule la colonne de
gauche change.

| Station | Gauche | Ticket (droite) |
|---|---|---|
| **Panier** (`step: "vente"`) | Menu | cliente, lignes (quantité, retrait), total — **aucune remise** ; bouton **Encaisser** |
| **Règlement** (`"paiement"`) | moyens de paiement, parts, pavé | lignes figées, **« Accorder une remise »**, avantages de la cliente, total, **Confirmer l'encaissement** |
| **Reçu** (`"recu"`) | ce qui s'est passé, **motif** si remise, suite | le ticket devient le reçu imprimable |

1. **Tout ce qui modifie ce qui est dû se règle au Règlement** : remise accordée, points fidélité,
   carte cadeau (auto-liée, ajustable), prestations déjà payées (Pack / Abonnement). Le panier ne
   sert qu'à composer. Le panier montre encore l'effet de ce qui est automatique (« Déjà payé »,
   carte cadeau, acompte) dans son total, en lecture seule.
2. **Remise par ligne.** Une remise cible un **ensemble de lignes de prestation** choisies sur le
   ticket (« Tout le ticket » = toutes les lignes remisables). Plusieurs remises peuvent coexister
   sur un même ticket ; une ligne n'en porte qu'une (la re-sélectionner la déplace vers la nouvelle).
   Produits, boissons et lignes entièrement « déjà payées » ne sont pas remisables.
3. **Les seuils se mesurent sur l'assiette de la remise** — le net des lignes sélectionnées : ≤ 10 %
   sans code, 10–20 % avec **code manager**, 20 % plafond absolu (ADR 0008 inchangé sur le fond).
   Un montant fixe se répartit sur les lignes au prorata de leur net.
4. **Pas de modale pour la remise.** Tout se passe dans le ticket : « Accorder une remise » → les
   lignes remisables reçoivent une case → le compositeur (% ou montant, code manager au-delà de
   10 %) prend le pied du ticket → « Appliquer ». Chaque ligne remisée affiche son nouveau prix et
   une étiquette « Remise −10 % · modifier » qui rouvre la remise (modifier / retirer).
5. **Paiement en 1 à 3 parts.** Une part = tout le montant, rien à saisir. « Payer en plusieurs
   fois » ajoute une part (jusqu'à 3). Toutes les parts sauf la dernière se tapent au pavé ; **la
   dernière est toujours « le reste », calculée** — une répartition ne tombe donc jamais « à côté »,
   elle peut seulement dépasser (message explicite). Un même moyen peut revenir (deux cartes) ;
   Espèces une seule fois, puisqu'elle porte le rendu de monnaie.
6. **Tuiles de paiement** : quatre grandes tuiles, **Carte** et **Espèces** en grosses icônes au
   trait, Wave et Orange Money avec leur logo — **toutes avec leur libellé**.
7. **Un seul motif par vente**, saisi au Reçu (toujours après l'encaissement, ADR 0003) — plus en
   modale : une carte inline qui tient les autres actions désactivées tant qu'il manque.

## Conséquences

- `RemiseAccordee` gagne `id` et `lineIds`, perd `reason`. `Sale.discountGranted` → `Sale.remises[]`
  + `Sale.remiseReason`. `Sale.payment` gagne `cashReceived?` / `change?`.
- `grantDiscount(saleId, lineIds, mode, value, managerCode?)`, nouvelle action `removeRemise`.
  `removeCartLine` retire la ligne de sa remise. `computeTotals` expose `lineAssiette`,
  `lineDiscount`, `remiseBreakdown` ; `maxGrantedDiscount` / `receptionistMaxDiscount` disparaissent.
- Ordre de calcul inchangé : déjà payé → remises accordées → points → carte cadeau → acompte.
- Composants : `payment-step.tsx` et `discount-section.tsx` supprimés ; nouveaux `ticket-parts.tsx`
  (blocs partagés par les trois stations), `settlement-step.tsx`, `settlement-ticket.tsx`,
  `advantages-section.tsx`, `payment-modes.tsx`. `receipt-step.tsx` réécrit.
- Récap des ventes : `DiscountBreakdown` ventile une ligne par remise (« Remise 10 % · 2 prestations »).

## Alternatives écartées

- **Remise en modale depuis l'écran de paiement** : écartée, la cliente est en face et le ticket
  est ce qu'elles regardent toutes les deux ; la sélection de lignes a besoin du ticket sous les yeux.
- **Plafond mesuré sur tout le ticket même pour une remise ciblée** : aurait permis 100 % sur une
  petite ligne tant que le ticket global restait sous 20 %. Le plafond suit l'assiette réelle.
- **Parts toutes saisies à la main + « reste à répartir »** (l'ancien paiement mixte) : source
  d'erreurs de frappe. La dernière part calculée supprime la classe d'erreur.
