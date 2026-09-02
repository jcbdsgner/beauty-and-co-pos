---
status: accepted
---

# Nouvelle vente : identification de la cliente conditionnelle, une seule entrée scan/code

## Contexte

Le parcours d'encaissement demandait **toujours** une cliente identifiée : « Encaisser » restait bloqué tant que `sale.clientId` était nul, y compris pour une bouteille de shampoing payée cash. L'identification n'était pas non plus une étape de cadrage — la cliente se renseignait souvent en dernier, avant de buter sur le verrou.

Or l'app porte un **invariant** : une prestation n'y naît jamais. La prise de rendez-vous vit sur la plateforme externe ([ADR 0006](0006-reservation-rendez-vous-atomiques.md), [ADR 0009](0009-ajustement-reservations-au-comptoir.md)) ; tout service arrive donc par une **Réservation**, qui porte déjà sa **payeuse**, et s'encaisse par « Encaisser » — jamais saisi au comptoir depuis zéro. Une vente ouverte par « + Nouvelle vente » est donc, par nature, une **vente de produits**.

Deux instruments doivent par ailleurs être « liés au système » sans que la cliente ait à retenir quoi que ce soit : ses **points fidélité** (déjà attachés à sa fiche) et ses **cartes cadeaux**.

## Décision

### 1. Identification conditionnelle

- Une vente **produits uniquement** s'encaisse **sans cliente** — l'identification est **facultative** (à ajouter seulement pour la fidélité ou une carte cadeau). Le pied de ticket le dit en sourdine (« Cliente facultative — à ajouter pour la fidélité ou une carte cadeau »).
- Dès qu'une **ligne de prestation** entre au panier, la cliente devient **obligatoire** pour encaisser. Le verrou est **dynamique** : il apparaît si on ajoute un service, disparaît si on le retire. Signal ambre (« Cliente requise : le panier contient une prestation »), cohérent avec la règle One-Signal ([ADR 0005](0005-langage-visuel-le-tableau.md)).
- Helper pur `saleNeedsClient(sale)` = `sale.cart.some(l => l.kind === "service")`, exporté du store. `canCheckout = !panierVide && !(besoinCliente && pasDeCliente)`.
- Le parcours **« Encaisser » depuis une réservation** est inchangé : payeuse + prestations pré-remplies, cliente déjà là.

### 2. Menu : produits en premier

`MenuPanel` s'ouvre sur l'onglet **Produits** (au lieu de Services). La bascule Services reste — la walk-in qui veut *aussi* un service ajouté n'est pas empêchée, elle bascule ; ajouter un service ré-arme le verrou cliente.

### 3. Une seule entrée « Scanner ou saisir une carte »

- L'ancien `ScannerDialog` (deux instances : « cliente » / « carte cadeau ») est remplacé par **un** `IdentifyDialog` : flux caméra réel + **deux champs** sous le viseur —
  - **Code carte de fidélité** → identifie la cliente (attache sa fiche à la vente) ;
  - **Code carte cadeau** → applique l'instrument prépayé (flux `applyGiftCard` inchangé, [ADR 0002](0002-carte-cadeau-instrument-prepaye.md)).
- Un QR scanné est **routé** selon ce que son code résout (carte cadeau connue → cadeau, sinon → fidélité). Mode démo : deux boutons explicites (« Fidélité » / « Carte cadeau »).
- Atteint depuis le bouton **« Scanner »** du ticket **et** l'icône scan du panneau Remise — un seul lieu (le champ code carte cadeau du panneau Remise reste comme saisie rapide de secours, cf. USERFLOW).
- **La carte de fidélité = jeton d'identification au porteur** : la présenter (ou taper son code) suffit. On **ne vérifie pas** que le porteur est la « vraie » titulaire — ni pour la carte de fidélité, ni pour la carte cadeau (instrument au porteur par nature). Le garde-fou est la **lisibilité** : nom + initiale de la cliente en tête de ticket, confrontés de visu à la personne en face. Pas de PIN, pas de rappel d'identité au moment de dépenser des points (écarté explicitement — friction sans valeur au comptoir).

### 4. Modèle

- `Cliente` gagne `loyaltyCode: string` — généré à la création (`BACO-FID-XXXX`), porté par la carte de fidélité, résolu par `clientByLoyaltyCode(clients, raw)` (insensible à la casse / aux espaces).

## Conséquences

- Store : `saleNeedsClient` exporté (+ ré-export via `app-data-provider`). `addClient` génère `loyaltyCode` ; `Omit` de `addClient` étendu.
- `lib/data/clientele.ts` : `loyaltyCode` sur les 9 fiches de démo + `clientByLoyaltyCode`.
- `components/comptoir/` : `identify-dialog.tsx` (nouveau) ; `scanner-dialog.tsx` supprimé ; `comptoir-panel.tsx` (une entrée `scanOpen`) ; `sale-cart-panel.tsx` (verrou conditionnel, copy) ; `discount-section.tsx` (prop `onOpenScanner`) ; `menu-panel.tsx` (défaut Produits).
- `CONTEXT.md` : nouveau terme **Carte de fidélité** ; entrée **Encaisser** amendée (cliente facultative en vente de produits) ; **Points fidélité** / **Carte cadeau** : préciser le jeton au porteur.
- `docs/USERFLOW.md` : section Comptoir — « Encaisser » conditionnel, Scanner unifié.

## Alternatives écartées

- **Interdire les services en vente à froid** (masquer l'onglet Services). Écarté : trop rigide — une walk-in peut légitimement repartir avec un service ajouté ; le verrou conditionnel suffit à garder l'invariant honnête.
- **Rappel d'identité bloquant au moment d'appliquer des points** (nom + confirmation). Écarté : la surface de risque est faible (100 pts = 1 000 F, salon où le personnel connaît les visages) et le coût en friction au comptoir réel est réel. La lisibilité du nom en tête de ticket suffit.
- **Rattacher chaque carte cadeau à une fiche titulaire** pour l'afficher « en 1 tap » après identification. Écarté (pour l'instant) : la carte cadeau est un instrument **au porteur** — pas de titulaire naturel (l'acheteur l'a offerte). Le scan/saisie du code couvre le besoin.
