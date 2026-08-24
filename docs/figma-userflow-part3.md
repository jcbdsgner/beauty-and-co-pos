# Userflow Point de vente — Partie 3/3

> Application: "ELITE PRIVÉ" (nom de marque Figma, à re-skinner) — sous-titre "BEAUTY AND CO" (nom du salon/tenant sélectionné). Toutes les captures de cette partie montrent l'application déjà connectée (rôle "Proprietaire Elite" / ADMIN), en résolution desktop large.

## Structure globale récurrente (sidebar)

Sur **tous** les écrans de ce chunk, on retrouve la même sidebar gauche fixe (~375px de large sur fond blanc/crème très clair, séparée du contenu par un filet vertical) :
- **Header sidebar** : logo losange doré + wordmark serif "ELITE" (majuscules), sous-titre script doré "privé", puis "BEAUTY AND CO" en petites capitales grises (nom du tenant courant).
- **Navigation principale** (icône + libellé, item actif = fond crème/doré clair arrondi + texte doré) :
  1. Accueil (icône maison)
  2. Planning (icône calendrier)
  3. Clients (icône personnes)
  4. Suivi (icône cœur/battement — CRM)
  5. Lookbook (icône étiquette cœur)
  6. Stock (icône sac/panier)
  7. Parametres (icône engrenage)
- **Footer sidebar** : séparateur, avatar rond initiales "PE" + "Proprietaire Elite" / "ADMIN" en dessous, puis lien "Deconnexion" (icône logout), puis mention version "ELITE PRIVE v1.0" tout en bas.

Cette sidebar ne sera plus redécrite dans le détail à chaque entrée ci-dessous — seules les particularités de la zone principale sont documentées.

Style général observé sur tout le chunk : fond de page crème très pâle, cartes blanches à coins très arrondis (~16-20px) avec ombre douce, boutons pilule (border-radius complet) dorés pour les actions principales, badges pilule colorés (vert/orange/rouge/doré) pour les statuts, typographie mixte : titres en serif (style "Elite/Gestion Depot/Lookbook/Suivi/Campagnes") et corps de texte en sans-serif.

---

## 1. Gestion Dépôt — Onglet "Demandes" (état "En attente")

**Fichier source** : Capture d'écran 2026-08-24 à 10.17.34.png

