---
status: accepted
---

# Accueil : Scanner (pointage de l'équipe) + Alertes ; Cartes cadeaux devient une section

## Contexte

Demande du 02/10 : l'Accueil doit porter un bouton pour **scanner l'arrivée et le départ des
employées** (badge scanné → le nom s'affiche → « Arrivée » ou « Départ »), en **gros bloc carré
en haut**, avec **les alertes à côté**. Deux alertes pour commencer : une **carte cadeau à
imprimer** (une carte réduite, à la hauteur du bloc) et un **rendez-vous imminent** (dans 15 min).
En démo, l'Accueil s'ouvre sans alerte (une ligne grise le dit) et elles arrivent 5 s après. La
section « Cartes cadeaux » de l'Accueil disparaît — la page `/cartes-cadeaux` reste, il faut un
autre chemin pour y aller.

## Décision

- **Rangée de tête** de l'Accueil, juste sous le titre : le bloc **Scanner** (carré de 216 px,
  mise en évidence rosée `highlight-rose`) puis les **Alertes**, à sa hauteur exacte.
- **Pointage** : toucher Scanner ouvre un dialogue caméra (« Présentez votre badge ») ; repli
  « Badge oublié ? Touchez votre nom » = l'équipe attendue à ce poste aujourd'hui. Une fois
  identifiée : photo, nom, rôle, horaire du jour, dernier pointage du jour, et deux grands boutons
  **Arrivée** / **Départ**. Le geste attendu (arrivée si rien pointé aujourd'hui, départ si elle est
  arrivée) est mis en avant, **les deux restent disponibles** — c'est elle qui sait. « Ce n'est pas
  moi » revient au scan. Confirmation par toast ; le bloc affiche ensuite le dernier pointage
  (« Gnagna · arrivée 15:47 »). Modèle : `Pointage { staffId, kind: arrivee | depart, at }`,
  slice `pointages` + `recordPointage` dans le store, session seulement. Toute l'équipe
  (`Praticienne`, ménage compris) pointe.
- **Prototype** : aucun badge ne porte de QR lisible ; sans détection réelle au bout de 2,2 s, la
  caméra « reconnaît » la première personne du jour pas encore arrivée (même parti que le scan de
  carte cadeau).
- **Alertes** — ce qui demande la réceptionniste maintenant, une carte par alerte (312 × 216 px) :
  - **Rendez-vous imminent** : réservation du jour, pas encore encaissée, qui commence dans
    ≤ 30 min. « Dans 13 min · à 16:00 » (décompte à la minute), payeuse, prestation(s), avatars des
    praticiennes. Toucher → fiche réservation.
  - **Carte cadeau à imprimer** : la plus ancienne commande « à imprimer » — destinataire, contenu,
    retrait/livraison + code, bouton **Imprimer** direct (même impression que la tuile de la file,
    `useGiftCardPrint`) et « + N autres » vers `/cartes-cadeaux`. Imprimée, la suivante prend sa place.
  - Aucune alerte : un cadre pointillé à la même hauteur avec « Aucune alerte pour le moment » —
    la place reste tenue, rien ne saute quand une alerte arrive. Les alertes entrent en glissant de
    la droite, en cascade (seul mouvement de l'écran ; aucun sous `prefers-reduced-motion`).
  - **Démo** : vide à l'ouverture, alertes au bout de 5 s ; si aucune réservation du seed n'est
    imminente à ce moment-là, une réservation à +15 min est injectée (`receiveReservation`, déjà
    vue — elle ne nourrit pas « Réservations reçues »). Une fois arrivées, elles restent jusqu'au
    rechargement.
- **Cartes cadeaux devient un item de sidebar** (entre Messages et Catalogue, icône cadeau), avec
  le point taupe quand une carte attend l'impression. La page perd son lien « Accueil ». Raison :
  la file n'est pas qu'une liste de choses à faire — on y **cherche** une carte (scan, nom, code),
  y compris déjà remise, quand une cliente se présente avec. Un travail récurrent et retrouvable a
  besoin d'une adresse fixe, pas seulement d'un raccourci qui n'existe que lorsqu'il y a quelque
  chose à imprimer. L'alerte reste le chemin contextuel ; la sidebar, le chemin permanent.

## Conséquences

- `AccueilGiftCards` est supprimé ; l'ADR 0012 (« drill-in de l'Accueil, pas un item de
  sidebar ») est amendé sur ce point.
- La sidebar passe à 6 items.
- Pas encore de lecture des pointages ailleurs (Planning, récap) — à décider le jour où on en a besoin.
