# Userflow Point de vente — Partie 1/3

> Analyse séquentielle des captures Figma exportées le 24/08/2026 (22 captures, de 10.00.15 à 10.06.34). L'app observée est un dashboard "ELITE privé — Beauty and Co" (salon de beauté). Structure générale commune à tous les écrans : sidebar de navigation fixe à gauche + zone de contenu principale à droite (parfois complétée d'une colonne "panier" à droite lors de la vente).

---

## Structure commune : Sidebar de navigation

Présente et identique sur la quasi-totalité des écrans (sauf modales plein-écran type Paiement/Nouvelle Vente qui la conservent aussi en fait). À documenter une fois, référencée ensuite comme "Sidebar standard".

- **Zone logo (haut)** : icône losange/diamant centrée, puis nom de marque en grande capitale serif "ELITE", sous-titre italique "privé", puis libellé petit caps gris "BEAUTY AND CO". Séparateur horizontal sous ce bloc.
- **Navigation principale (liste verticale d'items avec icône + label)** :
  - Accueil (icône maison)
  - Planning (icône calendrier)
  - Clients (icône personnes)
  - Suivi (icône cœur/pouls)
  - Lookbook (icône étiquette cœur)
  - Stock (icône sac/boîte)
  - Parametres (icône engrenage)
  - L'item actif a un fond crème/beige clair arrondi et le texte + icône en couleur dorée/ocre ; les items inactifs sont gris.
- **Zone bas de sidebar (pied)** : séparateur, puis bloc utilisateur = avatar rond initiales ("PE") cerclé doré + nom "Proprietaire Elite" + libellé petit caps "ADMIN". En dessous, lien "Deconnexion" (icône logout). Tout en bas, mention petite taille grise "ELITE PRIVE v1.0".
- Largeur sidebar ~19% de l'écran, fond blanc cassé, bordure verticale fine séparant du contenu.

---

## 1. Accueil / Tableau de bord

**Fichier source** : Capture d'écran 2026-08-24 à 10.00.15.png

**Structure de layout**
- Sidebar standard à gauche.
- Colonne principale : header en haut (avatar + libellé rôle + nom + cloche de notification alignée à droite), puis titre de bienvenue, puis empilement vertical de blocs pleine largeur : bandeau CTA principal, bandeau CTA secondaire, section "Performance du jour" (grille 2 colonnes de cartes), section "Actions rapides" (grille 3 colonnes de cartes).
- Pas de colonne latérale droite sur cet écran (contenu prend toute la largeur restante).

**Composants et contenu**
- Header : avatar rond initiales "PE" cerclé doré, libellé petit caps gris "ADMIN", nom en gras "Proprietaire Elite", icône cloche de notification en haut à droite.
- Titre serif "Bonjour, Proprietaire".
- **Bandeau "Nouvelle Vente"** (carte pleine largeur, fond brun foncé/olive, texte clair) : icône carte de paiement dans pastille arrondie à gauche, titre "Nouvelle Vente" en gras, sous-titre "Demarrer une nouvelle transaction". Toute la carte semble cliquable (CTA principal).
- **Bandeau "Scanner un client"** (carte pleine largeur, fond beige clair plus doux) : icône QR code dans pastille, titre "Scanner un client", sous-titre "QR code carte de fidelite".
- **Section "Performance du jour"** (titre serif) : 2 cartes côte à côte
  - Carte "REVENUS" (libellé petit caps + icône tendance haussière) : valeur "0"
  - Carte "RDV" (libellé petit caps + icône calendrier coché) : valeur "0", sous-texte "0 ventes"
- **Section "Actions rapides"** (titre serif) : 3 cartes carrées côte à côte, chacune = icône dans pastille colorée centrée + label en dessous
  - "Recap ventes" (icône bar chart, pastille jaune pâle)
  - "Equipe" (icône ciseaux, pastille rose)
  - "Planning" (icône calendrier, pastille beige/grise)

**Navigation / flow**
- Clic sur "Nouvelle Vente" → écran "Nouvelle Vente" (capture suivante 10.00.31).
- Clic sur "Scanner un client" → modale "Scanner QR Client" (voir capture 10.04.08, probablement accessible depuis cet écran).
- Items sidebar mènent vers Planning, Clients, Suivi, Lookbook, Stock, Parametres.

**Détails visuels notables**
- Cartes à coins très arrondis (radius généreux, ~16-20px), fond blanc sur fond de page beige clair.
- Hiérarchie typographique claire : titres en police serif (élégante, style "editorial"), corps de texte et labels en police sans-serif.
- Bandeaux CTA avec ombre portée légère, contraste fort (bandeau sombre en premier = action prioritaire).
- Densité d'info faible sur cet écran (accueil = point d'entrée simple, résumé chiffres à 0).

---

## 2. Nouvelle Vente — Sélection de catégorie de services

**Fichier source** : Capture d'écran 2026-08-24 à 10.00.31.png

