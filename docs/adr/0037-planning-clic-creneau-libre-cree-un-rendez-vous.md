---
status: accepted
---

# Planning : un clic sur une demi-heure libre crée un rendez-vous

## Contexte

Demande du 29/09 : « sur la page planning, permettre de cliquer directement sur un créneau pour
rajouter un rendez-vous à cette heure précise ». Jusque-là, le Planning n'en créait **aucun**
(ADR 0006/0009, puis ADR 0032 qui gardait « Créer un rendez-vous » sur l'Accueil seul) ; le
fast-follow « créer en cliquant une case vide » était noté hors périmètre (USERFLOW v2.7).

Même demande : les âges accolés aux prénoms d'enfants (« Salématou (7 ans) ») disparaissent
partout — seed, exemples de saisie, indice « 4 à 12 ans » du Mini & Co.

## Décision

- Vue **Jour** du Planning : au survol d'une demi-heure **libre**, un bloc en pointillés
  « + 17:30 » ; un clic ouvre **Créer un rendez-vous** (le parcours ADR 0032, inchangé) pré-réglé
  sur ce **jour**, cette **heure**, le **salon** de la plage cliquée et cette **praticienne**.
- « Libre » = dans une plage de la praticienne, dans le salon regardé (tous en « Tous les
  salons »), ni passée, ni déjà prise, ni hors horaire / trajet / autre salon / « Fermé », et pas
  une praticienne marquée absente.
- La praticienne cliquée est posée **d'office si elle est libre** pour les prestations choisies
  (`planAt(…, preferredStaffId)`), sinon la règle d'ADR 0032 reprend (la moins chargée du jour) ;
  elle reste modifiable. L'heure n'est présélectionnée que si tout le panier y tient.
- Vue **Semaine** inchangée : un clic sur un jour ouvre ce jour.

## Conséquences

- Le Planning n'est plus en lecture seule côté création ; « Créer un rendez-vous » garde aussi son
  bouton sur l'Accueil et le Comptoir.
- Un bénéficiaire enfant se note par son prénom seul — plus d'âge dans le nom libre.
