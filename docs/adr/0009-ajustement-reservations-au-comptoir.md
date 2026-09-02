# Ajustement des réservations au comptoir (création toujours hors app)

L'[ADR 0006](0006-reservation-rendez-vous-atomiques.md) avait retiré du point de vente toute
création **et** édition de rendez-vous : la prise de RDV vit sur la plateforme en ligne, la
réceptionniste ne pouvait qu'**Annuler** et **Encaisser**. À l'usage, le comptoir a besoin
d'**ajuster** les réservations qui arrivent — la cliente change d'avis sur une prestation,
veut en ajouter une, arrive en retard, sa praticienne change. On rouvre donc l'**édition**,
pas la **création**.

## Décision

- Depuis la **fiche réservation** (identique au Planning et à l'Accueil), la réceptionniste
  peut : changer la praticienne (et la seconde) d'un rendez-vous, changer la prestation,
  **ajouter / retirer** un rendez-vous à la réservation, changer le·la bénéficiaire,
  **reprogrammer** un créneau, **annuler** avec un motif texte libre facultatif (visible dans
  l'historique des annulés).
- **Reprogrammer** : n'importe quelle date / heure. Seul garde-fou — une praticienne ne peut
  pas avoir deux rendez-vous qui se chevauchent : le cas est **bloqué** (vaut aussi pour la
  réassignation de praticienne).
- **Aucune création de réservation dans l'app.** Un bouton « Créer un rendez-vous » ouvre la
  plateforme de réservation externe dans un onglet. Deux points d'entrée : la fiche réservation
  (pied du dialogue d'édition) et l'**en-tête de l'Accueil** — à portée de main quand la
  réceptionniste est au téléphone avec une cliente qui veut réserver. Même URL
  (`BOOKING_URL`, `lib/data/planning.ts`), même libellé.
- Les ajustements ne sont **pas resynchronisés** vers la plateforme externe — cohérent avec
  `staffOverrides` (ADR 0006) : le mock n'a pas de lien retour, la divergence est assumée.
- Le modèle d'état du rendez-vous est **inchangé** : toujours `actif | annule`, jamais
  « en attente / confirmé ».

## Conséquences

- Nouvelles actions store : `rescheduleRendezVous`, `updateRendezVous` (service / staff /
  bénéficiaire), `addRendezVous`, `removeRendezVous` ; `cancelAppointment` gagne un `reason?`.
- `RendezVous` gagne `cancelReason?: string`.
- Nouveau dialog d'édition ; `components/planning/appointment-detail-sheet.tsx` porte les gestes.
- `CONTEXT.md` : entrées **Rendez-vous** et **Planning** réécrites, nouvelle entrée **Reprogrammer**.
- ADR 0006 : « Seuls gestes : Annuler et Encaisser » et « plus de Décaler / modifier » sont
  amendés par le présent ADR. Sa suppression du **formulaire de création** reste en vigueur.
- `docs/USERFLOW.md` : § Planning et modèle conceptuel à amender à l'implémentation.

## Alternative écartée

Rapatrier aussi la création (constructeur multi-prestations dans le POS). Écarté pour les
raisons de l'ADR 0006 : le parcours de booking (dispos, acompte) est riche et vit déjà en
ligne ; le dupliquer serait de la surface morte.
