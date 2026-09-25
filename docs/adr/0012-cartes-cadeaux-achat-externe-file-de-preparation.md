---
status: accepted
---

# Cartes cadeaux : achetées hors app, le salon les prépare (imprime + remet / expédie)

L'[ADR 0002](0002-carte-cadeau-instrument-prepaye.md) a laissé ouverte la question de l'**émission** d'une carte cadeau (« aucune surface pour ça, cohérent avec l'ADR 0001 — hors du poste de comptoir »). On tranche : une carte cadeau est **achetée et payée sur une plateforme externe** (comme les réservations — le parcours d'achat ne vit pas dans cette app). À l'achat, l'acheteur choisit un mode de remise : e-carte (hors périmètre), **retrait au salon** en version imprimée, ou **livraison** de la version imprimée.

Les deux modes imprimés alimentent une **file de préparation** ouverte sur l'Accueil. La réceptionniste imprime la carte, puis la remet à la personne (retrait) ou la confie à la livraison (livraison). **Aucun encaissement au salon** — c'est déjà payé.

## Décision

- **Nouvel objet `GiftCardOrder`** (« Commande de carte cadeau ») : `{ buyerClientId, code, amount, fulfillment: "retrait" | "livraison", orderedAt, status, recipientName?/recipientPhone?/deliveryAddress? }`. L'acheteur est **toujours une fiche cliente connue**. Le `code` référence une entrée du ledger `CARTES_CADEAUX` (inchangé — cf. ADR 0002) : la carte imprimée porte un code réel, réutilisable au comptoir plus tard par le flux d'application existant.
- **`status`** : `a_imprimer → imprimee → remise` (retrait) / `→ livree` (livraison). `remise` / `livree` = terminaux, la commande quitte la file. « Livrée » côté salon = **confiée à la livraison** ; la livraison réelle (coursier) se fait hors app, l'app n'orchestre rien — même principe que « Transférer à la manager » (ADR 0011) et les réservations.
- **Accueil** : pas de bloc dédié. La cellule **« Encaissé aujourd'hui »** de « Le point du jour » (`app/page.tsx`) devient **« Cartes à préparer »** — compteur des commandes non résolues (`a_imprimer` + `imprimee`), état vide « Aucune carte à préparer » en sourdine. « Encaissé aujourd'hui » disparaît de l'Accueil (reste via le Récap des ventes).
- **Route dédiée `/cartes-cadeaux`** (« Cartes cadeaux à préparer ») : la file complète. Une ligne = acheteur + montant + badge Retrait/Livraison + statut ; les lignes Livraison exposent nom / téléphone / adresse du bénéficiaire. Actions : **Imprimer** (impression directe de la face carte, `react-to-print`, **sans dialog de prévisualisation** — l'utilisateur ne veut pas voir la carte à l'écran) puis **Marquer comme remise / expédiée**.
- **Face imprimée** (`components/shared/gift-card.tsx`) : conservée **riche** (code + montant + QR démo + branding) — c'est un vrai livrable client, et le code doit pouvoir être scanné/tapé au comptoir. Elle n'est **jamais rendue dans l'UI de la file**, seulement comme cible d'impression hors-écran.
  - **Rév. 2026-09-25 :** l'impression ne sort plus la carte entière — seulement un **code-barres avec le code cadeau juste en dessous** (`components/shared/barcode.tsx`). `components/shared/gift-card.tsx` est supprimé.
- **ADR 0001 préservé** : aucune émission, aucun encaissement, aucune surface manager — le salon ne fait que **préparer** ce qui a été acheté ailleurs.

## Conséquences

- `lib/data/cartes-cadeaux.ts` : `CARTES_CADEAUX` (ledger de codes/soldes) inchangé, + quelques codes actifs supplémentaires pour que les commandes pointent dessus, + `GIFT_CARD_ORDERS` (mock de ~5 commandes en attente).
- Store : slice `giftCardOrders` + actions `printGiftCardOrder` (`a_imprimer → imprimee`) et `markGiftCardOrderHandedOver` (`imprimee → remise|livree` selon `fulfillment`).
- Le composant `components/journee/gift-cards-board.tsx` et la version « 4 dénominations à imprimer à volonté » (commit `7b38d71`) sont **abandonnés** — c'était une lecture erronée du concept (pas de file de commandes réelles, génération implicite).
- `CONTEXT.md` : entrée **Carte cadeau** amendée (canal d'acquisition externe + 3 modes de remise) ; nouveau terme **Commande de carte cadeau**.
- `docs/USERFLOW.md` : Accueil (cellule « Cartes à préparer »), nouvelle section « Cartes cadeaux à préparer ».

## Alternative écartée

Un bloc `Board` dédié sur l'Accueil (la piste initiale). Écarté : l'Accueil doit rester calme (pas de hero-metrics, cf. ADR 0005) et une file d'actions par ligne + les détails de livraison débordent d'une cellule ou d'un bloc d'atterrissage — ça mérite sa route, atteinte par un compteur.

## Révision 2026-09-25 — tuile unique, cartes prestations, recherche

- **Une seule tuile** (`components/journee/gift-card-tile.tsx`) pour l'aperçu de l'Accueil et la page `/cartes-cadeaux`, même grille. Le bouton « Scanner le code cadeau » quitte l'Accueil pour la page dédiée.
- **Cartes prestations** : une commande peut pointer sur une carte `kind: "prestations"` du ledger. La tuile affiche alors les noms des prestations au lieu du montant ; la **face imprimée n'affiche jamais de prix** pour ces cartes (on n'imprime pas la valeur d'un cadeau). Le type vient du ledger (`giftCardContent`), pas d'un champ recopié sur la commande.
- **Recherche + scan** en tête de `/cartes-cadeaux` : nom (acheteuse / destinataire), n° de carte, prestation, téléphone. Une recherche remonte aussi les commandes **déjà remises / expédiées**, en lecture seule (nouveau champ `GiftCardOrder.handedOverAt`, posé par `markGiftCardOrderHandedOver`) — pour répondre à « où en est ma carte ? ». Pas de Réimprimer sur une carte déjà partie (risque de doublon).
- **Fin du bord ambré** (≥ 4 j) : toutes les commandes finissaient par l'avoir, le signal ne distinguait plus rien. L'ancienneté est un texte neutre ; la mise en évidence d'une carte (trouvée par code / scan) utilise l'ombre rosée `highlight-rose` (`app/globals.css`), désormais la recette de référence pour faire ressortir un élément.
