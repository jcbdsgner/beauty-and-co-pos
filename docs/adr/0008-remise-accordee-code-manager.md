# Remise accordée : 10 % sans code, code manager de 10 à 20 %

[ADR 0003](0003-modele-de-remise.md) posait un plafond unique de **20 %** sur la remise
accordée, débloquée par le **code personnel** de la réceptionniste. On révise en deux temps :

1. **Première version de cet ADR** — deux seuils : jusqu'à 10 % au code personnel, 10–20 %
   avec un code manager en plus.
2. **Version courante** — le **code personnel disparaît**. La réceptionniste accorde
   **jusqu'à 10 %** du total des prestations **sans aucun code** ; **de 10 à 20 %**, elle
   saisit un **code manager** — un code temporaire que la direction lui communique au cas
   par cas. **20 % reste le plafond absolu.**

Le motif obligatoire après l'encaissement, l'ordre de calcul et la base (total des
prestations, produits exclus) sont inchangés.

Pourquoi retirer le code personnel : au comptoir il n'y a qu'un persona
([ADR 0001](0001-persona-unique-poste-de-comptoir.md)), pas de connexion, pas de gestion
de comptes — un « code personnel » à 4 caractères, non vérifié, ne traçait rien et n'était
qu'une friction sur un geste commercial quotidien. Ce qui compte est tracé autrement : le
**motif** obligatoire après l'encaissement, et le **code manager** dès que la remise passe
la barre des 10 %. Cette révision **supersède** la mention « code personnel » de
l'[ADR 0003](0003-modele-de-remise.md) §3 et sa conséquence sur `grantDiscount`.

## Conséquences

- `RemiseAccordee` : `grantedByCode` **retiré**. Reste `managerCode?` (présent seulement
  au-delà de 10 %, **non vérifié** — tout code à 4–6 chiffres passe) et `reason`.
- `grantDiscount(saleId, mode, value, managerCode?)` : plus de paramètre `code`. Refuse une
  valeur > 10 % sans code manager ; refuse > 20 % dans tous les cas.
- `RECEPTIONIST_MAX_PCT` (10) et `MAX_REMISE_PCT` (20) inchangés.
- `components/comptoir/discount-section.tsx` : le champ « code personnel » disparaît ; le
  champ « code manager » apparaît toujours dès que la valeur saisie (montant ou %) dépasse
  10 % des prestations et devient obligatoire.
- `components/comptoir/receipt-step.tsx` : le rappel du motif ne cite plus de code
  réceptionniste (il cite le code manager s'il y en a un).
- `CONTEXT.md` : entrées **Remise accordée** et **Code manager** réécrites.
- `docs/USERFLOW.md` : § Comptoir — plus de saisie de code sous 10 %.
- L'« authentification réelle du code réceptionniste » listée comme question ouverte dans
  `docs/USERFLOW.md` et l'[ADR 0003](0003-modele-de-remise.md) **tombe** : il n'y a plus de
  code réceptionniste.

## Alternative écartée

Garder le code personnel « pour la forme » en attendant un vrai backend d'authentification.
Écarté : il n'y a pas de projet de comptes nominatifs au comptoir (persona unique, ADR 0001),
donc rien à authentifier ; le champ n'aurait fait que ralentir chaque remise sans jamais
rien prouver.
