---
status: accepted
---

# Module Devis : devis → facture → paiement, la facture payée devient du prépayé

Une cliente veut savoir combien lui reviendront des prestations ou des produits, sans forcément venir au salon. Jusqu'ici l'app n'avait rien d'autre que le reçu du comptoir. On ajoute une section **Devis** (7e entrée de la sidebar) qui porte tout le parcours : composer le devis, l'envoyer, suivre les retours, réémettre, facturer, encaisser. Le Comptoir n'en voit que le résultat, du **prépayé** qu'il décompte comme un Pack (ADR 0017). Démo simulée : rien n'est persisté, les envois et les paiements sont joués dans l'app.

## Décision

- **Contenu** : prestations et produits du Menu, rien d'autre (ni boissons, ni packs / forfaits / cartes cadeaux, vendus hors app). Remises accordées permises, mêmes règles qu'au panier (≤ 20 % des prestations, code manager au-delà de 10 %, ADR 0008/0031) ; le motif se saisit tout de suite — il n'y a pas de cliente en face à ne pas ralentir. **Aucun avantage personnel** : le prix du devis est celui qu'elle paiera.
- **Toujours une fiche cliente**. Si elle n'existe pas, on la crée avec nom + téléphone + email : une **Fiche à compléter** (anniversaire, origine, pays demandés à sa première venue). Pas d'objet « prospect » séparé : un contact est une cliente.
- **Société facturée** facultative (raison sociale, adresse, NINEA, RCCM), portée par la fiche. L'émettrice est toujours Beauty and Co (NINEA, RCCM, adresse du siège — à ajouter à `Company`, valeurs fictives).
- **Envoi** par WhatsApp ou email = un Message de la réceptionniste dans le **fil** de la cliente (ADR 0011), lien vers le document. L'envoi **prend la main** sur le fil : relances en pause, les retours arrivent à un humain.
- **Statuts du devis** : brouillon → envoyé → facturé ; refusé, expiré (30 jours, prix figés jusque-là), remplacé. Un devis envoyé ne se modifie pas : « Modifier » le **réémet** en v2 (même numéro, suffixe de version), la v1 passe remplacée.
- **Pas de statut « accepté »** : la cliente dit oui dans son fil ou au téléphone, la réceptionniste **facture** — c'est le geste qui enregistre l'accord.
- **Facture** : numéro unique (`FAC-AAAA-NNNN`), jamais modifiée. **À payer → payée**, en une fois : bouton **Payer** sous la facture côté cliente (Wave, Orange Money, carte — simulé), ou « Enregistrer le paiement » au salon (un moyen). Une facture à payer s'annule par un **Avoir** (code manager + motif) ; une facture payée ne se rembourse pas dans l'app. Montant unique TTC, pas de TVA.
- **Facture payée = prépayé.** Ses prestations deviennent des **Prestations déjà payées** : cochées d'office quand on encaisse une réservation qui les contient, comme un Pack (n'expirent pas, couvrent aussi une invitée, décompte définitif à « Confirmer l'encaissement »). Ses produits sont **à remettre** : marqués « remis » depuis le module, comme une Commande de carte cadeau (ADR 0012). La facture ne crée pas de réservation ; la cliente réserve comme d'habitude.
- **Chiffre d'affaires et points fidélité** comptés **le jour du paiement**, comme l'Acompte (ADR 0015). La ligne couverte plus tard au comptoir est à 0 F et ne rapporte rien de plus.
- **Une facture vient toujours d'un devis.** Facturer une vente déjà encaissée au comptoir est hors périmètre — le reçu y suffit.

## Considered Options

- **Payer sur le devis, facture acquittée émise au paiement** — évitait toute facture impayée et tout avoir. Écarté : l'ordre usuel (accord → facture → paiement) est celui que la cliente et sa société attendent ; une facture à payer peut être remise à un service comptable.
- **Un objet Contact distinct de la Cliente** — écarté : deux fiches pour une même personne, un doublon à fusionner à sa première venue. La fiche à compléter suffit.
- **Faire passer le devis par le panier du Comptoir** — écarté : le Comptoir sert la cliente en face ; le devis vit sur des jours (envoi, retours, versions) et mérite sa section.

## Conséquences

- La création d'une fiche cliente n'exige plus anniversaire / origine / pays dans tous les cas : tout ce qui les lit (anniversaires de Messages, fiche, filtres) doit supporter leur absence.
- `SaleCoverage.source` gagne une troisième origine (la facture) à côté de `pack` et `abonnement`.
- Le Récap des ventes porte les paiements de facture comme des lignes à part, le jour où ils arrivent.
- Une page côté cliente (hors shell) montre devis et facture, bouton Payer sous la facture.
- Aucune mention de TVA sur les documents (décision 2026-10-08). Numérotation réelle et envois réels attendent le passage de toute l'app en production.

## Révision 2026-10-08 — pas de section : le devis vit dans Messages

Prototypée, la section **Devis** reprenait la grammaire maître-détail de Messages : un doublon. Presque tout le parcours se joue déjà dans le **fil** de la cliente — l'envoi, ses questions, son « oui », le paiement qui revient. On retire la section (et l'entrée de sidebar) :

- **Le devis est une pièce vivante du fil** : envoyé, il apparaît dans la conversation comme un document avec son statut et l'action du moment (Facturer, Enregistrer le paiement…). Ses versions et sa facture s'y succèdent.
- **L'inbox de Messages** gagne en tête une section **« Devis en cours »** — devis sans réponse, factures à payer — comme « Anniversaires souhaités ».
- **Nouveau devis** s'ouvre depuis un fil, l'en-tête de Messages ou la fiche cliente, dans une grande fenêtre de composition.
- **Au Comptoir**, la cliente identifiée amène d'elle-même ses produits à remettre et ses prestations prépayées — plus de file « à remettre » à surveiller.
- **La fiche cliente** garde l'historique « Devis et factures ».

Écartés : un module en file de tâches façon Cartes cadeaux (ne se justifie qu'à fort volume) ; le devis porté par la seule fiche cliente, suivi par les Alertes (aucune vue d'ensemble).

## Révision 2026-10-08 — le document est un PDF, le lien de paiement hors périmètre

Devis et facture partent dans le fil comme un **PDF** (téléchargeable depuis la pièce jointe). Le PDF de facture porte un lien de paiement, mais **son fonctionnement ne relève pas de ce projet** : pas de page côté cliente, pas de paiement simulé par lien. La réceptionniste **enregistre le paiement reçu** (Wave, Orange Money, carte, espèces) depuis le bandeau du dossier — `Facture.payment` ne garde que le moyen.

