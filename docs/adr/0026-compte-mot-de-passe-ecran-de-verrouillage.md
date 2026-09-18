# Compte : mot de passe remplace le PIN, écran de verrouillage à la déconnexion, fin du changement de compte

La page Compte ne portait que des écrans hérités d'un modèle multi-comptes jamais pleinement assumé : Profil (lecture seule + « Changer d'utilisateur ») et Sécurité (changer son PIN à 4 chiffres, le même PIN que celui saisi dans `SwitchUserDialog` pour prendre le poste). On la refait avec 3 gestes personnels seulement — changer sa photo, changer son mot de passe, se déconnecter.

## Décision

- **Le PIN disparaît partout**, remplacé par un mot de passe (texte libre, plus « un code »). `Utilisateur.pin`, `verifyPin`/`setPin` (session.ts) et `InputOtp` (devenu inutilisé) sont retirés.
- **Un seul compte existe désormais** (Ndiole) — `UTILISATEURS: Utilisateur[]` devient un objet unique. La notion de « changer d'utilisateur » est retirée de l'app : `switch-user-dialog.tsx` et l'entrée correspondante du menu identité disparaissent. Les autres membres de l'équipe (Fatou, Marie Dominique) restent des `Praticienne` normales — un modèle sans rapport, jamais touché.
- **« Se déconnecter » gagne un effet réel** : un écran de verrouillage plein écran (nom, photo, mot de passe) remplace l'app tant qu'on ne s'est pas réauthentifié. Un onglet neuf démarre toujours déjà connecté (comme aujourd'hui) — l'écran de verrouillage n'apparaît qu'après ce geste explicite, jamais au chargement.
- La photo de profil (le composant `Avatar` savait déjà afficher `photoUrl`, jamais câblé) est stockée en session comme le reste (`sessionStorage`, par onglet, aucune persistance réelle), redimensionnée côté client avant stockage.

## Alternative écartée

Garder le PIN comme identifiant de bascule entre personnes et ajouter un mot de passe comme second identifiant, propre au compte. Écarté : ça maintient un mécanisme entier (choisir une personne, saisir son code) au service d'un besoin — plusieurs comptes interchangeables — que ce chantier retire explicitement du produit.
