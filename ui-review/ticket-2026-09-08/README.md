# Bloc Ticket — passe UI (2026-09-08) · commit dc977f2

`avant/` = état d'origine · `apres/` = après changements.

| # | Élément | Problème | Fix |
|---|---|---|---|
| 01 | Tête du Ticket | Compteur « 1 ARTICLE » à cheval sur le filigramme de marque ; bannière verte « Prestation du rendez-vous ajoutée » permanente | Compteur collé au titre « Ticket · 1 article » ; bannière retirée |
| 02 | Carte cadeau (remises) | « Carte « BACO-ANNIV-20000 » · solde 20 000 F » + « Couvre −0 F · reste … » | En-tête de section = « Carte cadeau · 20 000 F » (le max, concis) ; caption « Couvre » supprimée ; « Il restera … » seulement si la carte a servi |
| 03 | Remise accordée | « Jusqu'à 10 % sans code · jusqu'à 20 % avec un code manager » sous les pastilles | Retiré (le champ code manager s'affiche seul au-delà de 10 %) ; mode Montant → « Maximum 18 200 F » |
| — | Boutons « Retirer » / « Tout cocher » | Liens texte soulignés, trop petits au tactile | Pastilles 44 px avec retour au tap |
| — | Champ montant carte cadeau | Champ 44 px étroit | Champ 56 px pleine largeur |
| — | +/− et corbeille du panier | Icônes 16 px, corbeille sans contour | Icônes 20 px, corbeille cerclée + retour au tap |

Verts : `tsc` · `lint` · `next build`.
