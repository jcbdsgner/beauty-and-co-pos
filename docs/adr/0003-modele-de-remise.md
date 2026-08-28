# Modèle de remise : trois mécanismes cumulables, motif après l'encaissement

[ADR 0001](0001-persona-unique-poste-de-comptoir.md) a supprimé le rôle direction et son code de déverrouillage. Cet ADR fixe le modèle de remise qui le remplace.

Trois mécanismes, **tous cumulables**, pouvant amener le total à **0 F** :

1. **Points fidélité** — la cliente convertit des points en réduction (100 pts = 1 000 F, par pas de 100, borné à son solde). Distinct de l'**acquisition** de points (10 pts / 1 000 F payés), qui reste inchangée et se calcule sur le total **après** remises.
2. **Carte cadeau** — instrument prépayé, voir [ADR 0002](0002-carte-cadeau-instrument-prepaye.md).
3. **Remise accordée** — une réduction discrétionnaire que la réceptionniste accorde avec **son code personnel**. Elle choisit un **montant** ou un **pourcentage**. Plafond : **20 % du total des prestations** (services uniquement — les produits ne sont jamais remisés ainsi). Au-delà, il faut l'accord de la direction, hors de cette app.

**Ordre de calcul** (l'ordre compte, l'un des mécanismes est un pourcentage) :
`remise accordée` (sur les prestations) → `points` → `carte cadeau` en dernier, clampée à ce qui reste dû.

**Motif obligatoire, saisi après l'encaissement.** Quand une remise accordée est en jeu, une fois « Confirmer l'encaissement » validé et **avant** le reçu, un écran bloquant demande le **motif** (texte libre). Il apparaît ensuite sur le reçu et dans le Récap des ventes. Raison du moment choisi : ne jamais ralentir le comptoir avec une cliente en face — la justification se pose une fois l'argent pris.

## Conséquences

- `Sale` : `managerCode` / `managerDiscountApplied` remplacés par `discountGranted: { mode: "montant" | "pourcentage"; value; grantedByCode; reason: string | null }`.
- Nouvelles actions store : `grantDiscount(saleId, code, mode, value)` (valide le code, applique le plafond), `setDiscountReason(saleId, reason)`.
- `computeTotals` expose le détail par mécanisme ; le pied de ticket, le reçu et le Récap ventilent au lieu d'agréger « Remises ».
- Objet **Remise** (`{ mode, value }`) du modèle conceptuel : c'est le même objet que celui déjà porté par une Relance de reconquête — à unifier dans `docs/USERFLOW.md`.
- `FEATURES.md` §2.5 (« code manager… n'importe quelle chaîne → 5 000 F ») est caduc.
- Encore ouvert : l'**authentification réelle** du code réceptionniste (aujourd'hui : 4 caractères, aucun backend).

## Alternative écartée

Laisser la remise accordée silencieusement se clamper à 20 % si la réceptionniste saisit plus. Écarté : mieux vaut un refus explicite (« le maximum sur ce panier est X ») qu'une valeur changée dans son dos — surtout sur un geste qui engage sa responsabilité et demande un motif.
