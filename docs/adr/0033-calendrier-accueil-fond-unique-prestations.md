---
status: accepted
---

# Calendrier Accueil : fond unique, prestations listées (remplace ADR 0022)

## Contexte

L'[ADR 0022](0022-calendrier-accueil-palette-multicolore.md) avait donné à chaque bloc de
`AccueilCalendar` une famille de couleur (5 teintes en rotation) avec une barre saturée de 3px en
haut. Retour utilisateur du 25/09 sur capture : les blocs doivent tous porter la même couleur
`#FFF1F1`, sans contour ; chaque bloc doit lister les prestations prévues ; les avatars des
praticiennes sont trop petits.

## Décision

- **Un seul fond pour tous les blocs** : token `--cal-card: #fff1f1`. Plus de barre de couleur,
  plus d'ombre au repos — le survol assombrit légèrement le fond. Les 10 tokens `--cal-*` de
  l'ADR 0022 sont supprimés. L'heure passe en `primary` (#886666), le jeton `+N` d'avatars aussi.
  L'ambre garde son seul sens de statut (« à encaisser »). La vue rentre donc dans la doctrine
  « un seul signal » : l'exception de l'ADR 0022 disparaît.
- **L'heure affiche le passage complet** (`10:00 – 11:00`), puisqu'un bloc peut désormais être
  plus haut que sa durée.
- **Les prestations sont listées** sous la composition : prestations actives (hors annulées),
  regroupées par prestation (« TISSAGE VERSATILE ×2 »), 4 lignes maximum puis « +N autres ». Le
  `Tooltip` liste tout.
- **Avatars 26px → 34px**, jusqu'à 4 visibles puis `+N`.
- **Un bloc n'est jamais rogné** : sa hauteur plancher est calculée depuis son contenu (nombre de
  prestations, présence d'avatars). Le lane-packing se fait sur l'emprise en pixels, pas sur les
  seules heures, pour qu'un bloc agrandi ne recouvre jamais le suivant. L'échelle passe à 90px par
  tranche de 30 min : une réservation d'1h à 2 prestations tient exactement dans sa durée, ce qui
  garde le nombre de colonnes au plus bas.

## Conséquences

- `app/globals.css` : `--cal-card` remplace le bloc `--cal-*`.
- `components/journee/accueil-calendar.tsx` : réécrit en conséquence (`serviceLines`,
  `contentHeight`, `pack` en pixels).
- `docs/CARTE-DES-ECRANS.md` amendé ; ADR 0022 marqué remplacé.
- Aucun changement de modèle de données.
