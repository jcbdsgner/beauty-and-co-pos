---
status: accepted — remplace ADR 0032
---

# Créer / modifier un rendez-vous : la fenêtre unique du back-office

## Contexte

Demande du 02/10 : « pour modifier un rdv, ça doit être exactement le même modal que celui du
back-office ; pour créer un rdv, exactement le même système avec juste en plus la possibilité de
choisir la cliente en haut ». Le back-office venait de fondre « Nouveau rendez-vous » et
« Reprogrammer le rendez-vous » en une seule fenêtre (`rendezvous/RdvDialog`).

## Décision

- Le parcours b&co recopié (ADR 0032 : grand cadre mis à l'échelle, étapes Clientes → Prestations
  → Créneau → Confirmation, acompte, packs) est **retiré**. `components/prise-rdv/` et les données
  du site sont supprimés ; seul `lib/prise-rdv/planifier.ts` reste.
- `components/planning/rdv-dialog.tsx` recopie la fenêtre du back-office, texte et mise en page
  compris : date, salon (adresse, ouverture du jour), horaires réellement libres en Matin /
  Après-midi / Soir, prestations repliables par personne (onglets, « Ajouter une personne »,
  recherche, liste à cocher). Création = la même fenêtre + **Cliente** en tête (recherche nom /
  téléphone / n°, « Créer une fiche » → `NewClientDialog`).
- Praticiennes posées d'office (`planAt`) ; à la reprogrammation l'actuelle — et la 2ᵉ d'une
  prestation « à deux » — est gardée si elle reste libre. Prestation retirée ⇒ rendez-vous annulé
  (`saveParcoursReservation`, inchangé).
- Head spa, soins visage, épilation, spa : Almadies seulement (`serviceOfferedAt`), dit en clair.

## Conséquences

Plus d'acompte, de note, de questions ni de packs saisis à la prise de rendez-vous au comptoir ;
ce qu'une réservation porte déjà (acompte, extras, note) est conservé à la reprogrammation. Pas
d'incompatibilités entre prestations : le Menu du point de vente n'en décrit pas.
