---
status: accepted
---

# Horaires 10h–20h, praticiennes sur deux salons

## Contexte

Demande du 27/09 :

- tout se passe **de 10h à 20h** — horaires de l'équipe comme rendez-vous ; les grilles vont
  jusqu'à 22h, la tranche **20h–22h grisée** ;
- **Almadies est fermé le lundi** ;
- une praticienne peut **commencer une journée à Sea Plaza et la finir aux Almadies**, et dans la
  même semaine travailler certains jours à Sea Plaza, d'autres aux Almadies.

ADR 0028 avait tranché « une praticienne, un salon » (`Praticienne.salonId`) et en déduisait le
salon de chaque rendez-vous. Ce modèle ne tient plus.

## Décision

**Modèle**

- `WeeklySchedule` : chaque jour tient **une ou deux plages** `Shift { start, end, salonId }`, dans
  l'ordre. Deux plages dans deux salons = journée coupée ; le battement entre les deux est le
  **trajet** (aucun rendez-vous possible). `Praticienne.salonId` disparaît. Ses salons « de
  rattachement » se lisent dans son horaire (`salonsOf`).
- `RendezVous.salonId` : le salon est **porté par le rendez-vous**, jamais déduit de la
  praticienne. Il est porté par le rendez-vous et non par la réservation, parce que le seed contient
  des réservations dont les lignes sont dans les deux salons. La prise de rendez-vous, elle, pose
  toujours un seul salon pour toute la réservation (celui de l'étape Créneau).
- Heures : `lib/data/time.ts` — `SALON_OPENING` 10h, `SALON_CLOSING` 20h, `GRID_END` 22h. Un
  garde-fou dans `praticiennes.ts` refuse toute plage hors 10h–20h.
- Une plage dans un salon fermé ce jour-là ne compte pas (`shiftsFor`).
- Une praticienne n'est proposée pour une prestation que si **une de ses plages dans ce salon
  couvre tout le créneau** (`coversInterval`) et qu'elle n'est prise **nulle part**, dans aucun des
  deux salons. Tout rendez-vous finit au plus tard à 20h. C'est la même règle dans la prise de
  rendez-vous, le remplacement d'une absente et le recalage du seed.
- Démo : Adja (Almadies) renforce Sea Plaza le lundi ; Henry commence le mardi à Sea Plaza
  (10h–14h) et finit aux Almadies (15h–19h). Le seed des rendez-vous est vérifié **identique** avant
  et après, sur les 7 jours de la semaine.

**Écrans**

- **Planning · Jour** : grille fixe 10h → 22h, tranche 20h–22h un cran plus grise que le hors
  horaire, « Fermé » écrit une seule fois dans le rail. Salon regardé : ne montre que ses rendez-vous,
  et les praticiennes qui y ont une plage ou un rendez-vous ce jour-là (plus celles en repos qui y
  travaillent d'habitude). La plage passée dans l'autre salon est **hachurée et nommée** (« Aux
  Almadies »), le battement est « Trajet ». L'en-tête montre ses heures ici, avec une icône ⇆ si elle
  change de salon. « Tous les salons » : l'en-tête a une 3ᵉ ligne avec le salon (« Sea Plaza »). Pour
  une journée coupée, cette ligne donne l'amplitude, puis « ⇆ Almadies » (le salon où elle finit ;
  « Sea Plaza → Almadies » ne tient pas dans la colonne). Le battement dit « Trajet · vers Almadies »,
  et le filet à 20h marque la fermeture.
- **Salon fermé ce jour-là** (Almadies le lundi, vue Jour) : un écran dédié au lieu d'une grille
  vide — « Almadies est fermé le lundi », celles de son équipe qui travaillent à Sea Plaza ce jour-là
  (avatars), bouton « Voir Sea Plaza ».
- **Planning · Semaine** : salon regardé → colonne du jour fermé grisée « Fermé » ; un jour passé
  dans l'autre salon est une cellule hachurée « Aux Almadies » ; une journée coupée affiche ses heures
  ici + ⇆ l'autre salon. « Tous les salons » → sous l'horaire, le salon du jour, seulement pour les
  praticiennes qui changent de salon (les autres lignes restent légères).
- **Accueil** : calendrier 10h → 22h, même tranche grisée « Fermé » ; filtre salon par rendez-vous ;
  état vide « Almadies est fermé le lundi » quand le jour affiché tombe sur une fermeture. Le bandeau
  « Réservations reçues » lit le salon sur les rendez-vous.
- **Créer un rendez-vous** (étape Créneau) : un lieu fermé le jour choisi reste visible mais n'est
  pas choisissable (« Fermé le lundi »), avec un message dédié s'il était déjà sélectionné. Horaires
  proposés jusqu'à ce que la prestation finisse à 20h.

## Alternatives écartées

- **Salon sur la réservation** : plus simple à lire, mais aurait déplacé des rendez-vous du seed qui
  mélangent les salons. Le rendez-vous reste le bon grain : c'est lui qui occupe une praticienne à un
  endroit.
- **Montrer au salon regardé une praticienne présente toute la journée dans l'autre salon** : ça
  informe, mais ça encombre la grille avec des colonnes entièrement hachurées. Elle apparaît dans
  l'autre salon et dans « Tous les salons », et la vue Semaine du salon la montre « Aux Almadies ».
- **Temps de trajet calculé** : le battement entre deux plages suffit, et c'est l'horaire qui le fixe.

Remplace la règle « une praticienne, un salon » d'ADR 0028. Le filtre de lecture de cet ADR est
conservé.
