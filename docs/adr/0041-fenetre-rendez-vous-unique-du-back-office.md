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
- **Rév. 05/10 — « 2 praticiennes » par prestation.** Chaque prestation choisie « réalisable à 2 »
  (`twoPractitionersEligible`, 76/106, verbatim b&co) porte un interrupteur « 2 praticiennes »,
  éteint par défaut : durée divisée par deux, et seuls les horaires où deux praticiennes du métier
  sont libres ensemble restent proposés. Choix ligne par ligne (le site b&co, lui, a un interrupteur
  global côté cliente). Le Menu de la fenêtre marque les éligibles « à 2 ». À la reprogrammation,
  une ligne déjà à deux s'ouvre allumée ; passée à deux, elle garde sa praticienne et en reçoit une 2ᵉ.
- Head spa, soins visage, épilation, spa : Almadies seulement (`serviceOfferedAt`), dit en clair.

## Conséquences

Plus d'acompte, de note, de questions ni de packs saisis à la prise de rendez-vous au comptoir ;
ce qu'une réservation porte déjà (acompte, extras, note) est conservé à la reprogrammation. Pas
d'incompatibilités entre prestations : le Menu du point de vente n'en décrit pas.
