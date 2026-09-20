# Création de réservation au comptoir, sans le parcours b&co

ADR 0006 puis 0009 avaient délibérément exclu la création : le parcours de réservation en ligne
(dispos, acompte, recommandations, paiement) est riche, le dupliquer dans le point de vente serait
de la surface morte. Mais ce qu'elles écartaient, c'est de reconstruire *ce* parcours-là — pas de
répondre au besoin, resté sans solution, d'une réceptionniste au téléphone avec une cliente qui
préfère réserver directement au salon plutôt que d'aller en ligne (20-30 % des passages au comptoir
ne sont déjà liés à aucune réservation en ligne). On construit donc une création **minimale**,
pensée pour la réceptionniste et non pour la cliente en self-service.

## Décision

- Nouvelle action store `createReservation(payerClientId, lines, { date, source: "comptoir" })` —
  chaque ligne = bénéficiaire + prestation + praticienne + horaire ; même garde-fou de chevauchement
  que `addRendezVous`/`rescheduleRendezVous` (`findStaffClash`), vérifié ligne par ligne.
- Nouveau calcul `freeSlotsForStaff` — les horaires réellement libres d'une praticienne un jour
  donné (son horaire hebdomadaire moins ses rendez-vous actifs déjà posés), présentés comme une
  grille de choix. Remplace l'`<input type="time">` sans retour visuel d'`AddRvForm`, dont l'erreur
  de chevauchement n'apparaissait qu'après coup.
- Le bouton **« Créer un rendez-vous »** (en-tête Accueil, pied du dialogue d'édition d'une
  réservation) ouvre ce formulaire in-app au lieu de `BOOKING_URL`.
- Aucun mécanisme du parcours b&co self-service n'est repris : pas de plafond de participants, pas
  de suggestion de prestation complémentaire, pas de Pack/Bar Beauty/Boutique, pas d'étape de
  paiement (le comptoir a le sien), pas de compte cliente. La payeuse se cherche comme au Comptoir
  (`ClientSearchField`) ; on ne saisit jamais ses coordonnées.
- Vocabulaire : on ne réutilise pas « Créneau » (réservé au vocabulaire b&co côté client) — l'UI
  parle d'« horaire disponible ».
- Une fois créée, la réservation suit le chemin existant : `openNewTab({ reservationId })` pour
  encaisser tout de suite (walk-in) ou plus tard depuis l'Accueil — aucun nouveau chemin côté vente.

## Alternative écartée

Garder le renvoi systématique vers la plateforme externe (statu quo ADR 0006/0009). Écarté : la
raison d'alors — « dupliquer un parcours riche serait de la surface morte » — ne s'applique pas à un
formulaire minimal sans recommandation ni paiement ; c'est un geste différent (réserver pour
quelqu'un d'autre, par téléphone), pas une copie du parcours cliente.

## Conséquences

- `CONTEXT.md` : **Réservation**, **Rendez-vous**, **Accueil**, **Planning** amendés ; nouvelle
  entrée **Créer un rendez-vous**.
- `docs/USERFLOW.md` et `docs/CARTE-DES-ECRANS.md` à amender à l'implémentation.
- `BOOKING_URL` (`lib/data/planning.ts`) n'est plus référencé depuis un bouton de l'app — à garder
  (au cas où) ou retirer au moment de l'implémentation.
- Clic sur une case vide du Planning pour créer un rendez-vous : hors périmètre de cette décision,
  seul le point d'entrée Accueil est couvert.
