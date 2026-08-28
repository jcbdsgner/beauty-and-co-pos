# Refonte 2 — Planning · Clientèle · Relances · Catalogue

> **⚠ Amendé par `docs/adr/0006` (2026-08-28).** Le modèle de rendez-vous a changé : **Réservation
> → Rendez-vous atomiques**, un seul payeur, prestations multiples / praticiennes multiples /
> bénéficiaires multiples, RDV parallèles à la même heure. La **prise de rendez-vous est retirée
> de l'app** — plus d'« Éditeur de rendez-vous », plus de « Nouveau rendez-vous » ni de « Décaler ».
> Le Planning ne garde que Confirmer / Annuler / Encaisser. Toutes les mentions de l'éditeur de
> rendez-vous ci-dessous sont caduques ; le reste (langage visuel, Clientèle, Relances, Catalogue) tient.
>
> **Portée.** Cette refonte ne touche que les quatre sections **Planning, Clientèle, Relances,
> Catalogue** (et leurs sous-écrans : Équipe, Fiche cliente, Carte de fidélité, Détail style).
> `Accueil`, le `Comptoir` (calque transversal), `/compte` et `Récap des ventes` restent tels
> quels dans ce passage — ils adopteront le même langage ensuite.
>
> **Méthode.** 1) inventaire exhaustif des fonctionnalités des quatre sections ; 2) nouveau
> userflow *reconstruit à partir des job stories*, pas des écrans actuels (breadboarding —
> Shape Up / `/layers-interaction-flow`) ; 3) design des écrans à partir du seul userflow, dans
> un **nouveau langage visuel** (voir `DESIGN.md` réécrit + `docs/adr/0005`).
>
> `docs/USERFLOW.md` a été **assaini** : les sections de ces quatre modules n'y portent plus
> aucune prescription de composant, de mise en page ni de style — seulement le parcours, les
> capacités par lieu et les cas limites. Ce document-ci porte le détail du raisonnement ;
> `USERFLOW.md` reste la référence courte.

---

## 1. Inventaire des fonctionnalités (état d'avant cette refonte)

Source : lecture du code (`app/planning`, `app/equipe`, `app/clientele/**`, `app/relances`,
`app/catalogue`, composants associés, `lib/store/app-store.ts`, `lib/data/*`) et
`docs/FEATURES.md`. Tag : **[OK]** logique réelle · **[SIM]** effet local non persisté ·
**[STUB]** aucun handler · **[COSMÉTIQUE]** état sans effet.

### 1.1 Planning (`/planning`)

- **Sélecteur de semaine** : ◀/▶ illimité + 7 jours cliquables, calcul de date réel **[OK]**.
- **Bouton « Aujourd'hui »** : visible seulement si on a navigué ailleurs → revient au jour réel **[OK]**.
- **Bascule « Grille horaire / Équipe »** : deux vues dans la même page **[OK]** ; la vue Équipe
  ici double la sous-page `/equipe`.
- **Sélecteurs Entreprise / Salon** : rendus seulement s'il y a > 1 entrée ; **aucun filtrage réel**
  des rendez-vous ou de l'équipe **[COSMÉTIQUE]** (1 entreprise, 2 salons, données non taguées salon).
- **Toggle « Afficher les annulés »** : superpose les rendez-vous annulés atténués sur la grille **[OK]**.
- **Filtre praticienne** : arrivé via `?staff=` (depuis Équipe ou la Fiche cliente « praticienne
  préférée ») → chip de retrait « {nom} · voir tout le monde » **[OK]**.
- **Grille horaire** (`ScheduleGrid`) : colonnes = praticiennes qui travaillent aujourd'hui,
  lignes = créneaux de 15 min 09:00–17:45, blocs positionnés par heure/durée **[OK]**.
  - clic sur une **case vide** → formulaire pré-rempli (praticienne + heure) **[OK]** ;
  - clic sur un **bloc** → Détail rendez-vous **[OK]** ;
  - blocs annulés en pointillés, non cliquables ; blocs d'une praticienne absente teintés
    « Praticienne absente » **[OK]** ;
  - **la grille ne montre que « aujourd'hui »** : les autres jours sont toujours vides (données
    mock indexées sur un seul jeu, pas par date).
