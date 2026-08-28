# Carte cadeau : instrument prépayé, le reliquat reste sur la carte

Le code d'origine traitait la carte cadeau comme une remise à montant fixe (25 000 F codés en dur, plafonnés pour que le total ne passe pas sous 0). Si la carte valait plus que le ticket, la différence était perdue silencieusement.

Nous actons que la **carte cadeau est un instrument prépayé**, pas une remise :

- La carte porte son propre **solde** (`balance`). La vente ne consomme que ce qu'il faut pour couvrir le reste à payer ; le **reliquat reste sur la carte** et se réutilise lors d'un prochain passage.
- Le montant réellement consommé n'est pas stocké sur la vente — il se dérive dans `computeTotals` (la carte est appliquée **en dernier**, après la remise accordée et les points, et clampée à ce qui est encore dû).
- Statuts : `active`, `used` (solde épuisé), `expired` (avec date). Trois messages distincts au comptoir — jamais le texte générique d'un code mal saisi, qui semblerait accuser la cliente en face.
- Registre mock : `lib/data/cartes-cadeaux.ts`. `confirmPayment` décrémente le solde pour que le reliquat soit réel au scan suivant (dans les limites de la session, sans backend).

## Conséquences

- Le type `Sale.giftCardApplied` passe de `{ code; amount }` à `{ code; balance }`.
- `computeTotals` expose `giftCardDiscount` (consommé) et `giftCardRemaining` (reliquat), affichés au comptoir et sur le reçu.
- `FEATURES.md` §2.5 (« code cadeau… remise fixe de 25 000 ») est caduc.
- Question encore ouverte : émission / rechargement d'une carte cadeau (aucune surface pour ça, cohérent avec [ADR 0001](0001-persona-unique-poste-de-comptoir.md) — hors du poste de comptoir).

## Alternative écartée

Garder la carte cadeau comme une remise et absorber le reliquat (le perdre). Écarté : une carte cadeau non consommée entièrement est de l'argent que la cliente a déjà payé — le lui faire disparaître est un défaut, pas une simplification.