**Structure de layout** : Topbar de la page (pas la sidebar) avec flèche retour (←) à gauche, titre centré serif "Gestion Depot", icône image en haut à droite. Sous la topbar : deux sélecteurs pleine largeur empilés (icône + valeur + chevron) : "Beauty and Co" (icône bâtiment, sélecteur d'enseigne/tenant) et "Tous les salons" (icône boutique, sélecteur de salon). Puis une barre de 5 onglets pilule horizontaux : Vue d'ensemble / Demandes (badge rouge "1") / Depot / Salon / Historique — onglet actif en noir plein. Sous les onglets, 4 sous-filtres pilule : "En attente" (actif, doré) / Preparation / Envoyé / Toutes. Puis liste de cartes de demandes.

**Composants et contenu** :
- Carte demande unique visible : icône horloge dans pastille crème, titre "Creme Coiffante Boucles", tag à droite "🏠 Sea Plaza · Beauty and Co".
- Ligne "Qte: 5" + icône crayon (édition), badge "🏠 Salon: 2", badge "🏬 Depot: 0".
- Timeline verticale à puces : "Demandé" (puce dorée pleine) — "Margha Accueil", "Envoyé" (puce vide) — "en attente" (italique gris), "Reçu" (puce vide) — "en attente" (italique gris). Date alignée à droite "3 avr., 14:46".
- Ligne commentaire : icône bulle "urgent" (italique) + lien "Commenter ⌄" avec icône crayon à droite.
- Footer de carte : bouton pilule doré "📦 Preparer", bouton pilule clair "Annuler" (texte rouge), et à droite badge texte "En attente" (orange).

**Navigation / flow** : Clic sur "Preparer" fait probablement avancer la demande vers l'onglet "Preparation". Les onglets du haut (Depot, Salon, Historique) mènent aux écrans suivants du chunk. Le sélecteur "Beauty and Co" ouvre un menu déroulant vers un salon spécifique (voir écran 3).

**Détails visuels notables** : carte blanche à bord gauche non coloré ici (contrairement aux écrans Depot où une barre verte marque le stock), coins très arrondis, boutons pilule pleins/outline, badges informatifs compacts multiples sur une même ligne.

---

## 2. Gestion Dépôt — Onglet "Depot" (vue globale "Beauty and Co")

**Fichier source** : Capture d'écran 2026-08-24 à 10.17.50.png

**Structure de layout** : Même topbar/sélecteurs/onglets que l'écran 1, onglet actif = "Depot" (badge "Demandes" affiche maintenant "2" en rouge). Sous les onglets : barre de recherche pleine largeur avec icône loupe "Rechercher un produit...", bouton "Filtres ⌄", puis une rangée de 3 tuiles statistiques (Produits / Total unites / Stock bas), puis 2 boutons d'action côte à côte pleine largeur ("📄 Entrée dépôt" doré plein, "✈ Envoi salon" clair), puis lien "🕐 Historique receptions ⌄", puis titre de section "Depot Beauty and Co" avec compteur "75 articles" aligné à droite, puis sous-groupe catégorie "✂ capillaire · 17 produits", puis liste de cartes produits.

**Composants et contenu** :
- Stats : "75 Produits", "1025 Total unites" (vert), "50 Stock bas" (orange).
- Carte produit : bord gauche vert épais (indicateur), icône sac dans pastille verte, titre "Serum Anti-Casse Olaplex No.6", badges "REVENTE" (vert) + référence "BC-SER-002", badge rouge plein "STOCK BAS (MIN: 3)", quantité en gros chiffre orange "3" à droite, bouton pilule "+ Reappro". Sous la carte : "🏠 Stock en salon :" puis "BEAUTY AND CO" (coupé en bas de capture).

**Navigation / flow** : Bouton "Entrée dépôt" ouvre probablement un formulaire de réception. Bouton "Envoi salon" ouvre la modale "Envoi vers salon" (écran 5). Clic sur "+ Reappro" doit lancer une demande de réapprovisionnement.

**Détails visuels notables** : code couleur par barre latérale de carte (vert = OK/actif), badges catégorie type "REVENTE" vs (vu plus loin) "INTERNE", chiffres de stat en couleur sémantique (orange = alerte, vert = positif).

---

## 3. Gestion Dépôt — Onglet "Depot" (vue filtrée par salon "Michele Ka")

**Fichier source** : Capture d'écran 2026-08-24 à 10.18.05.png

**Structure de layout** : Identique à l'écran 2, mais le sélecteur du haut affiche désormais "Michele Ka" (surligné en bleu/focus, bordure bleue) au lieu de "Beauty and Co" — confirme que ce sélecteur permet de changer d'enseigne/dépôt. Mêmes sections : recherche, filtres, stats, actions, historique, liste produits filtrée "Depot Michele Ka · 28 articles".

**Composants et contenu** :
- Stats mises à jour : "28 Produits", "370 Total unites", "20 Stock bas".
- Sous-catégorie "✂ capillaire · 9 produits".
- Carte produit : bord gauche vert, titre "Shampoing Blond Absolu 250ml", badges "REVENTE" + réf "MK-SHP-002", badge rouge "STOCK BAS (MIN: 4)", quantité "0" en orange, bouton "+ Reappro". Sous la carte : "🏠 Stock en salon :" "MICHELE KA".

**Navigation / flow** : Ce sélecteur d'enseigne agit comme un filtre global qui recharge tout le contenu de la page (stats + liste) — confirme un modèle multi-enseignes/multi-dépôts.

**Détails visuels notables** : le champ actif (en cours d'édition/dropdown ouvert) est mis en évidence par une bordure bleue nette, distincte du style doré des accents de marque — pattern de focus state standard.

---

## 4. Gestion Dépôt — Onglet "Salon" (stock du salon "Sea Plaza")

**Fichier source** : Capture d'écran 2026-08-24 à 10.18.17.png

**Structure de layout** : Sélecteur enseigne = "Michele Ka", sélecteur salon = "Sea Plaza" (bordure bleue active). Onglet actif "Salon". Sous les onglets : barre de recherche, puis une rangée de 3 filtres pilule "Tous" (actif, doré) / "🛍 Revente (14)" / "💧 Interne (14)", puis une deuxième rangée de filtres catégories horizontaux scrollables : "Toutes categories" (actif, noir) / ✂ Capillaire / ✨ Soins Visage / ♡ Soins Corps / 💅 Maquillage / 💅 Ongles / Consommabl… (coupé). Puis stats (Produits/Total unites/Stock bas), bouton plein largeur doré "✈ Approvisionner Sea Plaza", titre "Stock Sea Plaza · 28 articles", sous-catégorie "✨ visage · 4 produits", carte produit.

**Composants et contenu** :
- Stats : "28 Produits", "141 Total unites", "7 Stock bas".
- Carte produit : titre "Serum eclat premium", badge "REVENTE", ligne "En stock : 7" à gauche / gros chiffre "7" à droite + bouton "✈ Reappro", ligne "🏠 Stock depot : 43" en dessous.

**Navigation / flow** : Bouton "Approvisionner Sea Plaza" doit ouvrir la même modale "Envoi vers salon" pré-remplie avec ce salon (voir écran 5, qui montre justement "Salon destinataire : Sea Plaza"). Le bouton "Reappro" sur une carte agit au niveau produit individuel.

**Détails visuels notables** : distinction claire entre stock "Revente" (produits vendus au client) et "Interne" (consommables utilisés en prestation) via un système d'onglets à compteurs. Icônes de catégorie distinctes par type de soin.

---

## 5. Modale "Envoi vers salon" (approvisionnement)

**Fichier source** : Capture d'écran 2026-08-24 à 10.18.32.png

**Structure de layout** : Modale centrée sur overlay assombri (fond de la page "Salon" visible en arrière-plan, floutée/assombrie). Carte modale blanche à coins arrondis, header avec titre serif "Envoi vers salon" + bouton fermeture (X cerclé) à droite. Corps en sections empilées : "Salon destinataire" (sélecteur pré-rempli "Sea Plaza"), "Produits a envoyer (0)" avec bouton "+ Ajouter" aligné à droite et message d'état vide centré "Ajoutez des produits a transférer", champ "Note" (textarea placeholder "Raison de l'approvisionnement..."). Footer : bouton pleine largeur doré (désactivé/pâle car aucun produit) "✈ Envoyer au salon".

**Composants et contenu** : Titre "Envoi vers salon", label "Salon destinataire" + valeur "Sea Plaza", compteur "Produits a envoyer (0)", bouton "+ Ajouter", placeholder "Ajoutez des produits a transférer", label "Note", placeholder "Raison de l'approvisionnement...", CTA "Envoyer au salon".

**Navigation / flow** : "+ Ajouter" doit ouvrir un sélecteur de produits (non capturé). Une fois des produits ajoutés, le bouton "Envoyer au salon" devient actif et déclenche le transfert (qui alimenterait l'historique — voir écran 6).

**Détails visuels notables** : modale à coins très arrondis, CTA principal désaturé/pâle tant que la condition (au moins un produit) n'est pas remplie — pattern de bouton désactivé visuellement doré clair vs doré plein actif ailleurs.

---

## 6. Gestion Dépôt — Onglet "Historique" (état vide)

**Fichier source** : Capture d'écran 2026-08-24 à 10.18.41.png

**Structure de layout** : Mêmes sélecteurs ("Michele Ka" / "Sea Plaza"), onglet actif "Historique". Sous-filtres pilule : "Tout" (actif, doré) / Mouvements / Transferts / Receptions. Rangée de 3 tuiles stats à 0. Puis grand état vide centré : icône dépôt/hangar pâle + texte gris "Aucun mouvement enregistre".

**Composants et contenu** : "0 Mouvements", "0 Transferts" (chiffre en bleu), "0 Receptions" (chiffre en vert) — code couleur par type de mouvement. Message d'état vide "Aucun mouvement enregistre".

**Navigation / flow** : Écran terminal de la section Gestion Dépôt pour ce salon (pas de mouvement encore historisé) ; les onglets du haut permettent de revenir à Vue d'ensemble/Demandes/Depot/Salon.

**Détails visuels notables** : pattern d'état vide standard (icône outline pâle + texte gris centré), cohérent avec le reste du design system (cartes stats identiques mais valeurs à 0).

---

## 7. Lookbook — Filtre "Coiffure"

**Fichier source** : Capture d'écran 2026-08-24 à 10.20.18.png

**Structure de layout** : Page pleine largeur (pas de sélecteurs enseigne/salon ici). Header : icône étiquette-cœur + titre serif "Lookbook", sous-titre gris "Styles et soins à proposer à vos clientes". Rangée de filtres pilule horizontaux : Tous / **Coiffure** (actif, doré) / Soins cheveux / Ongles / Pédicure / Soin visage / Épilation / Massage. Grille de cartes produit en 4 colonnes (photo carrée + infos sous la photo), 2 lignes visibles (6 items : 4 + 2).

**Composants et contenu** (cartes, avec badge "↗ TENDANCE" doré en haut-gauche de la photo pour les 2 premières de chaque catégorie, et icône ciseaux ronde en bas-droite de la photo) :
- "Closure Behind The Hair Line" — COIFFURE — 74 900 FCFA (badge TENDANCE)
- "Knotless Braids" — COIFFURE — 69 000 FCFA (badge TENDANCE)
- "Silk Press" — COIFFURE — 79 000 FCFA
- "Coiffure Mariée" — COIFFURE — 89 000 FCFA
- "Extensions aux Fils" — COIFFURE — 129 000 FCFA
- "Tissage Versatile" — COIFFURE — 56 000 FCFA

**Navigation / flow** : Clic sur une carte doit ouvrir une fiche détail du style/soin (non capturée). Les filtres pilule changent la catégorie affichée (voir écrans 8 à 11).

**Détails visuels notables** : cartes blanches à coins arrondis avec photo carrée pleine largeur en haut, badge catégorie en petites capitales dorées au-dessus du titre, titre en gras noir (2 lignes max), prix en gris en dessous. Icône ronde semi-transparente en overlay bas-droite de l'image indique la sous-catégorie (ciseaux pour coiffure).

---

## 8. Lookbook — Filtre "Ongles"

**Fichier source** : Capture d'écran 2026-08-24 à 10.20.23.png

**Structure de layout** : Identique à l'écran 7, filtre actif "Ongles". Grille 4 colonnes, 1 seule ligne (4 items).

**Composants et contenu** : photos réelles (mains avec vernis/bijoux), icône overlay "main" :
- "Finition Cat Eye / Chrome / Baby…" — ONGLES — 10 000 FCFA (TENDANCE)
- "Perfect Manucure Russe" — ONGLES — 43 000 FCFA (TENDANCE)
- "Gel-X — extensions légères" — ONGLES — 36 000 FCFA
- "Luxury Manicure Spa" — ONGLES — 32 000 FCFA

**Navigation / flow** : identique au pattern de l'écran 7.

**Détails visuels notables** : titres longs tronqués avec "…" quand ils dépassent 2 lignes (ex: "Finition Cat Eye / Chrome / Baby…").

---

## 9. Lookbook — Filtre "Soin visage"

**Fichier source** : Capture d'écran 2026-08-24 à 10.20.39.png

**Structure de layout** : Identique, filtre actif "Soin visage". Grille 4 colonnes, 2 lignes (6 items : 4 + 2, dernière ligne coupée en bas de capture).

**Composants et contenu** : ici les photos sont remplacées par des **placeholders** (fond dégradé beige + icône fleur outline centrée) — probablement des visuels non encore uploadés dans le Figma :
- "Glow Me — Coup d'Éclat" — SOIN VISAGE — 49 000 FCFA (TENDANCE)
- "Golden VIP Facial" — SOIN VISAGE — 80 000 FCFA (TENDANCE)
- "Acne Treatment — cure 4 séances" — SOIN VISAGE — 49 000 FCFA
- "Face Lift and Glow" — SOIN VISAGE — 59 000 FCFA
- "Hydrafacial Deep Clean" — SOIN VISAGE — 55 000 FCFA
- "Hydrate Me and Restore" — SOIN VISAGE — 54 000 FCFA

**Navigation / flow** : identique.

**Détails visuels notables** : confirme que les cartes du Lookbook ont un état "image manquante" avec icône de catégorie centrée sur fond dégradé — pattern réutilisable pour le placeholder image par défaut.

---

## 10. Lookbook — Filtre "Épilation"

**Fichier source** : Capture d'écran 2026-08-24 à 10.20.50.png

**Structure de layout** : Identique, filtre actif "Épilation". Grille avec seulement 2 cartes (1re ligne partielle), reste de la grille vide.

**Composants et contenu** : placeholders fond beige + icône "plume/rasoir" :
- "Pack Épilation Complète" — ÉPILATION — 45 000 FCFA (TENDANCE)
- "Soin Vagifacial" — ÉPILATION — 34 000 FCFA (TENDANCE)

**Navigation / flow** : identique.

**Détails visuels notables** : montre que la grille s'adapte au nombre d'items sans remplissage forcé (pas de skeleton vide affiché).

---

## 11. Lookbook — Filtre "Massage"

**Fichier source** : Capture d'écran 2026-08-24 à 10.20.59.png

**Structure de layout** : Identique, filtre actif "Massage". Grille 4 colonnes, 2 lignes (6 items).

**Composants et contenu** : placeholders fond dégradé gris-taupe + icône "vagues" :
- "Hot Stone — Pierres Chaudes" — MASSAGE — 59 000 FCFA (TENDANCE)
- "Pure Délice" — MASSAGE — 90 000 FCFA (TENDANCE)
- "De-Stress Relaxant" — MASSAGE — 45 000 FCFA
- "Deep Tonique" — MASSAGE — 49 000 FCFA
- "Reflexology" — MASSAGE — 49 000 FCFA
- "Steam Time — Gommage +…" — MASSAGE — 40 000 FCFA

**Navigation / flow** : Fin de la section Lookbook dans ce chunk ; la navigation sidebar mène ensuite vers "Suivi" (écrans suivants).

**Détails visuels notables** : chaque catégorie a sa propre couleur de dégradé placeholder + pictogramme dédié (ciseaux, main, fleur, plume, vagues) — bon indicateur pour un futur système d'icônes par catégorie de service.

---

## 12. Suivi — Dashboard "Tournée du matin"

**Fichiers source** : Capture d'écran 2026-08-24 à 10.22.11.png et Capture d'écran 2026-08-24 à 10.24.40.png (même écran, deux captures à des instants différents — les compteurs varient légèrement : 42→41 messages prêts, 44→43 dans "Aujourd'hui", et la 1ʳᵉ carte anniversaire diffère : "Yacine Wade" puis "Coumba Sarr" — probablement dû à une interaction/rafraîchissement entre les deux captures)

**Structure de layout** : Header page : icône cœur-battement + titre serif "Suivi", sous-titre "La tournée du matin — chaque cliente, au bon moment". En haut à droite, deux boutons pilule empilés : "✨ Lookbook" (noir plein) et "📣 Campagnes" (clair, outline). Sous le header, un large bandeau doré pleine largeur "TOURNÉE DU MATIN" avec gros texte serif "XX messages prêts", sous-texte "40 à valider · 6 remises -15 %", et bouton blanc "✈ Valider & envoyer" à droite. En dessous, une rangée de 4 tuiles stats égales : "EN RETARD" (icône ⚠️), "AUJOURD'HUI" (icône horloge), "CETTE SEMAINE" (icône calendrier), "À RECONQUÉRIR" (icône cœur) — chaque tuile affiche un gros chiffre. Puis 3 onglets pilule : "Aujourd'hui (44)" (actif, doré) / "À venir" / "🕐 Historique". Puis liste de cartes regroupées par section avec en-tête (icône + libellé + compteur), commençant par "🎂 ANNIVERSAIRES · 4" (ou 3 dans la 2e capture).

**Composants et contenu** :
- Stats capture 1 : En retard 42, Aujourd'hui 0, Cette semaine 0, À reconquérir 11.
- Stats capture 2 : En retard 41 (mêmes autres valeurs).
- Carte cliente type (répétée dans tout l'écran de suivi, cf. entrée 14 pour variantes) : avatar rond initiales (ex "YW", "CS") + nom en gras + badge statut (VIP/GOLD) optionnel, sous-titre gris "Anniversaire — {Prénom}", badge pilule rouge clair "⏱ En retard de XX j" + libellé type en petites capitales gris ("ANNIVERSAIRE"), bouton fermeture (X) en haut-droite de la carte, corps = message pré-rédigé (texte gris sur fond crème encadré), puis rangée de boutons d'action : "💬 WhatsApp" (vert plein), "✉ Email" (noir plein) ou icône calendrier ronde noire, "📅 RDV pris" (doré plein).
- Exemple capture 1 : "Yacine Wade" [VIP] — "Anniversaire — Yacine" — "En retard de 48 j" — message "Joyeux anniversaire Yacine 🎂✨ Toute l'équipe de Beauty and Co vous souhaite une journée aussi rayonnante que vous. Ce mois-ci, laissez-nous vous chouchouter : dites-moi quand vous passez et je vous prépare un accueil spécial. Votre conseillère beauté · Beauty and Co…" — boutons WhatsApp / Email / RDV pris.
- Exemple capture 2 : "Coumba Sarr" (pas de badge VIP) — "Anniversaire — Coumba" — "En retard de 41 j" — message similaire personnalisé — boutons WhatsApp / icône calendrier / RDV pris.

**Navigation / flow** : Bouton "Valider & envoyer" doit envoyer en masse tous les messages prêts. Bouton "Lookbook" renvoie à l'écran Lookbook (entrées 7-11). Bouton "Campagnes" mène à l'écran 13. Le scroll de cette page fait défiler toutes les cartes classées par section (voir entrée 14).

**Détails visuels notables** : bandeau CTA principal en dégradé doré avec formes décoratives arrondies semi-transparentes en fond (cercles), typographie serif pour les gros chiffres/titres, cartes client uniformes réutilisées dans toute l'app CRM avec un système de badges de statut cliente (VIP doré, GOLD) et de badges d'urgence ("En retard de X j" rouge clair).

---

## 13. Suivi — Sous-page "Campagnes"

**Fichier source** : Capture d'écran 2026-08-24 à 10.22.24.png

**Structure de layout** : Fil d'ariane en haut "‹ SUIVI" (lien retour). Header : icône porte-voix + titre serif "Campagnes", sous-titre "Temps forts et jours creux — rédigées et validées par vous". Bouton pilule doré "+ Créer" en haut à droite. Liste verticale de cartes campagne pleine largeur.

**Composants et contenu** (3 cartes visibles, structure identique) :
- Titre en gras + badge orange "BROUILLON" aligné à droite, texte d'aperçu du message (2-3 lignes, gris), ligne meta "👥 {audience}", puis bouton pleine largeur clair "✏ Modifier" + icône poubelle à droite.
  1. "Tabaski — réservez vos tresses tôt" — "Bonjour {prenom} 🌙 Tabaski approche ! Nos créneaux tresses et coiffures partent très vite à cette période. Réservez dès maintenant pour être magnifique le jour J …" — audience "Toutes les clientes".
  2. "Fêtes de fin d'année — pensez à vous" — "Bonjour {prenom} ✨ Les fêtes arrivent : offrez-vous un moment beauté avant le tourbillon. Coiffure, ongles, soin éclat — dites-nous votre envie, on s'occupe de…" — audience "Toutes les clientes".
  3. "Jour douceur — offre du jour" — "Bonjour {prenom} 🌸 Aujourd'hui seulement, profitez de -15 % sur votre prestation préférée. Une pause beauté improvisée ? Répondez-nous vite, les places du jour…" — audience "Venues ce mois-ci".

**Navigation / flow** : "+ Créer" ouvre probablement un formulaire de création de campagne (non capturé). "Modifier" édite une campagne existante. Le lien "‹ SUIVI" ramène à l'écran 12.

**Détails visuels notables** : utilisation de variable de personnalisation "{prenom}" visible telle quelle dans le texte (placeholder de merge tag), badge de statut "BROUILLON" en orange, ciblage d'audience affiché explicitement par campagne.

---

## 14. Suivi — Liste détaillée (scroll complet des sections de la tournée)

**Fichiers source** : Capture d'écran 2026-08-24 à 10.24.47.png, Capture d'écran 2026-08-24 à 10.24.57.png, Capture d'écran 2026-08-24 à 10.25.19.png, Capture d'écran 2026-08-24 à 10.25.29.png (4 captures consécutives montrant le défilement continu de la même liste, sur le même écran "Suivi" que l'entrée 12 — regroupées ici car il s'agit d'un seul et même écran/liste, seule la position de scroll change)

**Structure de layout** : Continuité de la liste de cartes de l'écran 12, organisée par sections avec un en-tête sticky-like (icône + libellé en petites capitales dorées + compteur "· N" + filet horizontal) : ANNIVERSAIRES → SOINS & RENDEZ-VOUS → FIDÉLITÉ (⭐) → RECONQUÊTE (♡) → RAPPELS LOOKBOOK (🏷). Chaque carte suit le même gabarit que décrit en entrée 12 (avatar, nom, badge statut, sous-titre, badge retard, message, actions).

**Composants et contenu (par section, exemples relevés)** :

*Anniversaires (suite)* :
- "Coumba Sarr" — carte complète avec message + boutons WhatsApp / icône calendrier ronde / "RDV pris".
- "Mame Diarra Sy" — carte compacte (sans message déplié) : avatar "MD" + nom + sous-titre "Dans 6 jours" + simple bouton icône WhatsApp rond vert à droite.
- "Aminata Diop" — carte compacte identique, "Dans 10 jours".

*Soins & rendez-vous · 3* :
- "Bineta Test" — sous-titre "Fenêtre gel se referme — Bineta" — badge "⏱ En retard de 3 j" + libellé "FENÊTRE GEL" — message : "Bonjour Bineta 💅 C'est votre conseillère beauté de Beauty and Co. Votre pose gel approche de sa 4ᵉ semaine : c'est le tout dernier moment idéal pour un simple remplissage. Au-delà, la pose se soulève, fragilise votre ongle naturel — et il faudra une dépose complète puis une… nouvelle pose, plus longue et plus coûteuse. Je vous garde un créneau cette semaine pour…" — bandeau jaune pâle en bas de carte : "🛡 En attente de validation — comprise dans « Valider & envoyer »" (pas de boutons d'action classiques, juste ce badge d'état).

*Fidélité · 25* :
- "Adja Niang" [VIP] — "Récompense à réclamer — Soin VIP" — "En retard de 48 j" — "POINTS FIDÉLITÉ" — message : "Bonjour Adja 💛 C'est votre conseillère beauté de Beauty and Co. Bonne nouvelle : avec vos 8500 points de fidélité, votre récompense « Soin VIP » vous attend déjà ! Elle est à vous dès votre prochaine visite. Je vous réserve un créneau cette semaine ? 🎁" — bandeau "🛡 En attente de validation — comprise dans « Valider & envoyer »".
- "Yacine Wade" [VIP] — même structure — "7200 points de fidélité" — "En retard de 48 j".
- "Awa Thiam" [GOLD] — même structure (carte coupée en bas de capture), "Récompense à réclamer — Soin VIP", "En retard de 48 j".

*Reconquête · 11* :
- "Mariama Ba" [GOLD] — "Reconquête (remise -15 % à autoriser) — Mariama" — "En retard de 48 j" — "RECONQUÊTE" — message : "Bonjour Mariama 🌸 C'est votre conseillère beauté de Beauty and Co. Vous nous manquez vraiment ! Pour vous retrouver, j'ai une attention rien que pour vous : -15 % sur la prestation de votre choix, valable 30 jours avec le code RETOUR30UR. Répondez-moi ici, je vous… réserve le meilleur créneau 🤗" — bandeau orange pâle avec icône interdiction : "⊘ Remise -15 % (code RETOUR30UR) — en attente d'autorisation de la direction" — bouton pleine largeur doré "🛡 Autoriser la remise -15 %" (action distincte, nécessite droits admin).
- "Aissatou Diallo" [GOLD] — même structure, code "RETOURV2VA".
- "Coumba Fall" [GOLD] — carte identique (coupée en bas de capture).
- "Mariam Test" — même structure, "En retard de 3 j", code "RETOURA1NS".

*Rappels Lookbook · 1* :
- "Awa Test" — "Rappel — Perfect Manucure Russe" — "En retard de 3 j" — "RECOMMANDATION" — message : "Bonjour Awa ✨ C'est votre conseillère beauté de Beauty and Co. Je repensais à « Perfect Manucure Russe » que je vous avais proposé — j'ai un joli créneau qui se libère cette semaine, ce serait l'occasion parfaite. Ça vous tente toujours ? 💛" — bandeau "🛡 En attente de validation — comprise dans « Valider & envoyer »".

**Navigation / flow** : Cette longue liste illustre le cœur du CRM "Suivi" : elle mélange anniversaires, alertes de fenêtre de soin (ex. gel qui se referme), récompenses fidélité à réclamer, campagnes de reconquête avec remise nécessitant validation direction, et rappels de recommandations issues du Lookbook. Chaque carte a son propre call-to-action contextuel (WhatsApp/Email/RDV pris, ou Autoriser la remise, ou simple badge "en attente de validation"). Le bouton global "Valider & envoyer" en haut de la page (écran 12) envoie collectivement tous les messages marqués "en attente de validation".

**Détails visuels notables** : distinction de densité entre carte "compacte" (client à échéance future, juste nom + sous-titre + bouton icône) et carte "développée" (échéance urgente, message complet + CTAs) — pattern de priorisation visuelle par urgence. Badges de statut client cohérents (VIP doré, GOLD). Un bouton d'autorisation spécifique ("Autoriser la remise -15 %") introduit une notion de workflow d'approbation manager pour les remises commerciales.

---

## 15. Stock — Vue d'ensemble

**Fichier source** : Capture d'écran 2026-08-24 à 10.25.46.png

**Structure de layout** : Retour à la page "Gestion Depot" (topbar avec flèche retour + titre "Gestion Depot"), sélecteurs "Beauty and Co" / "Tous les salons", onglets (Vue d'ensemble actif en noir, Demandes badge "1"). Sous les onglets, un bandeau d'alerte rouge clair pleine largeur avec icône ⚠️ : "49 en rupture · 93 sous le seuil — à réapprovisionner". Puis 2 tuiles côte à côte : "VALEUR DU STOCK" (montant en gros) et "À COMMANDER" (nombre). Puis en-tête de liste "225 PRODUITS · TRIÉS PAR URGENCE" avec lien "Voir le détail ›" à droite, puis liste de cartes produit triées par urgence.

**Composants et contenu** :
- Bandeau alerte : "49 en rupture" (rouge) · "93 sous le seuil" (orange) — à réapprovisionner.
- "VALEUR DU STOCK" = "21 670 000 F".
- "À COMMANDER" = "122".
- Carte produit (répétée) : icône sac dans case grise, titre produit, ligne "🏠 Beauty and Co" + badge "REVENTE", barre de progression horizontale fine (quasi vide, en rouge) sous le titre, icône sablier + tiret à droite, gros badge rond rouge pâle avec chiffre "0" en haut à droite, et sous la barre "Commander ~N" en texte doré/brun.
  - "Conditionneur Redken 300ml" — Beauty and Co — REVENTE — 0 — Commander ~5
  - "Laque Fixation Forte 400ml" — Beauty and Co — REVENTE — 0 — Commander ~8
  - "Gel Coiffant Extra Strong" — Beauty and Co — REVENTE — 0 — Commander ~10

**Navigation / flow** : "Voir le détail" doit ouvrir une vue liste complète des 225 produits. Cet écran de "Vue d'ensemble" agrège les données vues séparément dans les onglets Depot/Salon (entrées 2-4) en une vue globale priorisée par urgence de réapprovisionnement.

**Détails visuels notables** : barre de progression de stock (jauge fine quasi vide en rouge) est un nouveau pattern non vu dans les écrans Depot/Salon précédents (qui utilisaient plutôt un simple chiffre + badge "STOCK BAS"). Suggestion de quantité à commander calculée automatiquement ("Commander ~N").

---

## 16. Clients — Carte de Fidélité (fiche client)

**Fichier source** : Capture d'écran 2026-08-24 à 10.27.04.png

**Structure de layout** : Topbar : flèche retour + titre centré (bug de rendu Figma visible, voir note ci-dessous). Rangée de 4 boutons d'action en haut : "💬 Envoyer par WhatsApp" (vert), "✉ Envoyer par email" (bleu), bouton téléchargement (noir), "🖶 Imprimer" (clair). Puis deux cartes empilées verticalement au centre-gauche de la page : une "carte de fidélité" recto (format carte de crédit) et un "sticker QR code" en dessous, chacune avec une légende en dessous ("▲ Recto de la carte", "▲ Sticker QR à découper").

**Composants et contenu** :
- Carte fidélité : filet doré en haut, logo/titre "ELITE PRIVÉ" + sous-titre "CARTE DE FIDÉLITÉ", nom client "Awa Test", badge pilule "☆ Classique", QR code à droite avec légende "Scanner au salon", identifiant "CLT-4E7CAB" en bas à gauche.
- Sticker QR : titre "QR CODE STICKER", QR code centré dans cadre pointillé, identifiant "CLT-4E7CAB", sous-texte "Awa Test · ☆ Classique".

**Navigation / flow** : Cette fiche doit être accessible depuis la liste Clients (fiche détail d'une cliente) ; les boutons d'envoi permettent de transmettre la carte numérique à la cliente ; le sticker QR est destiné à impression physique.

**Détails visuels notables — important, bug Figma à signaler** : le titre de la page et les libellés de la carte affichent des séquences d'échappement Unicode brutes non résolues, ex. "CARTE DE FIDéLITé" (devrait afficher "CARTE DE FIDÉLITÉ"), "ELITE PRIVÉ" (devrait être "ELITE PRIVÉ"), "Télécharger" (devrait être "Télécharger"), "FIDéLITé" pour "FIDÉLITÉ", "▲" affiché "▲ Recto de la carte" / "▲ Sticker QR à découper". C'est un artefact d'export/rendu Figma (accents mal interprétés) — à ignorer pour la reconstruction (le texte réel voulu est "Carte de fidélité", "Elite Privé", "Télécharger", "Recto de la carte", "Sticker QR à découper").

---

## 17. POS — Paiement réussi (haut du reçu)

**Fichier source** : Capture d'écran 2026-08-24 à 10.51.47.png

**Structure de layout** : Vue différente des précédentes — pas de header/topbar classique, la sidebar est identique mais le contenu principal est un **reçu/ticket** centré dans un cadre blanc étroit (largeur ~ticket de caisse) sur fond crème, avec en haut un bandeau plein vert (dégradé) contenant une icône check dans cercle blanc, texte "Paiement réussi !" en serif blanc, et montant "80 000 F". En bas de l'écran, une barre d'actions fixe pleine largeur avec 2 boutons : "🏠 Accueil POS" (clair) et "+ Nouvelle vente" (doré plein).

**Composants et contenu** : Sous le bandeau vert, en-tête du reçu : "Beauty and Co" (titre serif), adresse "Almadies" / "Route des Almadies, Dakar" / "+221 33 820 00 01". Ligne meta : "N° INV-2026-000018" à gauche / "24/08/2026 à 10:51" à droite ; "Caissier(ère) : Proprietaire". Bloc client : avatar "AT" + "Awa Test" + badge "☆ Classic". Lignes de prestations : "Balayage californien — 55 000 F", "Coloration racines — 25 000 F". Puis "Sous-total — 80 000 F" et "TOTAL — 80 000 F" (en gras, plus grand). Section "PAIEMENT" commence à être visible tout en bas (coupée).

**Navigation / flow** : Écran atteint après validation d'un paiement en caisse (POS). "Accueil POS" ramène à l'écran de caisse, "Nouvelle vente" démarre une nouvelle transaction.

**Détails visuels notables** : bandeau de confirmation vert avec formes décoratives circulaires semi-transparentes en fond (même pattern que le bandeau doré de l'écran Suivi), reçu au format ticket avec séparateurs pointillés horizontaux entre sections, hiérarchie claire sous-total → total.

---

## 18. POS — Paiement réussi (reçu complet, détail scrollé) — DERNIER ÉCRAN DU PARCOURS

**Fichier source** : Capture d'écran 2026-08-24 à 10.51.54.png

**Structure de layout** : Suite du même reçu que l'écran 17 (scroll vers le bas, le bandeau vert n'est plus visible). Mêmes lignes de prestations/total en haut, puis sections supplémentaires empilées : "PAIEMENT", "★ FIDÉLITÉ" (encadré), bloc "📅 PROCHAINE VISITE CONSEILLÉE" (encadré doré clair) avec bouton d'action, puis message de clôture centré. Barre d'actions fixe identique en bas ("Accueil POS" / "+ Nouvelle vente").

**Composants et contenu** :
- "PAIEMENT" : "Wave — 80 000 F" (mode de paiement + montant).
- "★ FIDÉLITÉ" : "Points gagnés — +80 pts" (en vert) / "Solde actuel — 260 pts".
- Encadré doré clair "📅 PROCHAINE VISITE CONSEILLÉE" : "Proposez à **Awa** son prochain rendez-vous **lundi 21 septembre** (balayage californien) — avant qu'elle ne parte !" — bouton pleine largeur doré "📅 Prendre le rendez-vous maintenant".
- Clôture : "Merci de votre visite !" / "À bientôt chez Beauty and Co ✨".

**Navigation / flow** : **C'est le tout dernier écran du parcours capturé dans ce chunk (et donc de la séquence complète des 3 parties).** Deux issues possibles : cliquer "Prendre le rendez-vous maintenant" bouclerait probablement vers un écran de prise de RDV (Planning, non capturé ici), et cliquer "Accueil POS" ou "Nouvelle vente" ramène/boucle vers l'écran de caisse POS pour démarrer une nouvelle transaction — un écran déjà implicite en amont du flow (l'écran de caisse lui-même n'a pas été capturé dans ce chunk, seul l'écran de confirmation de paiement l'a été).

**Détails visuels notables** : le reçu combine transaction + upsell fidélité + relance de prise de RDV directement dans l'écran de confirmation de paiement — un pattern d'écran de fin de vente "tout-en-un" qui pousse activement la fidélisation et la reprise de rendez-vous avant de clore le flow.