- **« Nouveau rendez-vous »** (action de section) → formulaire vide **[OK]**.
- **Détail rendez-vous** (`AppointmentDetailDialog`) : statut, badge « En cours » si une vente
  ouverte lui est liée, ligne heure/prestation/praticienne, badges « absente ».
  - **« Confirmer »** (si en attente) **[OK]** ;
  - **« Encaisser »** / **« Voir la vente en cours »** → passe par `useEncaissement` (garde
    remplaçante si praticienne absente) → ouvre / rebascule un onglet Comptoir **[OK]** ;
  - **« Modifier »** → formulaire pré-rempli (version Planning uniquement) **[OK]** ;
  - **« Annuler »** → `ConfirmDialog` (avertissement spécifique si une vente est ouverte) →
    statut `annule` conservé (jamais supprimé) **[OK]**.
- **Formulaire rendez-vous** (`AppointmentFormDialog`) : Cliente\* (recherche unique), Service\*
  (auto-remplit la durée tant qu'elle n'a pas été touchée), Praticienne\* (celles qui travaillent
  ce jour), Heure\* (créneaux pris rendus non sélectionnables), Durée\*, Statut (En attente /
  Confirmé). Détection de conflit **à la soumission** (chevauchement même praticienne) → erreur
  inline **[OK]**. Pas de persistance serveur — reset au refresh.

### 1.2 Équipe (`/equipe`, deep-link `?vue=equipe` depuis le Planning)