**Structure de layout**
- Sidebar standard à gauche.
- Colonne centrale (contenu principal, ~65% largeur) : header avec bouton retour + titre, onglets de "ventes" (multi-panier), champ sélection client, toggle Services/Produits, barre de recherche, grille de catégories (3 colonnes) puis liste de sous-catégories/produits qui apparaît en dessous par scroll.
- Colonne droite fixe : carte "Panier" (résumé de la vente en cours), visible en permanence pendant tout le flow de vente.

**Composants et contenu**
- Header : flèche retour "←", titre serif "Nouvelle Vente", icône appareil photo à droite (probablement pour associer une photo/facture).
- Barre d'onglets de vente : pastille active dorée "Vente 1", bouton rond "+" pour ajouter une nouvelle vente (multi-transaction en parallèle).
- Champ "Sélectionner un client *" : bouton pleine largeur en pointillés dorés avec icône silhouette, astérisque = requis.
- Toggle à 2 onglets : "Services" (actif, fond doré) / "Produits" (inactif).
- Barre de recherche "Rechercher un service..." avec icône loupe.
- **Grille de catégories de services** (3 colonnes x 2 lignes + 1 carte solo), chaque carte = icône ciseaux colorée + nom catégorie en gras + compteur "X services" :
  - Coiffure — 8 services (fond jaune pâle)
  - Spa & Massages — 4 services (fond rose pâle)
  - Epilation — 6 services (fond violet pâle)
  - Cils & Sourcils — 6 services (fond vert pâle)
  - Manucure / Pedicure — 7 services (fond bleu pâle)
  - Soins Visage — 6 services (fond orange pâle)
  - Nail art — 0 services (fond rose)
- Sous cette grille, en scroll : bandeau catégorie "✂ Coloration & Mèches (3)" avec chevron, puis cartes de services individuels visibles partiellement : "Balayage californien", "Coloration racines", "Décoloration complète" (prix coupés en bas de capture).
- Colonne droite : carte "Panier (0)" avec icône caddie, message centré "Panier vide".

