---
status: accepted
---

# Ventes : une vue de l'Accueil, pas une section ; le Récap des ventes est retiré

## Contexte

Demande du 15/10 : une page pour voir **toutes les transactions faites** — ventes de produits ou
de prestations — du jour ou d'une période choisie. L'écran `/recap-ventes` existait mais n'était
plus atteignable (son lien a disparu avec les compteurs de l'Accueil) et son filtre de période ne
filtrait rien (le mock ne tenait que les ventes de la session). L'utilisatrice veut éviter, autant
que possible, un 7ᵉ item de sidebar.

## Décision

- La section de l'Accueil se bascule entre **Rendez-vous** (défaut) et **Ventes**. La recherche,
  les dates **Du / Au** et le filtre de salon sont **partagés** entre les deux vues ; la bascule
  Liste / Calendrier n'existe qu'en vue Rendez-vous.
- Vue **Ventes** : une ligne par vente encaissée, clic → **Reçu** ; filtre **Tout / Prestations /
  Produits / Boissons** (une vente mixte sort sous chacun). En tête : **Encaissé**, nombre de ventes,
  panier moyen, **pourboires** à part, encaissé **par moyen de paiement**.
- **Acompte réglé au comptoir** : une ligne à part, marquée « Acompte », le jour où il est payé ;
  il compte dans l'Encaissé de ce jour. La vente qui solde la réservation ne compte que son reste.
  Un franc = une ligne, le jour où il entre en caisse.
- **Encaissé** = somme des parts de règlement (+ acomptes) ; les pourboires n'y entrent pas (ADR 0034),
  les prestations déjà payées, points et carte cadeau non plus (ils ne sont pas de l'argent reçu).
- **Hors liste** : factures payées (réglées hors comptoir, ADR 0042), cartes cadeaux (achat externe),
  ventes abandonnées.
- **Salon d'une vente** : celui de sa réservation d'origine, sinon celui du poste qui l'encaisse
  (`Sale.salonId`, posé à « Confirmer l'encaissement »).
- La ventilation **par praticienne** de l'ancien Récap n'est pas reprise : c'est un sujet de manager
  (ADR 0001), pas de caisse.
- `/recap-ventes` est **supprimé**. Le mock reçoit un historique de ventes encaissées sur les
  semaines passées, généré au chargement, pour que la période serve à quelque chose.

## Conséquences

- Pas de nouvel item de sidebar ; l'Accueil gagne une deuxième vue mais s'ouvre inchangé.
- Rendez-vous et Ventes se recoupent (un rendez-vous encaissé devient une vente) : la bascule les
  sépare nettement, la vue Ventes ne parle que d'argent entré.
- Si la revue de période devient un usage de manager (bilans, praticiennes), elle mérite sa propre
  section — cette décision serait alors à revoir.
