# Inventaire exhaustif des fonctionnalités — Point de vente (Beauty and Co)

> **⚠️ Document historique (pré-refonte).** Cet inventaire décrit le code au 26/08/2026, avant la
> refonte de navigation. Il ne correspond plus à l'app actuelle : `/vente`→Comptoir, `/clients`→
> `/clientele`, `/suivi` fusionné dans Clientèle, `/lookbook`→`/catalogue`, **`/parametres` supprimé**
> (persona unique — voir [`adr/0001-persona-unique-poste-de-comptoir.md`](adr/0001-persona-unique-poste-de-comptoir.md)),
> Profil/Sécurité → `/compte`. La référence à jour du parcours cible est [`USERFLOW.md`](USERFLOW.md) ;
> le glossaire est [`../CONTEXT.md`](../CONTEXT.md). Ce fichier est conservé comme trace de l'existant
> d'origine, pas mis à jour écran par écran.
>
> Source : lecture intégrale du code au 26/08/2026 (routes `app/(app)/*`, tous les composants associés, `lib/data/*`). Le **Stock** est volontairement exclu de ce document (fonctionnalité vouée à être retirée du produit) — seules les rares surfaces où il apparaît comme point de couplage (nav, carte de settings, sélecteurs dépôt) sont mentionnées pour mémoire, sans détail.
>
> Chaque affordance est taguée :
> - **[OK]** — fonctionne réellement (logique réelle, même si les données sont en mémoire/mock, sans backend).
> - **[SIM]** — visuellement complet mais simulé : l'action a un effet local (état React) qui n'est persisté nulle part et/ou ne fait pas ce qu'elle prétend faire (ex. QR scanné = toujours le même client, paiement confirmé = pas de vrai encaissement).
> - **[STUB]** — aucun handler du tout : le clic ne fait littéralement rien.
> - **[COSMÉTIQUE]** — a un état (actif/inactif) mais aucun effet visible sur le reste de l'écran.
>
> Toute donnée est un mock local (`lib/data/*.ts`) : rien n'est persisté côté serveur, un rafraîchissement de page réinitialise tout état créé/modifié en session.

---

## 0. Coquille applicative (présente sur tout l'écran)

### Sidebar (`components/layout/sidebar.tsx`)
- Bloc marque : logo + « POINT DE VENTE » (décoratif, non cliquable).
- Navigation principale, un lien par item, état actif = fond + texte taupe :
  - Accueil → `/` **[OK]**
  - Planning → `/planning` **[OK]**
  - Clients → `/clients` **[OK]**
  - Suivi → `/suivi` **[OK]**
  - Lookbook → `/lookbook` **[OK]**
  - ~~Stock → `/stock`~~ — hors périmètre (à retirer avec la fonctionnalité elle-même)
  - Paramètres → `/parametres` **[OK]**
- Bloc identité pied de sidebar : avatar « P », nom « Propriétaire », rôle « Admin » — **statique**, aucune session/auth réelle.
- **Déconnexion** — confirme via `window.confirm`, puis **ne fait rien** **[STUB]** (aucune session à effacer, explicitement commenté dans le code).
- Mention de version, statique.

### Topbar (page d'accueil uniquement)
- Icône cloche « Notifications » — **[STUB]**, aucun handler, aucun badge, aucun dropdown.

### Dialogues (partout dans l'app)
- Aucun dialogue ne se ferme au clic sur l'overlay ni à la touche Échap — uniquement via un bouton « × »/« Fermer »/« Annuler » explicite. Comportement uniforme sur toute l'app, à noter comme décision de fait plutôt que gap isolé.

---

## 1. Accueil (`/`)

