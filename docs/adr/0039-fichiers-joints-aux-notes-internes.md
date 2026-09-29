---
status: accepted
---

# Fichiers joints aux notes internes

## Contexte

Demande du 29/09 : pouvoir joindre un fichier à une note interne de la fiche cliente, sans
alourdir le design, et afficher les fichiers des notes déjà saisies. En salon, ce qu'on garde avec
une observation, ce sont des **photos** (résultat, modèle apporté, réaction cutanée) et des
**documents** (ordonnance, test d'allergie, décharge signée).

## Décision

- **Saisie** : un bouton texte discret **« Joindre »** (trombone) sur la ligne de l'auteur, entre
  « Par … » et « Ajouter » — pas de zone de dépôt permanente. Glisser-déposer sur la saisie
  marche aussi (contour rose pendant le survol). Plusieurs fichiers d'un coup.
- **Acceptés** : photos et PDF, 10 Mo max par fichier ; un refus est nommé sous la saisie
  (« x.docx : seules les photos et les PDF se joignent. »).
- Les fichiers en attente s'affichent **sous le texte, comme ils apparaîtront dans la note**, avec
  un × pour retirer. Une note peut n'être que des fichiers (« Ajouter » s'active dès qu'il y a un
  texte **ou** un fichier).
- **Dans le journal** : sous le texte de la note, les photos en **vignettes de 64 px** (toucher →
  visionneuse plein écran, ← → entre les photos de la note, Échap / clic sur le fond ferment),
  puis les documents en **pastilles** (icône, nom, « PDF · 245 Ko ») qui s'ouvrent dans un onglet.
  Pas de compteur ni d'en-tête de section : les fichiers se lisent comme une suite de la note.
- Modèle : `ClientNote.attachments?: NoteAttachment[]` (`name`, `kind` image | document, `size`,
  `url`). Sans backend, un fichier ajouté vit le temps de la session (`URL.createObjectURL`) ; ceux
  du seed pointent vers `public/`.

Hors périmètre : joindre un fichier depuis « Noter la cliente » (Comptoir).
