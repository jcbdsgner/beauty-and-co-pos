---
status: accepted — remplace ADR 0027 ; amende ADR 0015 et ADR 0017 (point 1)
---

# Le parcours de prise de rendez-vous b&co, recopié au comptoir

L'ADR 0027 avait donné à la réceptionniste un formulaire **minimal** de création de réservation,
volontairement sans aucun mécanisme du parcours en ligne. À l'usage, ce formulaire est un second
parcours à apprendre, qui ne ressemble pas à ce que la cliente connaît et qui laisse de côté ce qui
fait vendre (packs, Bar Beauty, Boutique). On fait l'inverse : **le parcours du site de rendez-vous
b&co (`b&co/components/booking`), recopié tel quel** — mêmes étapes, mêmes écrans, **même style
visuel** — dans un grand dialogue du point de vente.

## Décision

- **Un seul geste pour créer et modifier.** « Créer un rendez-vous » (Accueil) et « Modifier »
  (fiche réservation, Comptoir) ouvrent ce même parcours. Il remplace à la fois le formulaire de
  l'ADR 0027 et le dialogue d'ajustement actuel. En modification, il s'ouvre pré-rempli avec la
  réservation existante ; retirer une prestation revient à **annuler ce rendez-vous** (motif
  facultatif, ADR 0009) ; un acompte déjà réglé n'est pas redemandé.
- **Séquence :** Nombre de personnes → **Clientes** → Prestations → Créneau → Confirmation. La
  seule étape qui diffère du site est « Clientes », **placée en premier** : au lieu de se connecter,
  la réceptionniste cherche la payeuse parmi les clientes (n° client, nom, email, téléphone), puis
  éventuellement les autres personnes de la réservation ; un prénom suffit pour un enfant ou une
  bénéficiaire sans fiche ; une cliente introuvable peut être créée sur place. L'étape
  « Informations » du site disparaît (les coordonnées sont dans la fiche). Connaître la payeuse dès
  le départ permet de garder la fenêtre « Déjà payé » (packs, abonnements) à sa place d'origine.
- **Praticienne attribuée d'office, modifiable** — règle valable dans tout le point de vente : la
  moins chargée ce jour-là parmi celles libres sur l'horaire (deux, du même salon, pour une
  prestation réalisable à 2) ; le choix manuel ne propose que les praticiennes libres. Le **salon**
  est pré-rempli avec le salon courant et reste modifiable.
- **Confirmation** identique au site (suggestion de pack, Bar Beauty, aperçu Boutique), sauf la case
  des conditions générales, remplacée par la mention « conditions communiquées à la cliente ».
- **Fin du parcours :** « Terminé » → paiement de l'**acompte**, obligatoire, par les moyens du site
  **plus les espèces** ; « Encaisser maintenant » → la station **Règlement** du Comptoir (ADR 0031),
  pour ne jamais avoir deux caisses.
- **Style visuel du site b&co, borné à ce dialogue** — exception assumée au thème du point de vente
  (même logique que l'ADR 0022). Le dialogue est très grand sans être plein écran ; son contenu est
  réduit proportionnellement pour y tenir, ce qui passe sous les cibles de 56 px du reste de l'app.

## Ce que ça change dans les ADR précédents

- **ADR 0027** remplacé en entier.
- **ADR 0015** : l'acompte n'est plus seulement reflété. Il peut être **encaissé au comptoir** à la
  création ; il compte alors dans les ventes du jour où il est payé et se déduit toujours à
  l'encaissement de la réservation (ce n'est toujours pas une Remise).
- **ADR 0017, point 1** : un **Pack peut être vendu**, mais uniquement par la suggestion de pack de
  ce parcours. Ses prestations entrent dans la réservation au prix du pack, se règlent à
  l'encaissement, et le pack n'appartient à la cliente qu'à « Confirmer l'encaissement ». Les
  abonnements ne se souscrivent toujours pas au comptoir. Le décompte (point 2) reste à
  l'encaissement : la fenêtre « Déjà payé » du parcours ne fait que présélectionner.

## Alternatives écartées

- Garder le formulaire minimal (statu quo ADR 0027) : deux parcours différents pour le même geste.
- Reprendre la structure du site mais au thème du point de vente : écarté, le parcours doit être
  celui que la cliente reconnaît, à l'identique.
- Retirer la suggestion de pack pour préserver l'ADR 0017 : écarté, le parcours doit rester identique.

## Conséquences

- `CONTEXT.md` : **Réservation**, **Acompte**, **Rendez-vous**, **Créer un rendez-vous**,
  **Praticienne**, **Pack**, **Accueil**, **Planning** amendés.
- L'étape s'appelle « Créneau » dans ce dialogue (copie du site) ; ailleurs, le vocabulaire du
  glossaire (Rendez-vous, horaire disponible) reste inchangé.
- `docs/USERFLOW.md` et `docs/CARTE-DES-ECRANS.md` à amender à l'implémentation.