**Navigation / flow**
- Retour "←" → probablement Accueil.
- Clic sur "Sélectionner un client" → ouvre modale de sélection client (capture 10.00.38).
- Clic sur une catégorie → filtre/affiche les services de cette catégorie (voir capture 10.01.06, après sélection client, catégories affichées sous forme d'onglets pill "Tous / Coupes / Soins cheveux / ...").
- Le "+" à côté de "Vente 1" permet de créer "Vente 2" (voir capture 10.01.27) = gestion multi-panier simultanée.

**Détails visuels notables**
- Cartes catégories très colorées (pastel), coins arrondis, icône + titre + sous-texte empilés verticalement, alignement centré.
- Carte panier toujours visible à droite = pattern "panier persistant" pendant tout le tunnel de vente.
- Champ client en pointillés = affordance "à remplir", style formulaire incomplet.

---

## 3. Modale — Sélectionner un client

**Fichier source** : Capture d'écran 2026-08-24 à 10.00.38.png

**Structure de layout**
- Modale centrée en overlay sur l'écran "Nouvelle Vente" (fond assombri/floutté derrière).
- Modale = carte blanche verticale : header (titre + bouton fermer), barre de recherche, 2 boutons d'action côte à côte, puis liste scrollable de clients.

**Composants et contenu**
- Header modale : titre serif "Sélectionner un client", bouton fermer "✕" à droite.
- Champ recherche : "Rechercher par nom ou téléphone..." avec icône loupe, bordure dorée (focus).
- 2 boutons côte à côte : "📷 Scanner QR" (fond beige clair) et "👤+ Nouveau" (bordure pointillée dorée, fond transparent).
- **Liste de clients** (lignes horizontales, avatar initiales à gauche + nom + téléphone/points à droite, badges de statut optionnels) :
  - AT — Awa Test — +221781208686 · 180 pts
  - FT — Fatou Test — +221781208686 · 0 pts
  - CT — Coumba Test — +221781208686 · 75 pts
  - BT — Bineta Test — +221781208686 · 25 pts
  - MT — Mariam Test — +221781208686 · 0 pts
  - AN — Awa Niang — badge "VIP" (doré) — +221 78 100 00 05 · 1175 pts
  - (coupé) Sokhna Ndiaye — badge "GOLD"

**Navigation / flow**
- Clic sur un client de la liste → sélectionne le client et ferme la modale, retour à "Nouvelle Vente" avec client affiché (capture 10.01.06).
- Bouton "Scanner QR" → ouvre le scanner caméra (cf. capture 10.04.08, modale "Scanner QR Client").
- Bouton "Nouveau" → mène probablement au formulaire "Nouveau Client" (capture 10.06.07).
- "✕" → ferme la modale sans sélection.

**Détails visuels notables**
- Modale à coins arrondis, ombre portée forte pour la détacher du fond.
- Badges de statut client (VIP, GOLD) en pastille colorée avec texte petit caps gras — pattern de fidélité/segmentation client réutilisé ailleurs.
- Liste avec scrollbar visible à droite, séparateurs implicites par espacement entre lignes.

---

## 4. Nouvelle Vente — Client sélectionné, catalogue de services (recherche par catégorie détaillée)

**Fichier source** : Capture d'écran 2026-08-24 à 10.01.06.png

**Structure de layout**
- Identique à l'écran 2 (Nouvelle Vente), mais le bloc "Sélectionner un client" est remplacé par une carte client sélectionné, et la navigation catégories devient une barre d'onglets horizontale scrollable ("pills") avec un bouton retour "‹ Catégories".

**Composants et contenu**
- Barre onglet vente : "Vente 1" (pas encore de compteur badge).
- **Carte client sélectionné** : avatar initiales "AT" + nom "Awa Test" + "+221781208686 · 180 pts" à gauche, lien texte rouge "Retirer" à droite (permet de désassocier le client).
- Toggle "Services" (actif) / "Produits".
- Barre recherche "Rechercher un service...".
- Lien "‹ Categories" (retour à la grille de catégories).
- **Barre de filtres pill horizontale** : "Tous" (actif, fond doré), "Coupes", "Soins cheveux", "Coloration & Mèches", "Coiffure" (coupé, scrollable horizontalement).
- **Grille de services** (3 colonnes) — chaque carte = nom du service en gras + prix en doré en dessous :
  - Brushing — 10 000 F
  - Coloration — 35 000 F
  - Coupe femme — 15 000 F
  - Lissage bresilien — 75 000 F
  - Tissage — 50 000 F
  - Tresse — 45 000 F
- Colonne droite : "Panier (0)" — "Panier vide".

**Navigation / flow**
- Clic sur une carte service → ajoute l'item au panier (voir capture suivante avec panier rempli).
- "Retirer" → désélectionne le client, revient au champ "Sélectionner un client".
- "‹ Categories" → retourne à la grille de catégories (écran 2).

**Détails visuels notables**
- Cartes de service : layout simple 2 lignes (nom + prix), sans icône, coins arrondis, fond blanc.
- Prix systématiquement en couleur dorée/accent pour le distinguer du nom (hiérarchie prix visuellement mise en avant).
- Filtres "pill" horizontaux avec l'actif en fond plein doré, les inactifs en contour fin gris clair.

---

## 5. Panier — Articles ajoutés (récapitulatif de vente)

**Fichier source** : Capture d'écran 2026-08-24 à 10.01.12.png

**Structure de layout**
- Même structure 2 colonnes que précédemment (catalogue à gauche/centre, panier à droite), mais le panier est maintenant rempli et devient le focus.
- Carte panier : liste d'articles empilés, puis champ remise, puis récap sous-total/total, puis CTA de validation pleine largeur en bas.

**Composants et contenu**
- Onglet vente : "Vente 1" avec badge compteur "3" (nombre d'articles).
- Carte client : "Awa Test" / "+221781208686 · 180 pts" / lien "Retirer".
- **Carte "Panier (3)"** (icône caddie) :
  - Ligne article "Brushing" — sous-texte "10 000 F" — stepper quantité (− 1 +) — prix total ligne "10 000" — icône poubelle rouge. Sous la ligne : sélecteur déroulant "✂ Proprietaire" (praticien assigné à la prestation).
  - Ligne article "Tissage" — "50 000 F" — stepper (1) — "50 000" — poubelle. Sélecteur "✂ Proprietaire".
  - Ligne article "Coupe femme" — "15 000 F" — stepper (1) — "15 000" — poubelle. Sélecteur "✂ Proprietaire".
  - Champ "🏷 Remise / Code promo" (repliable).
  - Résumé : "Sous-total 75 000 F", "Total 75 000 F" (Total en plus gros caractère serif).
  - Bouton CTA pleine largeur doré : "Encaisser 75 000 F".

**Navigation / flow**
- Stepper +/- ajuste quantité par ligne ; icône poubelle supprime la ligne.
- Sélecteur "Proprietaire" par ligne → probablement pour assigner le/la praticien(ne) ayant réalisé la prestation (lien avec équipe/planning).
- Clic sur "Remise / Code promo" → déplie le panneau de remise (voir capture 10.01.54).
- Clic sur "Encaisser 75 000 F" → mène à l'écran "Paiement" (capture 10.02.02).

**Détails visuels notables**
- Chaque ligne de panier a 2 niveaux : ligne produit (nom/prix/qty/suppr) + ligne méta en dessous (assignation praticien) — pattern "carte article extensible".
- Total mis en avant avec typographie serif plus grande que le reste (accent éditorial cohérent avec le header "Bonjour" et "Nouvelle Vente").
- Bouton CTA occupe toute la largeur de la colonne panier, reprend le montant exact à payer dans son label (feedback direct).

---

## 6. Nouvelle Vente — Gestion multi-ventes (onglet "Vente 2")

**Fichier source** : Capture d'écran 2026-08-24 à 10.01.27.png

**Structure de layout**
- Identique à l'écran 2 (grille de catégories), la différence porte uniquement sur la barre d'onglets de vente en haut.

**Composants et contenu**
- Barre d'onglets vente : "Vente 1" avec badge "3" (inactif, fond clair) + "Vente 2" (actif, fond doré, avec bouton "✕" pour fermer cet onglet) + bouton rond "+" pour ajouter encore une vente.
- Le reste de l'écran redevient l'état initial : champ "Sélectionner un client *" vide, grille de catégories de services, panier "(0)" / "Panier vide" à droite.

**Navigation / flow**
- Permet de gérer plusieurs transactions/clients en parallèle sur un même poste de caisse (ex: plusieurs clients servis simultanément par différents praticiens) sans perdre l'état de "Vente 1".
- Clic sur un onglet "Vente X" → bascule le panier/catalogue affiché sur cette vente.
- "✕" sur l'onglet → ferme/annule cette vente.

**Détails visuels notables**
- Pattern "tabs" façon navigateur web (onglets avec bouton de fermeture individuel + bouton d'ajout global) — fort signal pour l'architecture d'état (plusieurs paniers actifs en mémoire).

---

## 7. Panier — Remise, code promo, points fidélité, code manager

**Fichier source** : Capture d'écran 2026-08-24 à 10.01.54.png

**Structure de layout**
- Vue scrollée de la colonne panier de droite (suite de l'écran 5), catalogue de services visible en fond à gauche (scrollé lui aussi, autre catégorie "Coloration & Mèches" / "Manucure / Pedicure" visible).
- Le panneau panier affiche désormais le détail complet des options de remise/fidélité, empilées verticalement.

**Composants et contenu**
- Fin de la liste d'articles ("Tissage", "Coupe femme" visibles, avec sélecteur "✂ Proprietaire" sous chacun).
- Champ "🏷 Remise / Code promo" (label).
- Sous-champ "🏷 Code promo" avec input pré-rempli "PROMO20" + bouton rond doré "OK".
- Sous-section "⭐ Points fidélité (180 pts)" : slider horizontal (curseur bleu) + valeur numérique "0" affichée à droite, texte d'aide "100 pts = 1 000 FCFA" (taux de conversion points → remise).
- Sous-champ "🔑 Code remise manager" avec input pré-rempli "DISC-1234" + bouton rond "OK" (fond brun foncé, distinct du bouton doré du code promo — probablement pour signaler une action "sensible"/admin).
- Récap bas de carte : "Sous-total 75 000 F", "Total 75 000 F", CTA "Encaisser 75 000 F".

**Navigation / flow**
- Saisie d'un code promo + "OK" → applique une remise.
- Slider points fidélité → convertit tout ou partie des points du client en réduction.
- Code remise manager → nécessite probablement une autorisation spéciale (override manager) pour appliquer une remise supplémentaire hors barème.
- "Encaisser" → écran Paiement.

**Détails visuels notables**
- Trois mécanismes de remise distincts coexistent (code promo générique, points fidélité, code manager) — bonne indication qu'il faut prévoir 3 flux de réduction séparés dans la modélisation.
- Boutons "OK" ronds compacts à côté de chaque champ plutôt qu'un bouton pleine largeur — pattern de validation inline.
- Slider avec valeur numérique synchronisée (retour visuel immédiat du montant réduit, ici encore à 0 = non appliqué).

---

## 8. Paiement (sélection du mode + paiement mixte)

**Fichiers source** : Capture d'écran 2026-08-24 à 10.02.02.png, 10.02.15.png, 10.02.46.png (même écran, 3 états successifs de l'interaction)

**Structure de layout**
- Sidebar standard à gauche.
- Colonne centrale centrée (plus étroite que les écrans catalogue, ~contenu recentré) : header avec retour + titre "Paiement", carte "Total à payer", ligne client, section "Mode de paiement" (grille 2x2 de cartes), checkbox "Paiement mixte", panneau conditionnel de répartition, CTA de confirmation en bas.

**Composants et contenu**
- Header : "←" + titre centré serif "Paiement".
- Carte "TOTAL À PAYER" (libellé petit caps gris centré) : montant géant serif "75 000", sous-texte "FCFA".
- Ligne "👤 Awa Test" (client concerné par le paiement).
- Titre "Mode de paiement".
- **Grille 2x2 de modes de paiement** (cartes carrées, icône + label centrés) :
  - Wave (icône smartphone)
  - Orange Money (icône QR/grille)
  - Espèces (icône billet)
  - Carte (icône carte bancaire)
  - État par défaut (10.02.02) : aucune sélection, toutes les cartes en contour neutre.
  - État sélectionné (10.02.15, 10.02.46) : carte "Wave" avec contour doré épais + label doré = état actif/sélectionné.
- Checkbox "☐ Paiement mixte (2 méthodes)" — état coché en bleu sur 10.02.15/10.02.46, déclenchant un panneau supplémentaire.
- **Panneau paiement mixte** (carte encadrée) :
  - Sous-label "Wave" + champ montant ("Montant" placeholder vide en 10.02.15 ; rempli "10000" en 10.02.46).
  - Sous-label "2e mode de paiement" + 3 boutons pill compacts : "Orange Money", "Espèces", "Carte" (Espèces sélectionné/doré dans l'état final).
  - Champ montant du 2e mode (vide → "65000" dans l'état final).
  - Texte de validation vert en bas : "Total : 75 000 / 75 000 F ✓" (apparaît une fois la somme des 2 montants égale au total dû).
- CTA pleine largeur en bas : "Confirmer 75 000 F" (fond doré clair/désaturé quand non valide, doré plein quand valide).

**Navigation / flow**
- Sélection d'un mode simple (Wave/Orange Money/Espèces/Carte) sans coche "mixte" → active directement le CTA "Confirmer".
- Coche "Paiement mixte" → déplie le panneau de répartition en 2 montants.
- Une fois la somme des 2 montants = total, un check vert confirme la validité et active le bouton "Confirmer".
- "Confirmer" → finalise la vente (écran de succès non capturé dans ce lot, probablement retour à l'accueil ou reçu).
- "←" → retour au panier.

**Détails visuels notables**
- Carte "Total à payer" façon "hero number" : très grand chiffre serif centré, dominant visuellement l'écran.
- Cartes de mode de paiement avec icône simple ligne (outline), sélection = changement de couleur de bordure + texte (pas de remplissage plein) — pattern de sélection "léger".
- Feedback de validation textuel + couleur (vert) explicite pour le paiement mixte, évite toute ambiguïté sur le montant restant.

---

## 9. Modale — Scanner QR Client

**Fichier source** : Capture d'écran 2026-08-24 à 10.04.08.png

**Structure de layout**
- Modale centrée en overlay sur l'écran Accueil (fond assombri visible derrière : bandeaux "Nouvelle Vente"/"Scanner un client" en transparence).
- Modale verticale : header (icône + titre + fermer), zone caméra/preview avec cadre de visée centré, texte d'instruction en pied de modale.

**Composants et contenu**
- Header modale : icône appareil photo + titre "Scanner QR Client", bouton fermer "✕".
- Zone de prévisualisation caméra (image temps réel, ici un intérieur flouté/hors-sujet en capture de test) avec un **cadre de visée carré** aux coins accentués (style scanner QR classique, 4 coins en L blancs) centré sur l'image.
- Texte d'aide en bas : "Pointez la caméra vers le QR code de la carte client" (texte affiché avec artefact d'encodage "caméra" dans la capture — probablement un bug d'échappement Unicode à corriger côté implémentation, pas un élément de design voulu).

**Navigation / flow**
- Accessible depuis "Scanner un client" (Accueil) et/ou depuis "Scanner QR" (modale Sélectionner un client).
- Une fois un QR détecté → doit ramener au profil client correspondant ou pré-remplir la sélection client dans le flow de vente.
- "✕" → ferme la modale.

**Détails visuels notables**
- Overlay sombre assez prononcé pour focaliser l'attention sur la modale claire.
- Cadre de visée = pattern UI standard de scanner, coins en L blancs sur fond image caméra.
- Bug de texte à noter : caractère unicode mal échappé ("caméra" au lieu de "caméra") — signal utile pour la QA mais pas un pattern de design à reproduire.

---

## 10. Planning — Équipe (liste + filtres par rôle)

**Fichiers source** : Capture d'écran 2026-08-24 à 10.04.35.png, 10.04.43.png, 10.05.09.png, 10.05.12.png, 10.05.20.png (même écran, états de filtre successifs)

**Structure de layout**
- Sidebar standard à gauche (item "Planning" actif).
- Colonne principale : header (titre + sous-titre + date), 2 sélecteurs déroulants (entreprise / salon), sélecteur de semaine (7 jours), toggle "Équipe / Rendez-vous", barre de filtres par rôle (pills), puis grille 3 colonnes de cartes membres d'équipe.
- Bouton "Aujourd'hui" + icône calendrier en haut à droite du header (apparaît après navigation vers une autre date, absent sur le tout premier état).

**Composants et contenu**
- Titre serif "Planning", sous-titre gris "Tous les salons", date active en doré "Lundi 24 Août 2026" (puis "Mardi 8 Septembre 2026" dans les états suivants après navigation).
- 2 dropdowns : "Toutes entreprises" / "Tous salons" (état initial) → deviennent "Beauty and Co" / "Tous salons" (état filtré, bordure dorée = dropdown actif).
- Bandeau mois avec flèches "‹ Août 2026 ›" (puis "Septembre 2026").
- **Sélecteur de jours** (7 cases, format JJ + numéro) : LUN 24, MAR 25, MER 26, JEU 27, VEN 28, SAM 29, DIM 30 — jour actif en fond doré plein. Dans les états suivants, semaine du 7-13 septembre, "MAR 8" actif.
- Toggle 2 segments : "👥 Équipe" (actif, fond blanc) / "📅 Rendez-vous" (inactif, fond beige).
- **Barre de filtres rôle (pills)** : "Tous" (actif par défaut), "Coiffeuse", "Esthéticienne", "Accueil" — un seul actif à la fois (fond doré plein), change le nombre de résultats et la liste.
- Titre section "Équipe" + compteur à droite ("19 personnes" / "15 personnes" / "6 personnes" / "4 personnes" selon le filtre).
- **Grille de cartes membres** (3 colonnes), chaque carte = avatar initiales rond (avec petit point vert de statut en bas à droite) + nom en gras + badge rôle coloré (pill) + libellé "Actif" en vert aligné à droite :
  - Exemples vus : Aminata (Accueil), Bineta (Esthéticienne), Codou (Accueil), Diarra (Accueil), Fatou (Coiffeuse), Gestionnaire (Stock), Gnagna (Esthéticienne), Henry (Coiffeuse), Margha (Accueil), Marie Dominique (Esthéticienne), Michelle (Esthéticienne), Ndiole (Coiffeuse), Oumy (Coiffeuse), William (Coiffeuse), Yaye Fatou (Coiffeuse), Zeyna (Esthéticienne), Noellie (Accueil).
  - Filtre "Coiffeuse" (6 pers.) : Fatou, Henry, Ndiole, Oumy, William, Yaye Fatou.
  - Filtre "Esthéticienne" (4 pers.) : Gnagna, Marie Dominique, Michelle, Zeyna.
  - Filtre "Accueil" (4 pers.) : Codou, Diarra, Margha, Noellie.
  - Badges rôle avec couleur dédiée par métier : Accueil = bleu, Esthéticienne = rose/rouge, Coiffeuse = jaune/doré, Stock = vert.

**Navigation / flow**
- Changement de dropdown "entreprise" → filtre la liste des salons/équipe rattachée.
- Clic sur un jour → change la date affichée (et potentiellement les plannings associés, non visibles ici car vue "Équipe" statique).
- Toggle "Équipe"/"Rendez-vous" → bascule vers la vue rendez-vous (voir entrée suivante).
- Clic sur une pill de rôle → filtre la liste des membres.
- Bouton "Aujourd'hui" (apparu après navigation) → revient à la date du jour.
- Clic sur une carte membre → mène probablement à une fiche détail collaborateur / son planning (non capturé).

**Détails visuels notables**
- Petit point vert en bas à droite de l'avatar = indicateur de statut (présence/disponibilité en ligne, façon "online dot").
- Système de badges colorés par rôle très cohérent avec les couleurs de catégories services vues précédemment (paletet pastel par catégorie).
- Cartes équipe identiques en structure aux cartes clients (avatar + nom + méta), réutilisation du même pattern de "carte personne" dans toute l'app.

---

## 11. Planning — Rendez-vous (état vide)

**Fichier source** : Capture d'écran 2026-08-24 à 10.04.51.png

**Structure de layout**
- Identique à l'écran Planning (header, dropdowns, sélecteur de jours), mais toggle bascule sur "Rendez-vous" (actif) et le contenu en dessous devient une zone d'état vide centrée.

**Composants et contenu**
- Toggle : "Équipe" (inactif) / "📅 Rendez-vous" (actif, fond blanc).
- Titre section "Rendez-vous" + compteur "0 RDV" à droite.
- **État vide centré** : icône calendrier grise large, texte "Aucun rendez-vous pour ce jour", sous-texte "Lundi 24 août 2026" (répète la date sélectionnée).

**Navigation / flow**
- Retour au toggle "Équipe" → réaffiche la grille de membres.
- Changement de jour → recharge la liste de RDV (vide ici faute de données).
- Probable CTA d'ajout de RDV non visible dans cette capture (peut-être masqué par l'état vide, ou accessible ailleurs).

**Détails visuels notables**
- Pattern d'état vide classique : icône outline grande + message principal + message secondaire contextuel (date), centré verticalement dans la zone de contenu.

---

## 12. Clients — Recherche / Répertoire clients

**Fichiers source** : Capture d'écran 2026-08-24 à 10.05.29.png, 10.05.47.png (même écran, filtre "VIP" activé dans le second état)

**Structure de layout**
- Sidebar standard à gauche (item "Clients" actif).
- Colonne principale : header (titre + sous-titre + bouton d'action à droite), barre de recherche pleine largeur, rangée de 3 filtres rapides (pills), titre de section + compteur, grille 3 colonnes de cartes clients.

**Composants et contenu**
- Titre serif "Recherche Client", sous-titre gris "Trouver un client existant ou ajouter un nouveau profil.".
- Bouton CTA doré en haut à droite : "👤+ Ajouter".
- Barre de recherche : "Nom, telephone, ou email..." avec icône loupe à gauche et icône grille (vue) à droite.
- **3 filtres pill** : "👤+ Nouveaux", "🕐 Historique", "▤ VIP" — un seul actif à la fois (VIP actif dans 10.05.47, fond doré).
- Titre "Clients recents" + compteur à droite ("30 clients" par défaut, "12 clients" avec filtre VIP).
- **Grille de cartes client** (3 colonnes), chaque carte = avatar initiales + nom (tronqué avec "..." si long) + badge statut optionnel (VIP/GOLD/SILVER, pill dorée/argentée) + téléphone (tronqué) + ancienneté relative alignée à droite ("Il y a Xj/sem/mois" ou "Jamais").
  - Exemples vue par défaut : Awa Test (Il y a 6j), Fatou Test (1 sem.), Coumba... (4 sem.), Bineta Test (1 mois), Mariam T... (2 mois), Awa... VIP (2 mois), So... GOLD (2 mois), Mari... VIP (4 mois), Ais... GOLD (5 mois), Co... GOLD (5 mois), N... SILVER (5 mois), Di... SILVER (5 mois), Bi... SILVER (5 mois), Khady M... (5 mois), Rokhaya... (6 mois).
  - Exemples filtre VIP : Awa... VIP, So... GOLD, Mari... VIP, Ais... GOLD, Co... GOLD, Yacine... VIP (Jamais), Nabou... VIP (Jamais), Rama... GOLD (Jamais), Dieyn... GOLD (Jamais), Adja Ni... VIP (Jamais), Mame... GOLD (Jamais), Awa Th... VIP (Jamais).

**Navigation / flow**
- Bouton "Ajouter" → ouvre le formulaire "Nouveau Client" (capture 10.06.07).
- Clic sur une carte client → ouvre la fiche "Profil Client" (capture 10.06.34).
- Filtres "Nouveaux"/"Historique"/"VIP" → change le sous-ensemble de clients affiché.
- Icône grille à côté de la recherche → probablement bascule vue liste/grille.

**Détails visuels notables**
- Réutilise exactement le pattern "carte personne" (avatar + nom + méta) déjà vu pour l'équipe.
- Les badges de statut client (VIP doré, GOLD doré/jaune, SILVER gris) forment un système de tiers de fidélité visible à plusieurs endroits de l'app (liste clients, modale sélection client, fiche profil).
- Ancienneté relative en texte gris discret aligné à droite = information secondaire, cohérent avec la hiérarchie typographique globale (info primaire en noir gras à gauche, méta en gris à droite).

---

## 13. Nouveau Client — Formulaire de création

**Fichiers source** : Capture d'écran 2026-08-24 à 10.06.07.png, 10.06.12.png (même formulaire, scroll haut → bas)

**Structure de layout**
- Sidebar standard à gauche.
- Colonne principale centrée : header (retour + titre), puis 2 cartes verticales successives regroupant les champs par section ("IDENTITÉ" puis "PROFIL BEAUTÉ"), puis CTA pleine largeur de validation.
- Champs organisés en grille 2 colonnes pour les paires logiques (Prénom/Nom, WhatsApp/Email, Adresse/Poste), champs pleine largeur pour Téléphone, Anniversaire, et les zones de texte long.

**Composants et contenu**
- Header : "←" + titre serif "Nouveau Client".
- **Carte "IDENTITÉ"** (libellé section petit caps) :
  - "Prénom *" (placeholder "Prénom") / "Nom *" (placeholder "Nom") — côte à côte.
  - "Téléphone *" pleine largeur, placeholder "+221 77 123 45 67".
  - "WhatsApp" (placeholder "Numéro WhatsApp") / "Email" (placeholder "email@exemple.com") — côte à côte.
  - "Adresse" (placeholder "Quartier, ville") / "Poste / Profession" (placeholder "Ex: Directrice, Avocate...") — côte à côte.
  - "Anniversaire" pleine largeur, placeholder "jj/mm/aaaa" + icône calendrier à droite du champ.
- **Carte "PROFIL BEAUTÉ"** (libellé section petit caps) :
  - "Type de cheveux" (dropdown "Sélectionner...") / "Référence coloration" (placeholder "Ex: 6.1, Blond cendré...") — côte à côte.
  - "Notes peau" — zone de texte multi-lignes, placeholder "Allergies, type de peau, sensibilités...".
  - "Préférences & notes" — zone de texte multi-lignes, placeholder "Services préférés, notes spéciales, habitudes...".
- CTA pleine largeur doré en bas : "Créer le client".

**Navigation / flow**
- Accessible depuis "Ajouter" (Recherche Client) et/ou "Nouveau" (modale Sélectionner un client pendant une vente).
- "Créer le client" → valide le formulaire, crée le profil et redirige probablement vers la fiche "Profil Client" nouvellement créée (pattern cohérent avec l'écran 14) ou vers la liste clients.
- "←" → retour à l'écran précédent sans sauvegarder.

**Détails visuels notables**
- Formulaire structuré en 2 blocs sémantiques distincts (identité administrative vs profil métier beauté) sur 2 cartes séparées — bonne base pour une modélisation en 2 sous-objets/sections.
- Astérisques "*" marquent les champs requis (Prénom, Nom, Téléphone) — seuls champs obligatoires, le reste est optionnel/enrichissement.
- Champs avec placeholders illustratifs très soignés (ex: "Ex: Directrice, Avocate...", "Ex: 6.1, Blond cendré...") = ton "conciergerie premium" cohérent avec le positionnement "Elite privé".
- Style d'input cohérent partout : bordure fine claire, fond légèrement crème, coins arrondis, label au-dessus en petit texte gris.

---

## 14. Profil Client (fiche détail)

**Fichier source** : Capture d'écran 2026-08-24 à 10.06.34.png

**Structure de layout**
- Sidebar standard à gauche.
- Colonne principale centrée : header centré "PROFIL CLIENT", carte "identité" (avatar + nom + QR + actions), carte "coordonnées" (grille 2 colonnes de champs infos), puis rangée de 3 cartes statistiques en bas.

**Composants et contenu**
- Header centré, petit caps : "PROFIL CLIENT", flèche retour "←" à gauche.
- **Carte identité** :
  - Avatar large rond cerclé doré, initiales "AT" centrées.
  - Nom "Awa Test" (serif, gras, centré sous l'avatar).
  - Libellé statut petit caps gris "MEMBRE CLASSIC" (tier de fidélité).
  - Identifiant "CLT-4E7CAB".
  - QR code généré à droite (carte blanche avec ombre), légende sous le QR "Scanner au salon".
  - 2 boutons d'action côte à côte sous le nom : "🖨 Imprimer carte" (fond beige neutre) et "💬 Envoyer WhatsApp" (fond vert clair, texte vert = action liée à WhatsApp).
- **Carte coordonnées** (grille 2 colonnes, chaque champ = icône + libellé gris + valeur en noir) :
  - Téléphone — +221781208686
  - WhatsApp — +221781208686
  - Email — sokhna.ndour@gmail.com
  - Adresse — "—" (vide)
  - Profession — "—" (vide)
  - Anniversaire — 23 août 1992
  - Boisson — "—" (vide)
  - Services preferes — "—" (vide)
- **Rangée de 3 cartes statistiques** (libellé petit caps centré + valeur géante serif centrée) :
  - VISITES — 0
  - DEPENSES — 0 (sous-texte "FCFA")
  - POINTS — 180

**Navigation / flow**
- "←" → retour à la liste "Recherche Client".
- "Envoyer WhatsApp" → ouvre probablement WhatsApp avec le numéro pré-rempli.
- "Imprimer carte" → déclenche une impression de la carte de fidélité physique (avec QR).
- Le QR affiché ici est vraisemblablement celui scanné dans la modale "Scanner QR Client" (écran 9) pour identifier rapidement ce client en caisse.

**Détails visuels notables**
- Champs non renseignés affichés avec un tiret cadratin "—" plutôt que vides ou masqués — pattern cohérent à réutiliser pour tout champ optionnel non rempli.
- Statistiques mises en scène comme des "hero numbers" (gros chiffres serif centrés), même traitement que "Total" du panier ou "Total à payer" du paiement — cohérence forte de la hiérarchie typographique sur les valeurs numériques importantes.
- QR code et bouton "Scanner au salon" ferment la boucle avec le flow de vente (client scanné en caisse retrouve directement ce profil).
- Boutons d'action avec code couleur sémantique (WhatsApp en vert, action neutre "imprimer" en beige) plutôt qu'un système de boutons monochrome.

---

## Patterns transverses observés (récapitulatif rapide)

- **Sidebar de navigation fixe** identique sur tous les écrans (logo, 7 items de nav, bloc utilisateur + déconnexion en pied).
- **Carte "personne"** réutilisée à l'identique pour Équipe et Clients (avatar initiales rond + nom + badge coloré + méta alignée à droite + éventuel point de statut vert).
- **Badges de tier/rôle en pastille colorée** : VIP/GOLD/SILVER pour les clients, Coiffeuse/Esthéticienne/Accueil/Stock pour l'équipe — chaque badge a sa propre couleur pastel dédiée.
- **Hero numbers** : les montants/totaux/stats importants sont systématiquement en grande police serif centrée (Total panier, Total à payer, stats profil client, revenus accueil).
- **Champs vides affichés en "—"** plutôt que masqués.
- **Modales en overlay centré** avec fond assombri, coins arrondis, header avec titre + bouton fermer "✕".
- **Toggles à 2 segments** (Services/Produits, Équipe/Rendez-vous) et **filtres pill horizontaux** (catégories, rôles, statuts) comme mécanismes de filtrage récurrents.
- **Panier persistant** en colonne latérale droite pendant tout le tunnel de vente, jusqu'à l'étape Paiement où il devient plein écran centré.
- **CTA pleine largeur doré** en bas de flux à chaque étape clé (Encaisser, Confirmer, Créer le client).

---

## Résumé des écrans identifiés dans ce chunk

Accueil/Dashboard, Nouvelle Vente (sélection catégorie + client + catalogue services), modale Sélectionner un client, Panier (articles + remises/fidélité), gestion multi-ventes (onglets), écran Paiement (mode simple + paiement mixte), modale Scanner QR Client, Planning (vue Équipe avec filtres rôle + vue Rendez-vous vide), Recherche/Répertoire Clients (avec filtre VIP), formulaire Nouveau Client, et fiche Profil Client détaillée.
