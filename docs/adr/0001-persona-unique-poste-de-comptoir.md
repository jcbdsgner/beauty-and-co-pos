# Persona unique : le poste de comptoir, aucune surface direction/admin

`PRODUCT.md` décrit point-de-vente comme une app « till/back-office ». Nous avons tranché plus étroitement : le seul persona est la **réceptionniste** au comptoir (un·e praticien·ne peut tenir le poste ponctuellement, mêmes droits). Il n'existe aucun rôle « direction / admin », aucun écran de configuration du salon, aucun déverrouillage par code manager — la remise exceptionnelle passe désormais par une remise réceptionniste bornée (≤ 20 %) assortie d'un motif obligatoire, pas par une autorisation d'un rôle supérieur.

## Conséquences

- **Retiré de l'app** : gestion du Menu (prestations/produits, prix, catégories), Entreprises & Salons, Gestion Utilisateurs, Gestion Salon, Tendances soins. Le Menu (`lib/data/menu.ts`) reste une donnée en lecture seule, éditée hors de cette app.
- **La section Réglages disparaît.** Ne subsistent que des écrans « moi » (Profil, Sécurité), accessibles depuis le menu identité du pied de sidebar, simulés comme le reste de l'app (aucun backend).
- **`docs/USERFLOW.md`** : la décision ouverte « Rôles et permissions (caissière vs propriétaire/admin) » est résolue — il n'y a qu'un rôle.
- Ce qui touche à la configuration du catalogue dans les captures Figma (`docs/figma-userflow-part*.md`) et dans `FEATURES.md` est caduc.

## Alternative écartée

Garder les écrans de configuration mais les verrouiller derrière un rôle manager (PIN/déverrouillage). Écarté : ça maintient dans l'app une complexité (double rôle, gestion de session à deux niveaux) au service d'un utilisateur — la direction — qui n'est pas au comptoir et fera ces réglages ailleurs.