- Salutation statique « Bonjour, Propriétaire » (pas de personnalisation réelle).
- **CTA « Nouvelle Vente »** → `/vente` **[OK]**.
- **CTA « Scanner un client »** → `/vente?scan=1` (ouvre directement le scanner QR client sur l'écran de vente) **[OK]**.
- **Carte « Revenus »** : affiche toujours 0 F **[STUB fonctionnel]** — aucune agrégation réelle des ventes n'existe.
- **Carte « Rendez-vous »** : compte réel des RDV du jour + libellé du prochain RDV si présent **[OK]**, mais la carte elle-même n'est pas cliquable (pas de lien vers `/planning`).
- **Actions rapides** (3 cartes, toutes de vraies navigations) :
  - « Relances clients » → `/suivi` **[OK]**
  - « Équipe » → `/planning?vue=equipe` **[OK]** (deep-link vers la vue Équipe du Planning)
  - « Planning » → `/planning` **[OK]**
- Aucun état de chargement, aucune erreur, aucune pagination — page 100 % statique côté rendu.

---

## 2. Nouvelle Vente (`/vente`) — écran cœur du produit

Modèle : un unique arbre de composants avec une machine à états `browse → payment → receipt` ; plusieurs « ventes » (onglets) coexistent en mémoire, une seule est affichée à la fois. Tout est perdu au refresh.

### 2.1 Onglets de vente (`sale-tabs.tsx`)
- Chaque onglet = un panier indépendant (client, articles, remises, mode de paiement propres).
- **Sélection d'un onglet** **[OK]** — bascule l'affichage, remet `step` à `browse`.
- **Fermeture d'un onglet (×)**, visible seulement si >1 onglet **[OK]** — demande confirmation native `window.confirm` si le panier n'est pas vide.
- **« + » Nouvelle vente** **[OK]** — crée un onglet vide, aucune limite de nombre.
- Badge = nombre d'articles (quantité cumulée, pas nombre de lignes).

### 2.2 Sélection du client (`client-field.tsx`, `client-modal.tsx`)
- Champ « Sélectionner un client * » (obligatoire, style pointillé = requis) → ouvre la modale client **[OK]**.
- Client sélectionné : carte personne + bouton **« Retirer »** **[OK]** (ne vide pas le panier).
- **Bandeau RDV du jour** si le client a un rendez-vous du jour (donnée mock séparée de celle du Planning — **aucun lien d'id réel entre les deux modules**) — informatif uniquement.
- Modale « Sélectionner un client » :
  - Recherche nom/téléphone, live **[OK]**.
  - **« Scanner QR »** → ouvre le scan caméra **[OK] (ouverture) / [SIM] (détection)**.
  - **« + Nouveau »** → vraie navigation vers `/clients/nouveau` **[OK]**.
  - Liste groupée « RDV aujourd'hui » / « Tous les clients ».
  - **Sélection d'un client avec RDV du jour et panier vide** → **auto-remplissage du panier** avec les prestations du RDV, pré-assignées au praticien qui a pris la réservation **[OK]**, logique réelle mais silencieuse (rien n'indique explicitement à la caissière que ça vient d'arriver, hors le bandeau informatif).

### 2.3 Scan QR (`scan-modal.tsx`) — utilisé deux fois (client, carte cadeau)
- Vraie caméra (`getUserMedia`), cadre de visée, gestion d'erreur caméra affichée **[OK]**.
- **Aucun décodage QR réel** — le bouton **« Simuler la détection »** résout toujours le même enregistrement fixe, quel que soit ce qui est filmé **[SIM]** :
  - scan client → toujours `CLIENTS[0]` (Awa Sarr)
  - scan carte cadeau → toujours la carte `BACO-GIFT-25000`, appliquée immédiatement (saute l'étape code + OK)

### 2.4 Catalogue (`category-rail.tsx`, `full-catalog.tsx`, `service-catalog.tsx`)
- Toggle **Services / Produits** **[OK]** — réinitialise la navigation catalogue.
- Recherche texte live, placeholder contextuel **[OK]**.
- Vue « Tous » (aucune catégorie sélectionnée, pas de recherche) : services groupés par sous-catégorie, tuiles cliquables → ajout direct au panier **[OK]**.
- Grille de catégories (icônes dessinées, compteur par catégorie) **[OK]** — 8 catégories Services (107 prestations réelles importées du site vitrine b&co).
- Pills de sous-catégorie une fois une catégorie choisie **[OK]**.
- Produits : liste plate, 6 articles retail mock (pas de catégories).
- États vides « Aucun résultat » contextualisés **[OK]**.
- Ajouter deux fois le même article incrémente la quantité, ne duplique pas la ligne **[OK]**.

### 2.5 Panier (`cart-panel.tsx`) — colonne persistante
- Compteur d'articles, état vide dédié **[OK]**.
- Par ligne : suppression **[OK]**, stepper quantité (1 à 20, pas de zéro via le stepper) **[OK]**, assignation praticien par menu déroulant (6 praticien·nes fixes, tag de données pur, aucun effet sur le prix) **[OK]**.
- **Remise / Code cadeau** (section repliable, badge « Actif » si une remise quelconque est en cours) :
  - **Code cadeau** : saisie + scan + « OK » **[SIM sur la validation]** — code invalide = aucun feedback, ne s'applique juste pas ; un seul code actif à la fois (le second écrase le premier).
  - **Points fidélité** : stepper ±100 pts (borné au solde du client, arrondi à la centaine, 100 pts = 1000 F) **[OK]** — masqué si le client a <100 pts.
  - **Code remise manager** : **[SIM]** — n'importe quelle chaîne non vide déclenche une remise fixe de 5000 F ; ce n'est pas un vrai système de code/autorisation malgré la présentation (« code manager »).
- Total : sous-total, remises (somme des 3 mécanismes, chacun plafonné pour ne jamais passer sous 0), total.
- **« Encaisser »** désactivé tant que panier vide ou client non sélectionné (état désactivé lisible, pas un simple `opacity-40`) **[OK]** → passe à l'étape Paiement.

### 2.6 Paiement (`payment-screen.tsx`) — plein écran
- Retour vers le panier sans perte d'état **[OK]**.
- 4 méthodes fixes : Wave, Orange Money, Espèces, Carte — sélection simple exclusive **[OK]**.
- **Paiement mixte (2 méthodes)** : case à cocher, désactivée tant qu'aucune méthode 1 n'est choisie ; répartition en 2 montants, méthode 2 ne peut pas être identique à la méthode 1 **[OK]** ; validation live « Total : X / Y » qui doit être **exactement** égale (aucune tolérance de sur/sous-paiement, **pas de calcul de monnaie à rendre**).
- **« Confirmer »** **[SIM]** — aucun appel de paiement réel derrière aucune des 4 méthodes ; génère un numéro de facture séquentiel (`INV-2026-0000xx`, en mémoire seulement) et bascule vers le reçu.

### 2.7 Reçu (`receipt-screen.tsx`) — plein écran
- Bandeau succès, récap salon/facture/caissier·ère (« Propriétaire » toujours), client, lignes d'articles, sous-total/total, détail du ou des paiements (2 lignes si mixte) **[OK]**.
- **Section Fidélité** : points gagnés (1 pt / 1000 F) + « solde actuel » projeté **[SIM]** — l'affichage est correct mais **rien n'est réécrit** dans les données client ; une vente suivante pour le même client repart du solde d'origine.
- **« Prendre le rendez-vous maintenant »** → `/planning` **[OK]** (vraie navigation, mais ne pré-remplit rien de visible côté Planning).
- **Pas de bouton d'impression / export du reçu** — seule l'existence de « Accueil POS » et « Nouvelle vente » (malgré le nom de l'écran, « ticket imprimé » n'existe pas en tant que fonctionnalité).
- **« Accueil POS »** → `/` **[OK]**, mais comme l'état des ventes est local à l'arbre de la page `/vente`, **quitter vers l'accueil perd tous les autres onglets de vente encore ouverts.**
- **« Nouvelle vente »** **[OK]** — ferme la vente terminée, garde les autres onglets ouverts s'il y en a, sinon recrée « Vente 1 ».

---

## 3. Planning (`/planning`)

> **⚠ Section pré-Refonte 2 — largement caduque.** Depuis `docs/adr/0005` (langage « Le Tableau », Équipe fondue) et `docs/adr/0006`, le Planning est une **vue de lecture** : plus de grille horaire, plus de formulaire de création/édition, plus de `window.confirm`. La prise de rendez-vous se fait **en ligne** ; un rendez-vous est **actif ou annulé** (pas de « en attente / confirmé », pas de « Confirmer ») ; ne restent que **Annuler** (statut « annulé » conservé), **Encaisser** (au niveau réservation) et « Marquer absente ». Le modèle est désormais **Réservation → Rendez-vous atomiques** (voir `CONTEXT.md` et `docs/USERFLOW.md`). Ce qui suit décrit l'ancien écran.

Toute la mutation d'état (créer/modifier/annuler un RDV) est locale à la session, indexée par **jour de la semaine (0–6)**, pas par date absolue — les mêmes RDV mock réapparaissent chaque semaine sur Lundi/Mardi ; tous les autres jours/semaines sont vides par défaut.

### 3.1 En-tête
- **« Aujourd'hui »** (visible seulement si on a navigué ailleurs) → revient à la semaine/jour réels **[OK]**.
- Date active affichée en toutes lettres, non interactive.
- **Filtres Entreprise / Salon** **[COSMÉTIQUE]** — changent le sous-titre et l'état visuel des sélecteurs, mais **ne filtrent aucune donnée réelle** (RDV, équipe).
- **Sélecteur de semaine** (◀/▶ illimité) + **7 jours cliquables** **[OK]**, vrai calcul de date.
- **Toggle Rendez-vous / Équipe** **[OK]** — bascule aussi accessible via `?vue=equipe` (utilisé par la carte « Équipe » de l'Accueil), et réinitialise le filtre praticien s'il y en avait un.

### 3.2 Vue « Rendez-vous » (grille horaire par praticien·ne, 9h–19h, pas de 30 min)
- **« Nouveau rendez-vous »** (désactivé si personne ne travaille ce jour-là) **[OK]** → ouvre le formulaire pré-rempli (1er praticien visible).
- **Clic sur une case horaire vide** → ouvre le formulaire pré-rempli avec ce praticien + cette heure **[OK]** — c'est le point d'entrée principal de création.
- **Clic sur un bloc de RDV existant** → ouvre le détail **[OK]**.
- Code couleur par rôle du/de la praticien·ne (pas par client ni par statut) + trait plein/pointillé selon Confirmé/En attente **[OK]**.
- **Filtre praticien actif** (arrivé depuis la vue Équipe) : chip de retrait « ✕ {nom} · Voir tout le monde » **[OK]**.
- État vide si personne ne travaille ce jour (message différent si filtré sur une personne précise) **[OK]**.

### 3.3 Détail d'un rendez-vous
- Statut (badge Confirmé/En attente), infos client (téléphone + points **si** le client est lié à un vrai profil `CLIENTS` — sinon rien, RDV « nom libre »), service, horaire, praticien·ne.
- **« Confirmer le rendez-vous »** (si en attente) **[OK]** → toast « Rendez-vous confirmé ».
- **« Modifier »** **[OK]** → réouvre le formulaire pré-rempli.
- **« Annuler »** **[OK, mais via `window.confirm` natif]** — seul endroit de l'app qui rompt le pattern dialogue custom ; annuler **supprime** le RDV, il n'existe **aucun statut « annulé »** ni historique des annulations.

### 3.4 Formulaire créer/modifier
- **Client*** : champ texte + recherche live dans `CLIENTS`, sélection optionnelle (le nom libre reste toujours accepté même sans correspondance — « nouveau client » implicite) **[OK]**.
- **Service*** : select groupé par catégorie (vrai catalogue `vente.ts`), auto-remplit la durée depuis la fiche service (écrase une durée déjà saisie) **[OK]**.
- **Praticien·ne*** : uniquement celles/ceux qui travaillent ce jour-là **[OK]**.
- **Heure de début*** : créneaux de 30 min 9h–19h, **aucune indication visuelle des créneaux déjà pris** dans la liste elle-même.
- **Durée (min)*** : libre, multiples de 15, pas de plafond.
- **Statut** : Confirmé / En attente (toggle) **[OK]**.
- **Détection de conflit réelle** (même praticien·ne, chevauchement horaire, exclut le RDV en cours d'édition) **[OK]** — bloque la soumission avec message inline si conflit ; le conflit n'est détecté qu'à la soumission, jamais pendant la saisie.

### 3.5 Vue « Équipe »
- Filtre par rôle (Tous / Coiffeuse / Esthéticienne / Accueil / ~~Stock~~) **[OK]** — l'option de rôle « Stock » est un vestige du module retiré, à faire disparaître avec lui plutôt qu'à conserver comme rôle RH sans écran.
- Carte par membre : pastille verte « travaille » relative **au jour sélectionné dans le sélecteur de semaine**, pas au vrai jour du calendrier (le libellé dit « aujourd'hui » de façon trompeuse si on a navigué ailleurs).
- **Seuls les praticien·nes (Coiffeuse/Esthéticienne) sont cliquables** → `onOpenSchedule` bascule vers la vue Rendez-vous filtrée sur cette personne **[OK]** ; ~~Accueil/Stock~~ Accueil est une simple carte inerte (pas de justification produit visible, à trancher) — la carte Stock disparaît avec le module.
- Aucune autre action (pas de fiche détail collaborateur, pas d'édition, pas de contact).

---

## 4. Clients (`/clients`, `/clients/[id]`, `/clients/[id]/fidelite`, `/clients/nouveau`)

### 4.1 Répertoire (`/clients`)
- **« Ajouter »** → `/clients/nouveau` **[OK]**.
- Recherche live (nom/téléphone/email) **[OK]**.
- 3 filtres pill exclusifs, **re-cliquer sur le filtre actif le désélectionne** (pas de pill « Tous » explicite) : Nouveaux / Historique / VIP (VIP regroupe vip+gold) **[OK]**.
- État vide sans action de réinitialisation des filtres.
- Grille de cartes personne, clic = ouverture de la fiche **[OK]**.
- Pas de tri, pas de pagination, pas d'actions groupées.

### 4.2 Nouveau client (`/clients/nouveau`)
- Formulaire en 2 sections (Identité / Profil beauté), 3 champs obligatoires (Prénom, Nom, Téléphone).
- Anniversaire = simple champ texte « jj/mm/aaaa », pas un vrai sélecteur de date malgré l'icône calendrier décorative.
- **« Créer le client »** **[SIM]** — ne persiste rien dans les données, redirige simplement vers `/clients` (commentaire explicite dans le code : mock local uniquement).
- Aucune détection de doublon (même téléphone déjà existant, par ex.).

### 4.3 Fiche client (`/clients/[id]`)
- **Identité** : avatar, nom, palier de fidélité, ID client, QR statique **[SIM]** (motif fixe, aucune donnée réelle encodée, identique pour tout le monde).
- **« Imprimer carte »** **[OK, mais générique]** — déclenche `window.print()` de toute la page, pas un export dédié.
- **« Envoyer WhatsApp »** → `wa.me/{numéro}` **[OK]** si numéro connu, sinon lien mort silencieux (`href="#"`, aucun état désactivé/tooltip).
- **Coordonnées** : purement lecture seule, **aucun bouton « Modifier » nulle part sur cette carte**.
- **Stats** (Visites / Dépenses / Points) : lecture seule.
- **Dernière visite** : lecture seule.
- **Abonnement** (`SubscriptionCard`) : ne s'affiche **que** si le client a un abonnement en mock (1 seul client sur 8) — sinon la section disparaît entièrement, aucun état « pas d'abonnement ».
  - **« Utiliser »** un crédit **[SIM]** — décrémente un compteur local uniquement, remis à zéro au refresh, aucun lien avec une vente réelle.
  - Ligne « Prestataire préférée » avec chevron **[STUB]** — aucun handler.
- **Suivi & recommandations** (`FollowUpCard`) :
  - Lien « Centre de suivi » → `/suivi` **[OK]**.
  - Si aucune donnée de suivi : simple texte, pas de composant `EmptyState` cohérent avec le reste de l'app.
  - **« Proposer »** une suggestion **[SIM]** — passe en « Envoyée » localement, **aucun message n'est réellement envoyé**.
- **Notes internes** : **deux affordances distinctes « Ajouter »** (icône en en-tête + lien dans l'état vide), **toutes deux [STUB]** — la fonctionnalité « notes » n'existe pas du tout (pas de modale, pas de champ de saisie).
- **Préférences beauté** :
  - **« Modifier »** **[STUB]** — aucun formulaire d'édition n'existe.
  - Affiche le type de cheveux si connu, sinon état vide sans action.
- **Dernières visites** : **affiche toujours l'état vide**, quelles que soient les données réelles du client (`visits`, `lastVisit`) — fonctionnalité non branchée malgré les données existantes en mock.
- Lien pied de page → `/clients/{id}/fidelite` **[OK]**.
- **Piège** : un id client inconnu dans l'URL affiche silencieusement le premier client du mock (`CLIENTS[0]`) au lieu d'une erreur 404.

### 4.4 Carte de fidélité (`/clients/[id]/fidelite`)
- **WhatsApp** / **Email** **[OK]** si coordonnée connue, sinon lien mort silencieux.
- **« Télécharger »** **[STUB]** — complètement inerte (ni `href` ni `onClick`).
- **« Imprimer »** **[OK, générique]**.
- Carte de fidélité visuelle + sticker QR à découper — 100 % décoratifs, QR statique **[SIM]** (même motif partout).

---

## 5. Suivi (`/suivi`, `/suivi/campagnes`)

Tout l'état de validation (« envoyé ») est un contexte React remis à zéro à chaque revisite de la page — **rien n'est archivé**.

### 5.1 Tableau de bord (`/suivi`)
- **« Lookbook »** → `/lookbook` **[OK]**, **« Campagnes »** → `/suivi/campagnes` **[OK]**.
- **Bandeau « Tournée du matin »** : compteurs mock, **« Valider & envoyer »** **[SIM]** — bascule un flag partagé `sent=true`, irréversible dans la session (pas d'« annuler l'envoi »), **aucun message n'est réellement transmis**.
- 4 tuiles statistiques : valeurs mock fixes, **ne se recalculent pas** à partir des cartes réellement affichées (incohérence assumée en mock, à trancher pour la vraie donnée).
- 3 onglets :
  - **« Aujourd'hui »** (actif par défaut) — toutes les sections/cartes.
  - **« À venir »** — ne garde que les cartes « à échéance future » (aujourd'hui, seule la section Anniversaires en a).
  - **« Historique »** — **[STUB permanent]** — affiche toujours l'état vide, aucune fonctionnalité d'historique n'existe (valider la tournée n'y écrit rien).
- Chaque carte cliente (5 sections : Anniversaires, Soins & rendez-vous, Fidélité, Reconquête, Rappels Lookbook) a un des 3 patterns d'action suivants :
  - **`contact`** (anniversaires) : boutons WhatsApp / Email indépendants (chacun **[SIM]**, passe à « Envoyée » localement) + **« RDV pris »** **[SIM]** qui remplace la ligne par une confirmation, irréversible dans l'UI.
  - **`pending`** (soins, fidélité, lookbook) : pas de bouton individuel — dépend entièrement du bouton global « Valider & envoyer ».
  - **`discount`** (reconquête, remise -X %) : **« Autoriser la remise »** **[SIM]**, workflow d'autorisation manager simulé sans aucune vérification réelle de droits — **bug d'état identifié** : si la tournée globale est validée *avant* qu'une carte remise soit autorisée individuellement, cette carte reste bloquée indéfiniment sur « en attente d'autorisation ».
  - Carte compacte (échéance future) : un seul bouton icône WhatsApp **[SIM]**, pas d'annulation possible une fois cliqué.
  - **« × » Ignorer**, sur les cartes développées : masque la carte définitivement pour la session, sans confirmation ni annulation possible **[OK fonctionnellement, mais irréversible]**.

### 5.2 Campagnes (`/suivi/campagnes`)
- **« + Créer »** **[STUB]** — complètement inerte.
- Liste de 3 campagnes mock, toutes au statut « BROUILLON » (aucun autre statut n'existe dans le modèle — pas de "envoyée"/"planifiée").
- **« Modifier »** **[STUB]**, **icône poubelle** **[STUB]** — aucune des deux actions n'est câblée sur cet écran (contrairement aux Conseils beauté où la suppression fonctionne réellement).

---

## 6. Lookbook (`/lookbook`)

Catalogue de présentation **entièrement en lecture seule**, aucun CRUD.

- Filtre par catégorie (pills, 7 catégories + Tous), compteur par catégorie **[OK]**.
- Grille de cartes, badge « TENDANCE » sur certains items.
- Clic sur une carte → modale détail (visuel catégorie, prix, badge tendance) → **« Fermer »** est l'unique action, **pas de renvoi vers un autre module** (pas de « proposer en vente », pas de lien caisse) — décision de conception explicite à noter/valider.
- 2 des 7 catégories déclarées (Soins cheveux, Pédicure) n'ont **aucun** item mock → état vide jamais visible avec les données actuelles mais bien implémenté.

---

## 7. Paramètres (`/parametres` + 5 sous-écrans réels)

### 7.1 Hub (`/parametres`)
- Carte profil statique (non cliquable, pas d'édition).
- Grille de 14 cartes :
  - **5 cartes réellement fonctionnelles** → Gestion Services, Gestion Produits, Photos de référence, Conseils beauté, Entreprises & Salons.
  - **9 cartes volontairement grisées (`aria-disabled`, 55 % opacité)** → Mon Profil, Gestion Utilisateurs, Tendances soins, ~~Gestion Stock Central~~ (hors périmètre), Gestion Salon, Notifications, Sécurité, Apparence, Aide & Support. **[STUB assumé et signalé visuellement]** — pattern de placeholder délibéré, contrairement aux stubs « silencieux » ailleurs dans l'app.

### 7.2 Conseils beauté (`/parametres/conseils-beaute`)
- **Mes conseils** : filtre par famille de soin (8 familles), **« Ajouter »** → modale création **[OK]**, **crayon** → modale édition **[OK]**, **poubelle** → suppression immédiate **[OK, sans confirmation]**.
  - Modale : famille (pill unique), texte du conseil (validation visible si vide, seul endroit du module Paramètres à afficher une erreur inline), ciblage optionnel type de peau / type de cheveux (chips multi-sélection).
- **Cycles & conseils par service** : recherche, badge délai `J+N` par service, **crayon** → modale édition délai + texte de relance **[OK]**. Délai vide = relance désactivée (« — »).

### 7.3 Entreprises & Salons (`/parametres/entreprises`)
- Accordéon entreprise unique (Beauty and Co, ses salons Almadies + Sea Plaza) **[OK, expand/collapse uniquement]**.
- Salons en lecture seule (nom, adresse, statut actif/inactif) — **aucune action d'ajout/édition/suppression** d'entreprise ou de salon nulle part.

### 7.4 Photos de référence (`/parametres/photos-reference`)
- Sélecteur « Entreprise concernée » **[COSMÉTIQUE]** — aucun effet sur la grille affichée.
- 5 onglets catégories (Couleurs ongles, Formes ongles, Types de cheveux, Marques cheveux, Boissons).
- Slot rempli → **poubelle** **[SIM]** repasse le slot à vide.
- Slot vide → clic **[SIM]** simule un upload en le passant à « rempli » — **aucun vrai sélecteur de fichier n'existe**, confirmé par le code comme un stub assumé.

### 7.5 Gestion Produits (`/parametres/produits`)
- **« Catégories »** → modale arborescence **lecture seule** (pas d'ajout/renommage/suppression) **[OK en lecture]**.
- **« Ajouter »** / **crayon** par produit → modale d'édition **[OK]**.
  - Champ photo produit : **[STUB]**, zone décorative sans aucun input file.
  - Validation silencieuse (nom/SKU vides → le formulaire ne fait juste rien, aucun message affiché — incohérent avec Conseils beauté qui, lui, affiche une erreur).
  - Toggle « Acheté à l'étranger » : **contrôle en double** (un `Switch` + un bouton texte séparé faisant strictement la même chose) — anomalie mineure à corriger dans le prochain design.
  - Toggle « Afficher les produits inactifs » sur la liste : **même anomalie de contrôle en double**.
- Sélecteurs Entreprise / Dépôt **[COSMÉTIQUE]** (dépôt lié au Stock, hors périmètre de toute façon).
- Alertes de stock bas / badges stock : hors périmètre (Stock).

### 7.6 Gestion Services (`/parametres/services`)
- Même structure que Produits, en plus cohérent sur un point (le titre de la modale change bien entre « Nouveau service » et « Modifier le service », contrairement à Produits qui garde toujours « Modifier le produit »).
- **« ⇄ Catégories »** → modale liste des catégories **avec comptage live** (contrairement à celle des produits, statique) — incohérence d'implémentation entre les deux modales pourtant très proches.
- Changer la catégorie **écrase silencieusement** le « Groupe affiché » même s'il avait été personnalisé — comportement à confirmer/documenter.
- Même anomalie de **toggle en double** (« Service actif »).
- Validation silencieuse identique à Produits (pas de message d'erreur, contrairement à Conseils beauté).

---

## Récapitulatif transverse des incohérences relevées (à trancher avant remaquettage)

1. **Confirmation d'action destructrice non uniforme** : `window.confirm` natif utilisé à 3 endroits (annuler un RDV, fermer un onglet de vente non vide, déconnexion) alors que le reste de l'app n'a que des dialogues custom — à unifier.
2. **Validation de formulaire non uniforme** : Conseils beauté affiche une erreur inline explicite ; Produits et Services échouent silencieusement ; Nouveau Client ne valide que via les attributs HTML natifs (`required`), sans message custom.
3. **Contrôles dupliqués** (Switch + bouton texte faisant la même chose) présents 3 fois dans Paramètres (produits actifs, services actifs, achat à l'étranger).
4. **Sélecteurs Entreprise/Salon/Dépôt cosmétiques** à 4 endroits (Planning, Photos de référence, Produits, Services) — soit les brancher réellement sur un vrai modèle multi-entreprise/multi-salon, soit les retirer.
5. **Client Awa/RDV du jour dupliqués entre modules** : les rendez-vous « du jour » utilisés par `/vente` (`TodaysAppointment`) et ceux du Planning (`APPOINTMENTS_BY_DAY`) sont deux mocks totalement disjoints, sans id partagé — un vrai modèle de données devra les unifier (déjà signalé dans `CONTEXT.md`/`PRODUCT.md`).
6. **QR code jamais réel** (client ni carte cadeau) — à trancher : vraie génération/lecture QR, ou assumé comme hors scope MVP.
7. **Aucune donnée de vente n'alimente les stats** (Accueil « Revenus », Suivi tuiles stats) — actuellement des placeholders à 0 ou des valeurs mock déconnectées.
8. **Stubs silencieux vs stubs assumés** : le hub Paramètres grise explicitement ses cartes non prêtes (bon pattern) alors que la majorité des autres stubs de l'app (Notes internes, Télécharger carte fidélité, Campagnes Modifier/Supprimer/Créer, chevron Prestataire préférée) sont visuellement indiscernables d'une fonctionnalité qui marche — à corriger systématiquement dans la refonte (griser, masquer, ou implémenter).
9. **Suivi → Historique** et **Notes internes client** et **Dernières visites client** : trois sections dont la donnée existe conceptuellement (ou est mentionnée ailleurs) mais dont l'écran affiche toujours l'état vide, sans que ce soit un vrai stub visuel — à distinguer clairement d'un « pas encore de données ».
