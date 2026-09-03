---
status: accepted
---

# Nouvelle vente : identification de la cliente conditionnelle, une seule entrée scan/code

## Contexte

Le parcours d'encaissement demandait **toujours** une cliente identifiée : « Encaisser » restait bloqué tant que `sale.clientId` était nul, y compris pour une bouteille de shampoing payée cash. L'identification n'était pas non plus une étape de cadrage — la cliente se renseignait souvent en dernier, avant de buter sur le verrou.

Or l'app porte un **invariant** : une prestation n'y naît jamais. La prise de rendez-vous vit sur la plateforme externe ([ADR 0006](0006-reservation-rendez-vous-atomiques.md), [ADR 0009](0009-ajustement-reservations-au-comptoir.md)) ; tout service arrive donc par une **Réservation**, qui porte déjà sa **payeuse**, et s'encaisse par « Encaisser » — jamais saisi au comptoir depuis zéro. Une vente ouverte par « Nouvelle vente » est donc, par nature, une **vente de produits**.

Deux instruments doivent par ailleurs être « liés au système » sans que la cliente ait à retenir quoi que ce soit : ses **points fidélité** (déjà attachés à sa fiche) et ses **cartes cadeaux**.

## Décision

### 1. Identification conditionnelle

- Une vente **produits uniquement** s'encaisse **sans cliente** — l'identification est **facultative** (à ajouter seulement pour la fidélité ou une carte cadeau). Le pied de ticket le dit en sourdine (« Cliente facultative — à ajouter pour la fidélité ou une carte cadeau »).
- Dès qu'une **ligne de prestation** entre au panier, la cliente devient **obligatoire** pour encaisser. Le verrou est **dynamique** : il apparaît si on ajoute un service, disparaît si on le retire. Signal ambre (« Cliente requise : le panier contient une prestation »), cohérent avec la règle One-Signal ([ADR 0005](0005-langage-visuel-le-tableau.md)).
- Helper pur `saleNeedsClient(sale)` = `sale.cart.some(l => l.kind === "service")`, exporté du store. `canCheckout = !panierVide && !(besoinCliente && pasDeCliente)`.
- Le parcours **« Encaisser » depuis une réservation** est inchangé : payeuse + prestations pré-remplies, cliente déjà là.

### 2. Menu : produits en premier

`MenuPanel` s'ouvre sur l'onglet **Produits** (au lieu de Services). La bascule Services reste — la walk-in qui veut *aussi* un service ajouté n'est pas empêchée, elle bascule ; ajouter un service ré-arme le verrou cliente.

### 3. Une seule entrée « Scanner ou saisir une carte » — les deux cartes identifient

- L'ancien `ScannerDialog` (deux instances : « cliente » / « carte cadeau ») est remplacé par **un** `IdentifyDialog` : flux caméra réel + **un seul champ de code** sous le viseur. **L'une comme l'autre carte identifie la cliente** — c'est le rôle premier du dialogue ; le même champ prend un code de fidélité **ou** de carte cadeau.
  - code **fidélité** (`BACO-FID-XXXX`) → résout la fiche via `loyaltyCode`, l'attache à la vente ;
  - code **carte cadeau** → résout la **détentrice** que la carte porte, attache sa fiche, **et** applique la carte au panier dans le même geste (identité + application).
  - Le routage se fait sur ce que le code résout — pas de choix à faire par la réceptionniste.
