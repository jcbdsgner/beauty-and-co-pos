# Planning : filtre de salon (Almadies / Sea Plaza / Tous les salons)

Le Planning affichait l'équipe entière sans distinguer où chacune travaille, alors que `SALONS` (Almadies, Sea Plaza — `lib/data/entreprises.ts`) existe déjà comme donnée mais n'était utilisé nulle part depuis qu'ADR 0001 a retiré toute configuration d'entreprises/salons de l'app. Une praticienne n'est jamais aux deux salons en même temps ; regarder les deux programmes mélangés n'aide personne au comptoir.

## Décision

- `Praticienne` porte un `salonId` fixe (une praticienne = un salon, jamais les deux). Les paires « réalisable à 2 » existantes (Bineta/Fatou, Michelle/Gnagna) sont donc au même salon par construction.
- Le Planning gagne un filtre de lecture à trois positions (Tous les salons — défaut, Almadies, Sea Plaza) dans l'en-tête, appliqué aux deux vues (Jour, Semaine). Il ne fait que réduire la liste de praticiennes affichées ; les couleurs d'accent restent calculées sur l'équipe planifiable complète pour ne pas changer de teinte selon le filtre actif.
- **Ce n'est pas une réouverture d'ADR 0001** : aucune écran de configuration n'apparaît, on ne crée/modifie ni salon ni rattachement depuis l'app — seulement un filtre sur une donnée déjà présente.

## Alternative écartée

Rattacher une praticienne aux deux salons avec un horaire par site (comme `weeklySchedule` mais dédoublé par salon). Écarté pour ce prototype : aucune donnée de démonstration ne l'exige, et ça complique le modèle (deux horaires à tenir cohérents) pour un besoin qu'on peut trancher plus simplement — une praticienne, un salon.
