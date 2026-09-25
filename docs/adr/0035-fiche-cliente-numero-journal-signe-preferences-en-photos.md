---
status: accepted
---

# Fiche cliente : numéro cliente, journal interne signé, préférences en photos

## Contexte

Demande du 25/09 sur la fiche cliente : chaque cliente a un numéro ; un historique des notes
internes avec le nom de qui l'a écrite ; les infos d'abonnement remontées, les échanges en dernier ;
des icônes mieux dimensionnées ; et, à côté des préférences, les mêmes photos que le questionnaire
« Noter la cliente » qui suit l'encaissement.

## Décision

- **Numéro cliente** : `Cliente.number`, séquentiel (max + 1 à la création, jamais réattribué),
  affiché « N° 1042 » sous le nom. La recherche cliente le retrouve (« 1042 », « N° 1042 », « #1042 »).
  Distinct du `loyaltyCode`, qui reste un jeton d'identification (ADR 0013).
- **Journal interne** : `Cliente.internalNotes` (texte concaténé) est remplacé par
  `Cliente.notes: ClientNote[]` : `{ id, at, authorId, text, origin }`, le plus récent d'abord.
  `authorId` est une praticienne : par défaut le compte du poste (ADR 0026), modifiable à la saisie
  sur la fiche (« Par … »), puisque le poste est partagé. `origin` vaut « fiche » ou « encaissement ».
  La fiche réservation montre la dernière note, signée.
- **Préférences en photos** : les réponses de « Noter la cliente » sont conservées de façon
  structurée dans `Cliente.notationChoices` (id de question → ids d'option, cumulés, les plus récents
  d'abord). Elles ne sont plus écrites en texte dans la préférence onglerie. Chaque question porte son
  `domain` ; la fiche affiche les réponses en tuiles photo (`NotationPhoto`, partagée avec le
  questionnaire) sur la ligne du domaine, et « Modifier » permet de les cocher ou décocher.
  `notationSummary()` en donne la lecture texte pour les vues sans photo.
- **Mise en page** : le bandeau collant porte le numéro et une ligne « d'un coup d'œil »
  (abonnement + statut, pack + prestations restantes, points, visites, total dépensé). La colonne
  gauche contient Abonnements & Packs, Préférences et Notes internes ; la colonne droite
  Coordonnées, Carte de fidélité, puis Échanges en dernier. Icônes à 20 px dans des pastilles de
  44 px ; l'édition se fait par des boutons « Modifier » (45 px) plutôt que par des crayons de 16 px.

## Conséquences

- Les photos réelles des réponses restent à fournir (`public/notation/` + champ `photo` dans
  `lib/data/notation.ts`). D'ici là, une silhouette d'ongle les remplace.
- Une note rangée dans un domaine de préférence n'entre pas dans le journal et n'est pas signée.