- **Repli au porteur.** Une carte cadeau qui ne résout aucune détentrice (carte au porteur sans titulaire connu) s'**applique quand même** : la vente reste sans cliente si le panier n'a que des produits, le verrou du §1 n'est pas levé.
- **La caméra lit les QR toute seule** (`BarcodeDetector` là où il existe — Chromium) : le QR détecté est routé comme un code saisi. Pas de bouton « simuler » ; en prototype, faute de carte portant un vrai code, n'importe quel QR lu vaut la carte de démonstration.
- **Bouton « Annuler »** explicite (le dialogue ne se ferme ni au clic sur l'overlay ni à Échap).
- Atteint depuis le bouton **« Scanner »** du ticket **et** l'icône scan du panneau Remise (le champ code carte cadeau du panneau Remise reste comme saisie rapide de secours, cf. USERFLOW).
- **Jeton au porteur, garde-fou par lisibilité.** Présenter la carte (ou taper son code) suffit — on **ne vérifie pas** que le porteur est la « vraie » titulaire, ni pour la fidélité ni pour la carte cadeau (offerte par nature). Le garde-fou est la **lisibilité** : le nom + l'initiale de la cliente s'affichent en tête de ticket dès l'identification, confrontés de visu à la personne en face. Le bouton **« Retirer »** de la ligne cliente du ticket détache la fiche (une carte cadeau appliquée reste). Pas de PIN, pas de rappel d'identité bloquant au moment de dépenser des points ou un solde cadeau (écarté explicitement — friction sans valeur au comptoir).

### 4. Application d'une carte cadeau : ajustable, comme les points

Une carte cadeau appliquée n'est plus consommée « au maximum » en silence. Dans le **panneau Remise**, elle a un contrôle d'ajustement, **parallèle au pas ± des points fidélité** :

- **Carte en montant** → on choisit **combien** du solde appliquer à cette vente (défaut : ce qu'il faut pour couvrir le reste dû ; le **reliquat** reste sur la carte et s'affiche).
- **Carte en prestations** → on choisit **quelles** lignes de prestation du panier la carte couvre (défaut : toutes celles qu'elle est censée couvrir).
- Le choix est modifiable tant qu'on n'a pas encaissé. Le pied de ticket et le reçu **ventilent** la ligne carte cadeau (montant ou prestations couvertes + reliquat) — jamais un total « Remises » agrégé.
- Ordre de calcul inchangé : remise accordée → points → carte cadeau en dernier, clampée à ce qui reste dû.

### 5. Modèle

- `Cliente` gagne `loyaltyCode: string` — généré à la création (`BACO-FID-XXXX`), porté par la carte de fidélité, résolu par `clientByLoyaltyCode(clients, raw)` (insensible à la casse / aux espaces).
- La **carte cadeau porte l'information de sa détentrice et de sa couverture** (montant ou prestations). *La structure de la `CarteCadeau`, son parcours d'achat et sa version imprimée ne sont pas définis par cet ADR* ([ADR 0002](0002-carte-cadeau-instrument-prepaye.md), [ADR 0012](0012-cartes-cadeaux-file-preparation.md)). Cet ADR requiert seulement que `carteCadeauByCode(code)` expose : la détentrice (ou `null` = au porteur), le type de couverture, le solde / les prestations restantes.

## Conséquences

- Store : `saleNeedsClient` exporté (+ ré-export via `app-data-provider`). `addClient` génère `loyaltyCode` ; `Omit` de `addClient` étendu. `applyGiftCard` attache aussi `clientId` si la carte résout une détentrice et que la vente n'en a pas déjà une. Nouveau réglage de la portion appliquée (montant ou prestations) sur `sale.giftCardApplied`.
- `lib/data/clientele.ts` : `loyaltyCode` sur les 9 fiches de démo + `clientByLoyaltyCode`.
- `lib/data/types.ts` : `CarteCadeau` gagne `kind` (`montant` | `prestations`), `serviceIds?`, `holderClientId?` ; `Sale.giftCardApplied` gagne `kind`, `serviceIds?`, `appliedAmount?`, `coveredServiceIds?`.
- `lib/store/app-store.ts` : `applyGiftCard` attache le `holderClientId` de la carte si la vente n'a pas déjà de cliente ; nouvelle action `setGiftCardAdjustment` ; `computeTotals` clampe la carte au montant choisi (montant) ou à la valeur des prestations cochées présentes au panier (prestations), reliquat = solde − appliqué.
- `components/comptoir/` : `identify-dialog.tsx` — un seul champ de code routé par ce qu'il résout, lecture QR par `BarcodeDetector`, plus de boutons démo, bouton « Annuler » ; `discount-section.tsx` — `AppliedGiftCard` : champ montant ajustable ou cases à cocher des prestations couvertes ; `discount-breakdown.tsx` — mention « (prestations) ». Le détachement d'une fiche mal identifiée passe par le « Retirer » existant de la ligne cliente du ticket.
- `lib/data/cartes-cadeaux.ts` : `kind` sur les cartes de démo, `holderClientId` sur deux cartes retrait, une carte `prestations` de démo (`BACO-DUO-EVASION`).
- `CONTEXT.md` : **Carte de fidélité** et **Carte cadeau** — les deux sont des jetons d'identification ; **Carte cadeau** — application ajustable (montant ou prestations) ; entrée **Encaisser** amendée (cliente facultative en vente de produits).
- `docs/USERFLOW.md` : section Comptoir — « Encaisser » conditionnel, Scanner unifié qui identifie via les deux cartes, ajustement de la carte cadeau dans la Remise.
- `docs/CARTE-DES-ECRANS.md` : ligne `IdentifyDialog`.

## Alternatives écartées

- **Interdire les services en vente à froid** (masquer l'onglet Services). Écarté : trop rigide — une walk-in peut légitimement repartir avec un service ajouté ; le verrou conditionnel suffit à garder l'invariant honnête.
- **Rappel d'identité bloquant au moment d'appliquer des points ou un solde cadeau** (nom + confirmation). Écarté : la surface de risque est faible (salon où le personnel connaît les visages) et le coût en friction au comptoir réel est réel. Le nom en tête de ticket + le « Retirer » de la ligne cliente suffisent.
- **Carte cadeau strictement au porteur, sans détentrice** (première version de cet ADR). Écarté : une carte cadeau est aussi un moyen de retrouver la fiche de la personne en face — la faire identifier, comme la carte de fidélité, évite une recherche par nom de plus. Le repli « au porteur » couvre les cartes sans titulaire connu.