- **Filtre par rôle** : Toute l'équipe / Coiffeuses / Esthéticiennes / Accueil **[OK]**.
- **Carte par membre** : avatar, nom, badge de rôle, pastille verte « au salon », ligne d'état
  (« Au salon · ouvrir le planning » / « Indisponible aujourd'hui » / « Ne travaille pas »).
- **Clic sur une carte praticienne** (coiffeuse/esthéticienne uniquement) → `/planning?staff={id}` **[OK]**.
- **« Marquer indisponible aujourd'hui »** (icône, sur une carte praticienne présente) →
  `markStaffUnavailable` : la praticienne passe `unavailableToday`, ses rendez-vous du jour
  portent « Praticienne absente », « Encaisser » l'un d'eux impose une remplaçante **[OK]**.
- Le rôle « Accueil » : carte inerte (pas de planning à ouvrir).
- Aucune fiche collaborateur, aucune édition d'horaires, aucun contact.

### 1.3 Clientèle (`/clientele`)

- **Recherche cliente** (`SearchInput` + `searchClients` : nom ou téléphone, live) **[OK]** — même
  logique de correspondance que le Comptoir et le formulaire de rendez-vous.
- **« + Nouvelle cliente »** → `NewClientDialog` **[OK]**.
- Tant que la recherche est vide : deux listes contextuelles **« Vues récemment »**
  (`recentClientIds` du store, plafonné à 8) et **« Attendues aujourd'hui »** (clientes ayant un
  rendez-vous non annulé aujourd'hui, dédupliquées, triées par heure) **[OK]**.
- **Annuaire filtrable** : pills Toutes / Nouvelles (créées < 30 j) / Historique (≥ 5 visites) /
  VIP (tier vip|gold) **[OK]** ; grille de cartes cliente (nom, tier, visites, dernière visite,
  total dépensé) → clic ouvre la fiche **[OK]**.
- **États vides** : recherche sans résultat → « Créer une nouvelle cliente » pré-remplie de la
  saisie ; annuaire filtré vide → « Réinitialiser les filtres » **[OK]**.

### 1.4 Fiche cliente (`/clientele/[id]`)

- **En-tête d'identité collant** : avatar, nom, badge tier, « cliente depuis … · dernière visite »,
  **« Contacter »** (WhatsApp → tel → mailto, désactivé + explication si aucune coordonnée),
  **« Nouvelle vente »** → `openNewTab({ clientId })` (Comptoir déployé, cliente sélectionnée) **[OK]**.
- **« Le maintenant »** :
  - **Valeur cliente** : total dépensé / visites / points fidélité (lecture, données réelles du
    store) + phrase sur la dernière visite **[OK]** ;
  - **Relances ouvertes** : cartes filtrées sur `RELANCES` (statuts en attente / autorisée /
    en attente d'autorisation) + lien « Voir la tournée » → `/relances` **[OK]** (lecture seule ici) ;
  - **Notes internes** : journal horodaté (préfixe `[jour mois HH:MM]`), `Textarea` + « Ajouter
    une note » → `updateClient({ internalNotes })` **[OK]** (persistant en session) ;
  - **Recommandations** : 3 premiers `STYLES`, chacun → ouvre `StyleDetailDialog` (lecture) ;
    **« Proposer »** → ajoute l'id à un `Set` local + toast (« ajoutée à la tournée de relance ») —
    **[SIM]** : ne crée pas réellement de `Relance` dans le store.
- **« La référence »** :
  - **Carte de fidélité** : `DemoQrBlock` (motif déterministe par id), « Imprimer carte »
    (`window.print`), « Ouvrir » → `/clientele/[id]/fidelite` **[OK]** ;
  - **Coordonnées** : téléphone / WhatsApp / email / profession / adresse + praticienne préférée
    (→ `/planning?staff=`) ; **« Modifier »** → `EditCoordonneesDialog` → `updateClient` **[OK]** ;
  - **Préférences beauté** : type de cheveux / réf. couleur / notes peau / préférences ;
    **« Modifier »** → `EditPreferencesDialog` **[OK]** ; état vide si rien ;
  - **Abonnement** : **toujours l'état vide** « Aucun abonnement actif » — le modèle `Cliente`
    ne porte pas d'abonnement, la section est un placeholder honnête.
- **Id inconnu** → `EmptyState` « Cette cliente est introuvable » + retour au répertoire **[OK]**.
- `noteClientViewed(id)` appelé à l'ouverture (alimente « Vues récemment »).

### 1.5 Carte de fidélité (`/clientele/[id]/fidelite`)

- **`LoyaltyCard`** : plaque taupe, nom, gros chiffre de points, badge tier, bloc QR démo.
- **WhatsApp / Email** : désactivés + libellé « Pas de WhatsApp / email » si coordonnée absente **[OK]**.
- **« Télécharger »** : génère réellement un PNG 900×560 de la carte via `<canvas>` **[OK]**.
- **« Imprimer »** : `window.print()` (la page est stylée `print:hidden` hors carte) **[OK]**.
- **Id inconnu** → `EmptyState` + retour au répertoire **[OK]**.

### 1.6 Relances (`/relances`) — 3 volets (`Tabs`)

**Tournée du matin** (volet par défaut) :
- **Bandeau** : gros compteur « à traiter aujourd'hui » + ventilation par type (« 1 anniversaire ·
  1 fidélité · … ») recalculée depuis les cartes réellement affichées **[OK]** ;
  **« Valider & envoyer »** → `ConfirmDialog` → passe toutes les cartes actionnables du jour à
  `envoyee`, crée un `Batch` local, toast **réversible** (« Annuler » restaure) **[SIM]** (état
  local au composant, pas de store, pas d'envoi réel).
- **Sous-onglets** (`Tabs` imbriqués) : Aujourd'hui / À venir (anniversaires à ≤ 14 j) /
  Historique (cartes résolues + `Batch` envoyés).
- **Carte de relance** (`RelanceCard`) : avatar + nom + contexte (type · libellé remise · « il y a
  N j ») + message cité + badge de statut + actions selon l'état :
  - `en_attente_autorisation` → **« Autoriser la remise »** (→ `autorisee`) **[SIM]** ;
  - sinon **WhatsApp** / **Email** (si canal connu) → `envoyee` **[SIM]** · **« RDV pris »**
    (anniversaire / soins) → `envoyee` **[SIM]** · **« Ignorer »** → `ignoree` **[SIM]**.
  - toute action individuelle → toast réversible unique.
- Les recommandations proposées depuis la Fiche cliente **devraient** arriver ici (non branché — cf. [SIM] 1.4).

**Envois groupés** (objet `Campagne`) :
- **Toolbar** + **« + Créer »** → `CampaignFormDialog` (titre\*, message\* avec variable
  `{prenom}`, audience via `RadioGroup` : Toutes / VIP & Gold / Venues ce mois / Inactives) **[OK local]**.
- **Liste de cartes** : titre + badge statut (brouillon / planifiée / envoyée) + message tronqué +
  « Audience · … ».
  - **« Envoyer »** (si pas déjà envoyée) → passe `envoyee`, calcule un **rapport par
    destinataire** (`sent` / `failed`, nombre d'échecs déterministe par titre) **[SIM]** ;
  - échecs > 0 → `Alert` « X envoyés, Y échoués » + **« Réessayer les échecs »** **[SIM]** ;
  - **« Modifier »** → `CampaignFormDialog` en édition **[OK local]** ;
  - **poubelle** → `ConfirmDialog` → retire la campagne **[OK local]**.

**Contenu conseillère** :
- **Pills famille** (dérivées des conseils) + **« Ajouter un conseil »** → `BeautyTipFormDialog`
  (famille\*, titre\*, description\* — validation inline sur chaque champ requis) **[OK local]**.
- **Liste** : famille (label) + titre + corps + **crayon** (édition) + **poubelle**
  (`ConfirmDialog`) **[OK local]**.
- **Manquant vs `USERFLOW.md`** : les « délais et textes de relance par prestation » (cycle J+N)
  ne sont pas implémentés — seuls les conseils par famille existent.

### 1.7 Catalogue (`/catalogue`) — 2 volets (`Tabs`)

**Styles** :
- **Toolbar** + filtre par catégorie (Toutes / Coiffure / Ongles / Soin visage / Massage) **[OK]**.
- **Grille de cartes** (4 col.) : vignette (icône de catégorie sur fond rose), badge « Tendance »,
  nom tronqué, prix **[OK]** ; clic → `StyleDetailDialog`.
- **Détail style** : vignette agrandie, nom, prix, badge tendance, **« Fermer »** — aucune autre
  action, **aucun lien vers le panier** (décision : le Catalogue ne touche jamais l'encaissement).
- État vide si catégorie sans style → « Choisissez une autre catégorie ».

**Photos de référence** :
- **Pills catégorie** (Coiffure / Coloration / Ongles / Soins visage) + grille de **6 emplacements**.
- **`FileUpload`** par emplacement : ajout (`FileList`), rejet inline si `!image/*`
  (« Format non pris en charge ») ou > 5 Mo (« Image trop grande, 5 Mo maximum ») **[OK]** ;
  retrait remet l'emplacement à vide **[OK]**. Aucune persistance.
- **Manquant vs `USERFLOW.md`** : le sélecteur « Entreprise concernée » n'est pas rendu (1 seule
  entreprise) — conforme, à noter.

### 1.8 Ce que ces sections partagent

- **Recherche cliente** : mécanisme unique (`ClientSearchField` / `searchClients`) réutilisé
  Comptoir + formulaire rendez-vous + (indirectement) Répertoire.
- **Confirmation destructrice** : `ConfirmDialog` unique (annuler un rendez-vous, supprimer une
  campagne / un conseil, valider la tournée).
- **Toast réversible** : `Toast` + action « Annuler » (tournée, actions individuelles de relance).
- **État vide** : `EmptyState` unique.
- **Store** : tout est mock en mémoire (`useAppStore`) — un refresh réinitialise tout. Les
  rendez-vous portent `saleId?` (relation « En cours » vers une `Vente`, pas un statut).

### 1.9 Écarts et incohérences à corriger dans la refonte

1. **`/equipe` double la vue Équipe du Planning** — deux chemins, un seul objet (le roster).
2. **Sélecteurs Entreprise / Salon cosmétiques** sur le Planning — filtrent rien.
3. **« Proposer » (Fiche cliente) ne crée pas de `Relance`** — la boucle Clientèle → Relances est
   annoncée mais pas branchée dans le store.
4. **Relance vit en état local au composant** (`TourneeMatinTab`) — rien ne persiste entre écrans,
   la Fiche cliente lit `RELANCES` (le seed) et non l'état courant.
5. **`Tabs` imbriqués** dans la Tournée du matin (volet + sous-vues) — deux mécanismes de
   navigation empilés.
6. **Grille de Planning figée sur « aujourd'hui »** — naviguer d'une semaine n'affiche jamais rien
   (limite de mock, pas du flow, mais l'écran doit le dire honnêtement plutôt que montrer un vide muet).
7. **« Cycles & conseils par prestation » (J+N)** annoncés dans `USERFLOW.md`, absents du code.
8. **Abonnement** : section toujours vide (le modèle ne le porte pas) — la garder honnête.

---

## 2. Nouveau userflow (breadboards)

*Reconstruit à partir des job stories, notation Shape Up. Chaque lieu est nommé, chaque
affordance a une destination, chaque état d'échec / vide / annulation est une étape. Aucune
prescription visuelle ici — elle vit dans `DESIGN.md`.*

### 2.0 Principe transversal de la refonte : **le tableau du jour**

Un poste de comptoir répond toute la journée à une seule question — *qui, quand, quoi ensuite*.
Chaque section devient donc **un tableau qui se classe tout seul par le temps et retient ses
lignes tant qu'on ne les a pas traitées** :

- une **ligne** (lane) par élément, sur un rail de légende (heures / lettres / noms) ;
- un **jeton d'état** qui bascule mécaniquement au changement (`PRÊT` → `ENVOYÉ`, `EN ATTENTE` →
  `CONFIRMÉ`, `EN POSTE` → `ABSENTE`) — jamais la couleur seule ;
- **un seul signal** — l'ambre — pour *ce qui a changé / maintenant / demande une décision* :
  il pulse une fois puis **tient** un liseré sur la ligne jusqu'à ce qu'on l'ait vue ;
- les lignes **se reclassent sur place** (elles ne disparaissent pas pour réapparaître ailleurs).

### 2.1 Section Planning

*Job stories : « une cliente appelle pour décaler / annuler / prendre un rendez-vous » (rare) ·
« une praticienne est absente aujourd'hui, il faut le signaler » · « je veux voir la semaine et
qui est disponible ».*

```
Le Tableau du Planning  (la section — un seul tableau, la sous-page Équipe y est fondue comme rail)
- bandeau : nom de section · jour affiché en toutes lettres · « Aujourd'hui » (seulement si on a navigué ailleurs) → revient au jour réel
- « Nouveau rendez-vous » → Éditeur de rendez-vous (vide)
- strip de semaine : ◀/▶ + 7 jours → change le jour affiché
- réglage « Afficher les annulés » → les rendez-vous annulés restent sur le tableau, atténués et barrés
- rail de légende = les heures OU, replié, l'équipe :
    - basculer « Par praticienne / Toute l'équipe » → regroupe les lignes autrement (même données)
    - chaque en-tête de praticienne porte un jeton EN POSTE / ABSENTE + un menu :
        - « Voir seule » → le tableau ne garde que ses lignes ; « Voir tout le monde » annule
        - « Marquer absente aujourd'hui » → jeton bascule ABSENTE ; ses rendez-vous du jour prennent un liseré ambre + jeton « ABSENTE »
- ligne de rendez-vous (positionnée par l'heure) : cliente · prestation · jeton EN ATTENTE / CONFIRMÉ / EN COURS / ANNULÉ
    - taper la ligne → Fiche rendez-vous (complète)
    - taper une plage vide du rail → Éditeur de rendez-vous (praticienne + heure pré-remplies)
[ jour affiché sans données parce que le mock ne couvre qu'aujourd'hui → le tableau le dit franchement (« Aucun rendez-vous ce jour-là »), pas un vide muet ]
[ personne ne travaille le jour affiché → « Personne au planning ce jour-là » + « Ouvrir l'équipe » ]

Fiche rendez-vous  (le détail — ouverte depuis le Tableau du Planning OU la Chronologie de l'Accueil)
- rappel : cliente (+ tier, points si fiche liée) · heure–fin · prestation + prix · praticienne (+ ABSENTE)
- « Confirmer » (si EN ATTENTE) → jeton bascule CONFIRMÉ, reste sur la Fiche
- « Encaisser » (si pas ANNULÉ) → Comptoir déployé, onglet pré-rempli (cliente + prestation) ; déjà une vente ouverte → « Voir la vente en cours » rebascule sur l'onglet existant
    - praticienne marquée ABSENTE et pas encore de vente → Choix de la remplaçante (bloquant) → Comptoir
- version **Planning** seulement : « Décaler / modifier » → Éditeur · « Annuler » → Confirmation
- version **Accueil** : lecture + « Confirmer » + « Encaisser » seulement (jamais Décaler / Annuler)
[ « Annuler » alors qu'une vente est ouverte pour ce rendez-vous → la Confirmation le dit (« un onglet de vente restera ouvert »), l'annulation ne ferme pas l'onglet ]

Éditeur de rendez-vous  (création / modification — depuis « Nouveau rendez-vous », une plage vide, ou « Décaler »)
- Cliente* (recherche unique — « Ajouter … comme nouvelle cliente » si zéro résultat)
- Prestation* (renseigne la durée par défaut tant qu'on ne l'a pas changée à la main)
- Praticienne* (seulement celles qui travaillent le jour affiché)
- Heure de début* (les créneaux déjà pris de cette praticienne sont visibles mais non sélectionnables)
- Durée* · Statut (En attente / Confirmé)
- « Enregistrer » → conflit de chevauchement détecté à l'enregistrement → message inline, rien n'est perdu ; sinon retour au Tableau, la ligne apparaît / se reclasse
- « Annuler » → retour au Tableau sans rien changer

Choix de la remplaçante  (bloquant — « Encaisser » sur un rendez-vous d'une praticienne absente)
- « {praticienne} est absente aujourd'hui. Qui a réalisé la prestation ? » → liste des praticiennes présentes du même rôle
- aucune candidate → message + « Ajoutez une disponibilité en équipe », pas d'ouverture du Comptoir
- « Ouvrir le Comptoir » → onglet pré-rempli, la vente est attribuée à la remplaçante, le rendez-vous du jour reflète ce choix
```

**Ce qui change vs l'existant** : `/equipe` n'est plus une page à part — le roster est le rail de
légende du tableau (statut + menu par praticienne) ; l'URL `/equipe` reste un raccourci qui ouvre
le tableau avec le rail déplié sur l'équipe. Les sélecteurs Entreprise / Salon disparaissent (1
entreprise, données non taguées salon — décision ouverte si un vrai multi-salon arrive). La grille
figée sur « aujourd'hui » assume sa limite à l'écran.

### 2.2 Section Clientèle

*Job stories : « une cliente est au comptoir / au téléphone, la retrouver vite » · « ouvrir sa
fiche pour lire son historique / sa fidélité / ses préférences avant ou pendant que je la sers » ·
« mettre à jour ses coordonnées, ajouter une note » · « créer une nouvelle cliente » · « lui
recommander un style » · « lui envoyer sa carte de fidélité ».*

```
Le Répertoire  (la section — recherche d'abord)
- ligne de recherche en tête (mécanisme unique : nom ou téléphone)
- « + Nouvelle cliente » → Nouvelle cliente
- recherche vide → deux petits tableaux : VUES RÉCEMMENT · ATTENDUES AUJOURD'HUI (accès direct à la fiche)
- en dessous, l'annuaire complet : filtres Toutes / Nouvelles / Historique / VIP → lignes cliente (nom · tier · visites · total dépensé)
- taper une ligne → La Fiche
[ recherche sans résultat → « Aucune cliente pour "…" » + « Créer "…" comme nouvelle cliente » (pré-remplie de la saisie) ]
[ annuaire filtré vide → « Réinitialiser les filtres » ]

La Fiche  (le tableau d'une cliente — bandeau d'identité qui reste visible + plaques d'information)
- bandeau collant : nom · tier · « cliente depuis … » · « Nouvelle vente » (→ Comptoir, cliente sélectionnée) · « Contacter » (désactivé + raison si aucune coordonnée)
- VALEUR : total dépensé · visites · points fidélité · dernière visite
- RELANCES OUVERTES : lignes (type + message) → « Voir la tournée » ouvre la section Relances ; vide → dit qu'il n'y a rien de prévu
- NOTES : journal horodaté persistant + champ d'ajout (un seul point d'entrée)
- RECOMMANDATIONS : lignes de style → taper ouvre Détail style (lecture, sans quitter la fiche) ; « Proposer » → **crée réellement une carte dans la Tournée du matin** + toast réversible (ambre)
- CARTE DE FIDÉLITÉ : QR (motif démo) · « Imprimer la carte » · « Ouvrir » → Carte de fidélité
- COORDONNÉES : téléphone / WhatsApp / email / profession / adresse (+ praticienne préférée → Tableau du Planning filtré) · « Modifier » (édition inline)
- PRÉFÉRENCES BEAUTÉ : type de cheveux / couleur / peau / préférences · « Modifier » ; vide → invite à renseigner le profil
- ABONNEMENT : section toujours présente, état vide honnête (le modèle ne porte pas encore d'abonnement)
[ id cliente inconnu → tableau d'erreur explicite + « Retour au répertoire » (jamais la fiche du 1ᵉʳ mock) ]

Nouvelle cliente  (formulaire — depuis le Répertoire OU depuis le Comptoir)
- Identité : Prénom* · Nom* · Téléphone* · WhatsApp · Email · Adresse · Profession · Anniversaire (vrai sélecteur de date)
- Profil beauté : type de cheveux · référence couleur · notes peau · préférences
- doublon sur le téléphone → avertissement inline + « Voir la fiche existante » ; « Créer quand même » reste possible (foyer, famille)
- « Créer » → persiste → La Fiche ; ouvert depuis le Comptoir → retour au Comptoir, cliente déjà sélectionnée

Carte de fidélité  (plein tableau — depuis « Ouvrir » sur la Fiche)
- la carte (nom · points · tier · QR démo)
- « Envoyer sur WhatsApp » / « Envoyer par email » (désactivés + raison si coordonnée absente)
- « Télécharger » → génère réellement un fichier image
- « Imprimer » → dédié à la carte
```

**Ce qui change vs l'existant** : la fiche n'est plus deux colonnes de prose (« le maintenant » /
« la référence ») mais un tableau de plaques étiquetées, toutes lisibles d'un coup d'œil, le
bandeau d'identité collé en tête. « Proposer » une recommandation **crée vraiment** une `Relance`
(la boucle Clientèle → Relances est branchée dans le store). Les relances ouvertes affichées sur
la fiche lisent l'état courant, pas le seed.

### 2.3 Section Relances

*Job stories : « chaque matin, vider la pile — passer chaque message en revue, envoyer / ignorer,
puis envoyer le lot » · « autoriser une remise de reconquête » · « une recommandation venue d'une
fiche a atterri ici » · « préparer / envoyer un envoi groupé et voir le rapport » · « tenir le
contenu de la conseillère » (rare).*

```
Relances  (la section — 3 volets, défaut : La Tournée)
- volets : La Tournée du matin · Envois groupés · Contenu conseillère

La Tournée du matin  (un tableau de départs de messages)
- bandeau : compteur « à traiter » (recalculé depuis les lignes affichées) + « Valider & envoyer » → Confirmation → le tableau bascule d'un coup ; toast réversible
- réglage de vue : Aujourd'hui / À venir / Historique (une même barre, pas des onglets dans des onglets)
- ligne de relance : cliente · type (anniversaire / soin / fidélité / reconquête / recommandation) · message cité · jeton PRÊT / ENVOYÉ / IGNORÉ / AUTORISATION REQUISE / AUTORISÉE
    - actions sur la ligne : WhatsApp · Email (si canal connu) · « RDV pris » (anniversaire / soin) · « Ignorer » — chacune → jeton bascule + toast réversible unique
    - ligne de reconquête non autorisée : « Autoriser la remise » possible indépendamment de l'état du lot
- Historique : les tournées déjà envoyées (date + nombre) + les cartes résolues
[ « Valider & envoyer » alors qu'une reconquête n'est pas autorisée → cette ligne reste dans la tournée du lendemain, jamais envoyée sans sa remise ]
[ aucune ligne à traiter → « Tournée à jour » ]

Envois groupés  (objet Campagne — un tableau de campagnes)
- « + Créer » → Éditeur de campagne (titre* · message* avec variable {prenom} · audience calculée par critère)
- ligne de campagne : titre · jeton BROUILLON / PLANIFIÉE / ENVOYÉE · audience · message tronqué
    - « Envoyer » (si pas ENVOYÉE) → rapport par destinataire (« 42 envoyés · 3 échoués — Réessayer les échecs »), jamais un statut global qui masque des échecs
    - « Modifier » → Éditeur de campagne · « Supprimer » → Confirmation

Éditeur de campagne  (création / édition)
- Titre* · Message* (aide : {prenom}) · Audience (Toutes / VIP & Gold / Venues ce mois / Inactives 3 mois +)
- « Enregistrer » → retour au tableau, la ligne apparaît ; « Annuler » → retour sans rien changer

Contenu conseillère  (l'index — volet rare, visuellement secondaire)
- Conseils par famille de soin : filtre par famille · « Ajouter » / « Modifier » (validation inline) · « Supprimer » → Confirmation
- (à venir, non bloquant) délais et textes de relance par prestation — annoncé, marqué « bientôt » plutôt qu'un faux écran
```

**Ce qui change vs l'existant** : les sous-vues de la Tournée deviennent un réglage de vue sur le
bandeau du tableau, plus des onglets imbriqués. « Proposer » depuis la Fiche cliente alimente
réellement ce tableau. Le reste du parcours est conforme à `USERFLOW.md` v2.1.

### 2.4 Section Catalogue

*Job stories : « montrer un style / un résultat à une cliente » · « en recommander un depuis sa
fiche » · « tenir la banque de photos de référence » (rare).*

```
Catalogue  (la section — 2 volets : Les Planches · Photos de référence — jamais de lien vers l'encaissement)

Les Planches  (l'index de planches — styles signature)
- filtre par catégorie
- planche numérotée : visuel · nom · prix · marqueur TENDANCE
- taper une planche → Détail planche (visuel agrandi · nom · prix · tendance · « Fermer » — aucune autre action)
[ catégorie sans planche → « Choisissez une autre catégorie » ]

Détail planche  (dialogue — depuis Les Planches OU une recommandation en Fiche cliente)
- visuel · nom · prix · TENDANCE · « Fermer »

Photos de référence  (le tableau d'emplacements — rare)
- filtre par catégorie (Coiffure / Coloration / Ongles / Soins visage)
- emplacement : vide → ajouter un fichier ; rempli → aperçu + retirer
- fichier refusé (mauvais format / > 5 Mo) → message inline immédiat avec la limite, jamais un emplacement bloqué en chargement
```

**Ce qui change vs l'existant** : présentation en index de planches numérotées (repère durable),
sinon parcours conforme.

---

## 3. Tableau de couverture (rien de perdu)

| Fonctionnalité (inventaire §1) | Nouveau lieu |
|---|---|
| Sélecteur de semaine, « Aujourd'hui » | Tableau du Planning — bandeau + strip de semaine |
| Bascule Grille / Équipe | Tableau du Planning — regroupement des lignes + rail de légende |
| Sélecteurs Entreprise / Salon (cosmétiques) | Retirés (décision ouverte si multi-salon réel) |
| Afficher les annulés | Tableau du Planning — réglage, lignes barrées atténuées |
| Filtre praticienne (`?staff=`) | Tableau du Planning — « Voir seule » sur l'en-tête de praticienne |
| Grille horaire, clic case vide, clic bloc | Tableau du Planning — lignes positionnées, plage vide → Éditeur, ligne → Fiche rendez-vous |
| Nouveau rendez-vous | Tableau du Planning — action de bandeau → Éditeur de rendez-vous |
| Détail rendez-vous (Confirmer / Encaisser / Modifier / Annuler) | Fiche rendez-vous (version Planning) |
| Détail rendez-vous lecture depuis l'Accueil | Fiche rendez-vous (version Accueil) |
| Formulaire rendez-vous + détection de conflit | Éditeur de rendez-vous |
| Garde praticienne absente → remplaçante | Choix de la remplaçante (bloquant) |
| Équipe : filtre rôle, carte membre, marquer absente, ouvrir planning filtré | Rail de légende du Tableau du Planning (`/equipe` = raccourci) |
| Recherche cliente, listes contextuelles, annuaire filtré | Le Répertoire |
| Nouvelle cliente + doublon téléphone | Nouvelle cliente |
| Fiche : identité, valeur, relances, notes, recommandations, carte, coordonnées, préférences, abonnement | La Fiche (plaques étiquetées) |
| « Proposer » une recommandation | La Fiche → crée une `Relance` dans La Tournée du matin |
| Carte de fidélité (WhatsApp / Email / Télécharger / Imprimer) | Carte de fidélité |
| Tournée du matin : bandeau, sous-vues, cartes, actions, valider & envoyer | La Tournée du matin |
| Envois groupés : créer / modifier / supprimer / envoyer / rapport | Envois groupés + Éditeur de campagne |
| Contenu conseillère : conseils par famille (CRUD) | Contenu conseillère |
| Cycles & conseils par prestation (J+N) | Contenu conseillère — annoncé « bientôt » (jamais implémenté avant) |
| Catalogue Styles : filtre, grille, détail | Les Planches + Détail planche |
| Catalogue Photos : emplacements, upload, rejet de fichier | Photos de référence |

---

## 4. Décisions actées par cette refonte

- **Langage visuel « Le Tableau »** — voir `DESIGN.md` réécrit et `docs/adr/0005`. Ne garde de
  l'ancien système que la palette b&co (rose / taupe / crème), Cabinet Grotesk et le logo.
- **Équipe fondue dans le Planning** — le roster est le rail de légende ; `/equipe` devient un
  raccourci vers le tableau, rail déplié sur l'équipe.
- **`Relance` promue dans le store** — un slice `relances` réel : la Fiche cliente et La Tournée
  lisent le même état, « Proposer » crée réellement une carte, l'undo est réel.
- **Sélecteurs Entreprise / Salon retirés du Planning** — cosmétiques, non branchés. À réintroduire
  seulement avec un vrai modèle multi-salon.
- **Sous-vues de la Tournée = réglage de vue**, plus des onglets imbriqués.
- **Catalogue = index de planches numérotées**.

## 5. Décisions restées ouvertes

- Multi-salon réel (filtrage des rendez-vous et de l'équipe par salon).
- Grille de Planning au-delà d'« aujourd'hui » (dépend d'un vrai modèle de rendez-vous daté).
- Cycles de relance par prestation (J+N) — modèle + écran.
- Envoi réel des messages (WhatsApp / email) — tournée, campagnes, propositions.
- QR réel vs motif démo.
- Abonnement cliente — modèle absent.
