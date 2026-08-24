# Userflow Point de vente — Partie 2/3

> Analyse séquentielle de 22 captures d'écran Figma, dans l'ordre de parcours du fichier. Il s'agit du back-office "Elite Privé" (application de gestion salon de beauté associée au point de vente), pas de l'écran caisse lui-même. Les captures consécutives montrant le même écran (scroll ou changement d'onglet interne) ont été fusionnées en une seule entrée.

---

## 1. Fiche client — détail (scroll complet)

**Fichiers source** : `Capture d'écran 2026-08-24 à 10.06.48.png`, `10.07.10.png`, `10.07.24.png`, `10.07.33.png` (4 captures = un seul écran parcouru du haut vers le bas)

**Structure de layout**
- Sidebar de navigation gauche fixe (logo + menu + profil, cf. section "Layout global" en bas de ce document), item **Clients** actif (fond pilule crème, texte/icône or).
- Zone principale en une seule colonne scrollable, empilement de cartes blanches arrondies sur fond crème, chacune séparée par un espacement généreux.
- Ordre vertical des blocs : (1) carte coordonnées, (2) rangée de 3 KPI cards, (3) carte "dernière visite", (4) bandeau abonnement "Cercle Ongles" + 2 cartes crédits, (5) bloc "Suivi & recommandations", (6) bloc "Notes internes", (7) rangée 2 colonnes "Préférences beauté" / "Dernières visites".

**Composants et contenu (dans l'ordre d'apparition)**
1. **Carte coordonnées** (grille 2 colonnes) :
   - Téléphone (icône verte) : "+221781208686"
   - WhatsApp (icône verte bulle) : "+221781208686"
   - Email (icône bleue enveloppe) : "sokhna.ndour@gmail.com"
   - Adresse (icône orange pin) : "—" (vide)
   - Profession (icône mallette) : "—"
   - Anniversaire (icône gâteau rose) : "23 août 1992"
   - Boisson (icône tasse) : "—"
   - Services préférés (icône étoiles) : "—"
2. **3 KPI cards côte à côte** : "VISITES" → 0 ; "DEPENSES" → 0 FCFA ; "POINTS" → 180 (chiffre en grand, typo serif).
3. **Carte "Dernière visite"** : icône horloge dans cercle, texte "Derniere visite" (label gris) puis "18 août 2026 (Il y a 6 jours)" en gras.
4. **Bandeau abonnement "Cercle Ongles"** (fond sombre/dégradé, contraste avec le reste) : icône couronne + titre serif doré "Cercle Ongles", sous-texte "Membre depuis 1 mois · renouvellement le 17 septembre".
5. **2 cartes crédits d'abonnement côte à côte** :
   - "REMPLISSAGE / POSE" (icône diamant) — compteur "I" (1 crédit) — bouton pilule doré "Utiliser"
   - "FINITION FR./CHROME" (icône étincelles) — compteur "I" — bouton pilule doré "Utiliser"
   - En dessous : "Dépose gratuite : après 2 remplissage(s) de plus" (icône cadeau), "Manucure russe offerte : dès 2 mois d'abonnement" (icône couronne)
   - Séparateur puis ligne "Prestataire préférée : — au choix —" avec chevron (select)
   - Note petite : "Adhésion et renouvellement : vendre le service « Abonnement Cercle Ongles » en caisse."
6. **Section "Suivi & recommandations"** (titre serif + icône cœur, lien à droite "CENTRE DE SUIVI >") :
   - Bandeau alerte fond crème/jaune clair : "PROCHAINE VISITE CONSEILLÉE" (label doré) / "Rappel — Perfect Manucure Russe" en gras + "en retard de 3 j" en rouge
   - Ligne à puce : "Récompense à réclamer — Brushing offert · en retard de 3 j" (retard en rouge)
   - Sous-titre "À LUI PROPOSER" (icône étincelles)
   - 3 cartes suggestion, chacune : nom du service en gras + badge catégorie (ex. "SOIN VISAGE", "COIFFURE"), sous-texte justification, bouton pilule vert "Proposer" (icône bulle de dialogue) à droite :
     - "Glow Me — Coup d'Éclat" / SOIN VISAGE / "Adapté à sa peau sèche"
     - "Closure Behind The Hair Line" / COIFFURE / "Parfait pour ses cheveux crépu"
     - "Knotless Braids" / COIFFURE / "Parfait pour ses cheveux crépu"
   - Sous-section "RECOMMANDATIONS" : ligne "Perfect Manucure Russe" avec badge bleu "ENVOYÉE" à droite.
7. **Bloc "Notes internes"** (icône note + lien "+ AJOUTER" à droite) : carte vide centrée "Aucune note pour ce client" + lien "+ Ajouter une note".
8. **Rangée 2 colonnes en bas** :
   - "Preferences beaute" (titre serif) avec lien "✎ MODIFIER" à droite → carte "COIFFURE" (icône ciseaux orange) avec champ "Type de cheveux" → "Crépu"
   - "Dernieres visites" (titre serif) → carte vide "Aucune visite enregistree"

**Navigation / flow** : écran atteint depuis le menu "Clients" → sélection d'une fiche client. Les boutons "Utiliser" consomment un crédit d'abonnement (probablement déclenché depuis la caisse). "Proposer" envoie une recommandation au client (probablement via WhatsApp, vu l'icône bulle). "MODIFIER" sur préférences beauté ouvre un formulaire d'édition (non capturé). "CENTRE DE SUIVI" mène vers le menu "Suivi" de la sidebar.

**Détails visuels notables** : cartes blanches à coins très arrondis, ombre portée légère. Le bandeau "Cercle Ongles" tranche fortement (fond sombre) au milieu d'une page très claire — sert de mise en avant du statut VIP. Titres de section en police serif élégante (le nom du salon "ELITE privé" utilise la même famille), le reste en sans-serif. Codes couleur sémantiques : rouge pour "en retard", vert pour "Proposer"/succès, bleu pour badge "Envoyée", doré pour actions principales et éléments premium. Densité d'info élevée mais très aérée grâce au fort espacement vertical entre cartes.

---

## 2. Paramètres — Accueil (hub des réglages)

**Fichier source** : `10.10.10.png`

**Structure de layout**
- Sidebar identique, item **Parametres** actif.
- Zone principale : carte "profil" en haut pleine largeur, puis grille 2 colonnes de "cartes de réglage" cliquables (chevron à droite de chacune), homogènes en taille.

**Composants et contenu**
- Carte profil : avatar rond "PE" cerclé or, "Proprietaire Elite" (gras), "admin" (gris), "Beauty and Co" (doré, lien).
- Grille de 12 cartes de réglages (icône colorée dans carré arrondi + titre gras + sous-titre gris + chevron ">") réparties sur 2 colonnes :
  - Colonne gauche : "Mon Profil" (Informations personnelles) ; "Gestion Services" (Categories, prix, durees) ; "Photos de référence" (Couleurs, formes, marques) ; "Tendances soins" (Vernis, soins cheveux, lissage, visage...) ; "Entreprises & Salons" (Multi-entreprise, salons) ; "Notifications" (Alertes et rappels) ; "Apparence" (Langue, theme)
  - Colonne droite : "Gestion Utilisateurs" (Equipe, roles, acces) ; "Gestion Produits" (Stock, prix, photos) ; "Conseils beauté" (Tips & cycles de votre conseillère) ; "Gestion Stock Central" (Depot, transferts, demandes) ; "Gestion Salon" (Horaires, fermetures) ; "Securite" (Code PIN, mot de passe) ; "Aide & Support" (FAQ, contact)

**Navigation / flow** : hub central des réglages ; chaque carte mène vers un sous-écran dédié. Les captures suivantes montrent précisément "Photos de référence", "Gestion Services", "Entreprises & Salons", "Gestion Produits" et "Conseils beauté" ouverts depuis ce hub.

**Détails visuels notables** : icônes pastel dans pastilles arrondies (une couleur douce différente par carte : beige, jaune pâle, rose, etc.), grille très régulière type "app launcher", pas de hiérarchie de priorité visuelle entre les cartes (toutes de même poids).

---

## 3. Photos de référence — onglet "Couleurs ongles" (avec photos)

**Fichier source** : `10.11.04.png`

**Structure de layout**
- Header de sous-page : flèche retour + titre centré "Photos de référence".
- Sélecteur d'entreprise en haut ("ENTREPRISE CONCERNÉE" → dropdown "Beauty and Co").
- Barre d'onglets horizontale (pills) pour catégories de photos.
- Grille de cartes photo 3 colonnes.

**Composants et contenu**
- Dropdown encadré doré : "Beauty and Co" avec chevron.
- Onglets pills : "🎨 Couleurs ongles" (actif, fond noir/texte blanc), "💅 Formes ongles", "👑 Types de cheveux", "🧴 Marques cheveux", "☕ Boissons".
- Texte d'aide : "Uploadez des photos pour chaque option. Ces photos apparaîtront automatiquement dans les questions aux caissiers, facilitant leur compréhension visuelle."
- Grille de vignettes photo (format portrait, coins arrondis) avec légende + icône poubelle rouge en bas de chaque carte :
  - "Rouge classique" (photo ongles bordeaux/rouge foncé)
  - "Rouge bordeaux" (photo similaire)
  - "Noir" (photo ongles rouge vif — probablement mal légendée dans les données de démo)
  - 4e vignette (rouge) partiellement visible en bas, 5e et 6e vides.

**Navigation / flow** : accessible depuis Paramètres → "Photos de référence". Les onglets changent le contenu de la grille sans recharger la page (SPA-like tab switch). "Ajouter" (vu dans les captures suivantes) ouvre un uploader de photo.

**Détails visuels notables** : vignettes en ratio portrait, légende sur bandeau blanc en bas de carte, icône suppression discrète. Onglet actif en pill noire pleine (contraste fort avec les autres pills beige clair inactives).

---

## 4. Photos de référence — onglet "Formes ongles" (vide)

**Fichier source** : `10.11.18.png`

**Structure de layout** : identique à l'entrée précédente, scrollé pour ne montrer que la barre d'onglets + grille (dropdown entreprise hors cadre en haut).

**Composants et contenu**
- Onglet actif : "💅 Formes ongles".
- Grille 3 colonnes × 2 rangées de "slots" vides : carré placeholder beige avec icône image + texte "Ajouter" au centre, légende sous chaque slot : "Amande", "Carré", "Carré arrondi" (rangée 1, avec placeholder), rangée 2 sans légende visible (slots vides supplémentaires, probablement "Ovale", "Pointu", "Stiletto" scrollés hors champ).

**Navigation / flow** : cliquer un slot "Ajouter" ouvre vraisemblablement un sélecteur de fichier / uploader (non capturé en détail ici mais cohérent avec le pattern).

**Détails visuels notables** : état vide clairement différencié de l'état rempli (carte 1) — placeholder gris avec icône pictogramme image + verbe d'action "Ajouter" centré, même style de carte que les vignettes remplies pour cohérence visuelle.

---

## 5. Photos de référence — onglet "Types de cheveux" (vide)

**Fichier source** : `10.11.32.png`

**Structure de layout** : identique, onglet "👑 Types de cheveux" actif.

**Composants et contenu**
- Grille 3×2 de slots vides "Ajouter" avec légendes : "Naturel", "Lisse", "Bouclé" (rangée 1), "Crépu", "Défrisé", "Tressé" (rangée 2).

**Navigation / flow** : identique au pattern des autres onglets de cette page.

**Détails visuels notables** : même composant réutilisé (grille de cartes upload), seul le jeu d'options change selon l'onglet — bon exemple de pattern réutilisable pour la reconstruction (un seul composant "PhotoGrid" paramétré par liste d'options).

---

## 6. Photos de référence — onglet "Boissons" (vide)

**Fichier source** : `10.11.46.png`

**Structure de layout** : identique, onglet "☕ Boissons" actif (pill noire).

**Composants et contenu**
- Grille 3×2 de slots vides "Ajouter" avec légendes : "Eau", "Thé", "Café" (rangée 1), "Café au lait", "Jus d'orange", "Bissap" (rangée 2).

**Navigation / flow** : idem.

**Détails visuels notables** : idem pattern.

---

## 7. Photos de référence — onglet "Marques cheveux" (vide)

**Fichier source** : `10.11.55.png`

**Structure de layout** : vue scrollée plus bas, barre d'onglets hors cadre (seul le texte d'aide et la grille sont visibles), 2 rangées de 3 slots vides.

**Composants et contenu**
- Légendes visibles : "Kérastase", "Mizani", "L'Oréal Professionnel" (rangée 1), "Saryna Keys", "Olaplex", "Redken" (rangée 2, coupée en bas — d'autres marques probablement en dessous, hors cadre).

**Navigation / flow** : idem.

**Détails visuels notables** : confirme que cette page "Photos de référence" gère 5 familles d'options configurables (couleurs ongles, formes ongles, types de cheveux, marques cheveux, boissons), chacune avec le même composant de grille upload.

---

## 8. Gestion Services — liste des prestations

**Fichier source** : `10.12.32.png`

**Structure de layout**
- Header sous-page : "← Retour", titre serif "Gestion Services" + sous-titre "Categories, prix, durees", à droite 2 boutons : outline "⇄ Categories" et pilule dorée "+ Ajouter".
- Sélecteur d'entreprise (dropdown "Beauty and Co").
- Barre de recherche pleine largeur ("Rechercher un service...").
- Barre d'onglets catégories (pills).
- Checkbox "Afficher les services inactifs".
- Liste groupée par catégorie avec en-tête de groupe (petit label gris majuscules + compteur) puis cartes service.

**Composants et contenu**
- Onglets : "Tous" (actif, pilule dorée pleine), "Coiffure", "Spa & Massages", "Epilation", "Cils & Sourcils", "Manucure / Pedicure", "Soins Visage", "Nail art".
- Groupe "M√®CHES & BALAYAGE (1)" (bug d'encodage visible — accent mal rendu "Mèches") :
  - Carte "Balayage californien" — icône étincelles dans carré beige — prix "55 000 F" (doré) — durée "⏱ 120 min" — icône crayon (édition) à droite.
- Groupe "SOIN BOTOX CAPILLAIRE (1)" :
  - Carte "Botox capillaire premium" — "55 000 F" — "⏱ 90 min".
- Groupe "COIFFURE (6)" :
  - Carte "Brushing" — "10 000 F" — "⏱ 30 min"
  - Carte "Coloration" (coupée en bas de capture, prix non visible).

**Navigation / flow** : depuis Paramètres → "Gestion Services". "+ Ajouter" ouvre probablement un formulaire de création de service (modal similaire à "Modifier le produit"). Icône crayon sur une carte ouvre l'édition du service. "Categories" ouvre la gestion des catégories (modal similaire à celle vue pour les produits).

**Détails visuels notables** : liste dense mais groupée avec labels de section en petites capitales grises, prix mis en évidence en doré/gras, durée avec icône horloge en gris discret. Cartes service au même style que les autres listes (fond blanc, coin arrondi, icône carrée à gauche, action crayon à droite).

---

## 9. Entreprises & Salons

**Fichier source** : `10.13.27.png`

**Structure de layout**
- Header : "← Retour", titre serif "Entreprises & Salons" + sous-titre "Gerer les entreprises et leurs salons".
- Liste d'entités hiérarchique : cartes "entreprise" (niveau 1) contenant des sous-lignes "salon" (niveau 2, indentées visuellement par un fond légèrement différent), regroupées dans un même bloc encadré par entreprise.

**Composants et contenu**
- Bloc entreprise 1 : "Beauty and Co" (icône bâtiment dorée) / slug "beauty-and-co" / chevron vers le haut (^) = développé, contient :
  - "Almadies" (icône boutique) / "Route des Almadies, Dakar" / pastille verte (statut actif) + chevron
  - "Sea Plaza" (icône boutique) / "Sea Plaza, Corniche Ouest, Dakar" / pastille verte + chevron
- Bloc entreprise 2 : "Michele Ka" (icône bâtiment dorée) / slug "michele-ka" / chevron vers le bas (replié, pas de salons visibles).

**Navigation / flow** : depuis Paramètres → "Entreprises & Salons". Cliquer une entreprise déplie/replie la liste de ses salons (accordéon). Cliquer un salon ouvre probablement sa fiche (horaires, adresse...). Confirme un modèle multi-entreprise / multi-salon (utile pour l'architecture de données : Entreprise → Salons → ...).

**Détails visuels notables** : icône "bâtiment" dorée distincte de l'icône "boutique/salon" plus neutre — hiérarchie visuelle claire entre les 2 niveaux. Pastille verte = salon actif/ouvert.

---

## 10. Gestion Produits — liste inventaire

**Fichiers source** : `10.14.10.png`, `10.14.31.png` (même écran ; la seconde capture montre uniquement le dropdown "Beauty and Co" avec un focus/contour doré, état transitoire avant ouverture d'un modal)

**Structure de layout**
- Header : "← Retour", titre serif "Gestion Produits" + sous-titre "Stock, prix, fournisseurs", boutons à droite "📁 Categories" (outline) et "+ Ajouter" (pilule dorée).
- Dropdown entreprise ("Beauty and Co").
- Dropdown dépôt ("Stock depot (global)").
- Bandeau alerte stock bas.
- Barre de recherche ("Rechercher par nom, SKU, fournisseur...").
- Barre d'onglets catégories.
- Checkbox "Afficher les produits inactifs".
- Liste groupée par catégorie, cartes produit.

**Composants et contenu**
- Bandeau alerte (fond orange clair, icône triangle warning) : "50 produits en stock bas" + lien "Filtrer" à droite.
- Onglets : "Tous" (actif), "Capillaire", "Soins Visage", "Soins Corps", "Maquillage", "Ongles", "Consommables", "Outils & Accessoires".
- Groupe "CAPILLAIRE (17)" :
  - Carte "Apres-shampoing Kerastase 200ml" — SKU "BC-ASH-001" — prix "20 000 F" (doré) — "Cout: 10 500 F" (gris) — badge vert "📊 52 en stock" — badge beige "Revente" — sous-ligne "Fournisseur: Kerastase" — icône crayon à droite.
  - Carte "ColorWow Dream Coat Anti-Humidity (200ml)" — SKU "BC-CWD-001" — prix "28 000 F" — "Cout: 30 205 F" — badge rouge "📉 0 en stock" — badges "Revente" et "🌐 USD" — "Fournisseur: ColorWow USA".

**Navigation / flow** : depuis Paramètres → "Gestion Produits". Icône crayon ouvre le modal "Modifier le produit" (écran suivant). "+ Ajouter" ouvre vraisemblablement le même formulaire vide. "Categories" ouvre le modal de gestion des catégories produits.

**Détails visuels notables** : badges de statut colorés multiples par carte (stock bas en rouge, devise étrangère en bleu, type revente/backbar en beige) — système de tags compact. Distinction "Cout" (achat) vs prix (vente) clairement séparée visuellement (prix en doré/gras plus visible que le coût en gris).

---

## 11. Modale "Categories produits" (arborescence 3 niveaux)

**Fichier source** : `10.14.25.png`

**Structure de layout**
- Modale type bottom-sheet centrée, fond de page flouté/assombri en arrière-plan (overlay), feuille blanche à coins arrondis en haut, petite poignée horizontale grise en haut (indicateur de drag/sheet), croix de fermeture en haut à droite.
- Titre serif "Categories produits" + sous-titre "3 niveaux : Categorie → Sous-categorie → Specialite".
- Liste arborescente à 2 niveaux d'indentation visibles (L1 avec chevron expand, L2 indenté sans chevron).

**Composants et contenu**
- "Capillaire" (L1, chevron ">") avec sous-catégories dépliées : "Shampooings" (L2), "Soins capillaires" (L2), "Colorations" (L2), "Styling" (L2)
- "Soins Visage" (L1, chevron ">") avec : "Nettoyants" (L2), "Hydratants" (L2), "Anti-age" (L2), "Masques" (L2)
- "Soins Corps" (L1, pas de chevron visible = pas de sous-catégories ou replié)
- "Maquillage" (L1)
- "Ongles" (L1)
- "Consommables" (L1, coupé en bas de capture)

**Navigation / flow** : ouvert depuis le bouton "Categories" de "Gestion Produits" (et probablement aussi "Gestion Services" via un modal similaire). Chevron ">" permet vraisemblablement de développer/replier chaque catégorie L1.

**Détails visuels notables** : hiérarchie typographique claire (L1 en noir gras plus grand, L2 en noir normal légèrement indenté), petits labels "L1"/"L2" en gris à droite de chaque ligne (indicateurs de niveau, probablement à but de debug/démo plutôt que design final).

---

## 12. Modale "Modifier le produit" (formulaire complet)

**Fichiers source** : `10.14.49.png`, `10.14.56.png` (même modale, scroll haut → bas)

**Structure de layout**
- Même pattern de modale bottom-sheet que "Categories produits" (poignée, croix fermeture, overlay flouté).
- Titre serif "Modifier le produit".
- Formulaire vertical à un seul champ par ligne (sauf prix vente/achat en 2 colonnes), labels gris au-dessus de chaque champ, champs à fond beige clair et coins arrondis.
- Pied de modale : 2 boutons pleine largeur côte à côte, "Annuler" (outline) et "✓ Enregistrer" (pilule dorée pleine).

**Composants et contenu (ordre du formulaire)**
1. Zone photo produit : carré avec icône appareil photo + texte "Photo" ; à droite "Photo du produit (optionnel)" / "JPG, PNG ou WebP. Max 5 Mo"
2. "Nom du produit *" → champ texte : "Apres-shampoing Kerastase 200ml"
3. "SKU (Reference) *" → champ texte : "BC-ASH-001" + note "Genere automatiquement. Modifiable."
4. "Categorie *" → select : "Capillaire"
5. "Sous-categorie" → select : "-- Aucune --"
6. "Prix vente (FCFA) *" (20000) / "Prix d'achat (FCFA)" (10500) — 2 champs côte à côte
7. Toggle "🌐 Achete a l'etranger" (switch off)
8. "Fournisseur" → champ texte : "Kerastase"
9. "Stock minimum alerte" → champ numérique : "5" / à droite "Type de produit" → 2 boutons toggle "Revente" (actif, doré) / "Backbar" + légende "Revente = vendu à la cliente · Backbar = utilisé en prestation"
10. Encart note (fond crème encadré) : "Note : Le prix defini ici sera applique au POS et ne pourra pas etre modifie par les caissiers. Le stock est gere separement par salon et par depot."
11. Boutons "Annuler" / "✓ Enregistrer"

**Navigation / flow** : ouvert via l'icône crayon d'une carte produit dans "Gestion Produits". "Enregistrer" sauvegarde et referme la modale (retour à la liste). Confirme un lien direct entre cette configuration back-office et le comportement de la caisse (POS) — le prix défini ici verrouille le prix côté caissier.

**Détails visuels notables** : champs de formulaire à fond beige clair légèrement distinct du fond blanc de la modale (contraste doux pour délimiter les zones interactives). Boutons toggle "Revente/Backbar" en pilule à 2 états, état actif en doré plein. Note d'avertissement encadrée en bas de formulaire — pattern à réutiliser pour d'autres formulaires sensibles.

---

## 13. Conseils beauté — onglet "Tous"

**Fichier source** : `10.16.00.png`

**Structure de layout**
- Titre serif avec icône ampoule "Conseils beauté" + sous-titre "Vos connaissances, injectées dans les messages de la conseillère".
- Sous-section "✨ Mes conseils" avec bouton "+ Ajouter" (pilule dorée) aligné à droite du titre de section.
- Barre d'onglets catégories.
- Carte(s) de conseil.
- Sous-section "🕐 Cycles & conseils par service" avec sous-titre explicatif, barre de recherche, puis liste de services avec badge délai + icône crayon.

**Composants et contenu**
- Onglets : "Tous" (actif), "Coiffure", "Soins cheveux", "Ongles", "Pédicure", "Visage", "Épil..." (coupé, = Épilation).
- Carte conseil : label catégorie doré "MASSAGE & CORPS" + texte du conseil "cinq minutes d'étirements le matin prolongent les bienfaits entre deux séances" + icônes crayon/poubelle à droite.
- Barre de recherche "Rechercher un service...".
- Liste "Cycles & conseils par service" :
  - "Abonnement Cercle Ongles" — badge horloge "—" (pas de délai défini) — crayon
  - "Bain hydromassant" / sous-texte "buvez beaucoup d'eau après votre séance pour prolonger ses bienfaits" — badge "⏱ J+30" — crayon
  - "Balayage californien" / "dormez avec un foulard ou une taie en satin pour préserver votre coiffure plus longte..." (tronqué) — badge "⏱ J+28" — crayon
  - "Beauté des pieds complète" (accents mal rendus "Beautv√© ... complv√®te") / "une goutte d'huile à cuticules chaque soir prolonge la tenue et la brillance" — badge "⏱ J+21" — crayon

**Navigation / flow** : depuis Paramètres → "Conseils beauté". Les onglets filtrent la liste "Mes conseils" par famille de soin. "+ Ajouter" ouvre la modale "Nouveau conseil beauté" (écran suivant). Le crayon sur une ligne de "Cycles & conseils par service" ouvre probablement un mini-formulaire pour éditer le délai de relance (J+n) et le conseil associé à ce service.

**Détails visuels notables** : badge "J+30" en pilule beige clair = système de relance automatique basé sur un cycle en jours par service — pattern important pour la logique métier de suivi client (cf. "Suivi & recommandations" de la fiche client, écran 1). Bug d'encodage visible sur "Beauté" / "complète" (caractères accentués mal interprétés dans les données de démo — à noter mais pas un pattern de design).

---

## 14. Conseils beauté — filtré sur "Ongles"

**Fichier source** : `10.16.17.png`

**Structure de layout** : identique à l'écran précédent, onglet "Ongles" sélectionné (pilule dorée pleine).

**Composants et contenu**
- Carte conseil filtrée : label doré "ONGLES" + texte "portez des gants pour la vaisselle : le semi-permanent déteste l'eau chaude prolongée".
- Le bloc "Cycles & conseils par service" en dessous reste identique/non filtré (liste "Abonnement Cercle Ongles", "Bain hydromassant", "Balayage californien", "Beauté des pieds complète" avec les mêmes badges J+30/J+28/J+21) — confirme que le filtre par onglet n'agit que sur "Mes conseils", pas sur "Cycles & conseils par service".

**Navigation / flow** : simple changement de filtre côté client (pas de rechargement de page).

**Détails visuels notables** : un seul conseil affiché par filtre dans cet exemple de démo (la liste "Mes conseils" ne contient qu'un item par catégorie) — mais le pattern de carte est identique et duplicable pour plusieurs conseils par catégorie.

---

## 15. Modale "Nouveau conseil beauté"

**Fichier source** : `10.16.33.png`

**Structure de layout**
- Même pattern de bottom-sheet modale (poignée, croix fermeture, overlay flouté sur fond de page "Conseils beauté").
- Titre serif "Nouveau conseil beauté".
- Formulaire vertical : sélecteurs de "chips"/pills multi-groupes, puis textarea, puis 2 groupes de chips supplémentaires (visibles jusqu'à "types de cheveux", suite probablement hors cadre en bas).

**Composants et contenu**
1. Label section "FAMILLE DE SOIN" → grille de pills sélectionnables (2 rangées) : "Coiffure", "Soins cheveux", "Ongles", "Pédicure" (rangée 1), "Visage", "Épilation", "Massage & corps", "Cils" (rangée 2), puis "Général" seul en dessous (pill active, doré plein — sélection actuelle).
2. Label "VOTRE CONSEIL (TEL QU'IL APPARAÎTRA DANS LE MESSAGE)" → textarea avec placeholder "ex : dormez avec un bonnet en satin pour préserver vos boucles".
3. Texte d'aide : "La conseillère l'introduira par « En attendant, mon petit conseil : … » — commencez donc par un verbe, sans majuscule ni point final."
4. Label "RÉSERVÉ À CERTAINS TYPES DE PEAU (optionnel)" → pills : "normale", "sèche", "grasse", "mixte", "sensible" (rangée 1), "acnéique", "mature", "déshydratée" (rangée 2) — aucune sélectionnée.
5. Label "RÉSERVÉ À CERTAINS TYPES DE CHEVEUX (optionnel)" → pills : "Naturel", "Lisse", "Bouclé", "Crépu", "Défrisé" (rangée 1), "Tressé", "Coloré", "Mèché" (rangée 2, coupée en bas) — aucune sélectionnée.

**Navigation / flow** : ouvert via "+ Ajouter" depuis "Conseils beauté". Formulaire de création d'un conseil ciblé, avec logique de personnalisation par famille de soin + filtres optionnels de type de peau/cheveux — suggère que le moteur de messages (conseillère virtuelle, probablement le même agent que "Proposer" vu en fiche client) sélectionne le conseil pertinent selon le profil client.

**Détails visuels notables** : chips/pills non sélectionnées en contour fin gris sur fond blanc, sélectionnées en fond doré plein + texte blanc — pattern de sélection multiple cohérent avec les onglets déjà vus (mais ici plusieurs pills peuvent être actives simultanément pour peau/cheveux, contrairement aux onglets qui sont exclusifs). Formulaire long à scroll, organisé par sections avec labels en petites capitales grises.

---

## 16. Gestion Depot (Stock) — Vue d'ensemble

**Fichiers source** : `10.17.19.png`, `10.17.25.png` (même écran, scroll haut → bas)

**Structure de layout**
- Header : flèche retour, titre serif centré "Gestion Depot", icône image en haut à droite (probablement raccourci/export).
- Sélecteur d'entreprise ("Beauty and Co") puis sélecteur de salon ("Tous les salons"), chacun avec icône dédiée à gauche.
- Barre d'onglets horizontale pleine largeur (5 onglets, style pilule sur fond gris clair global).
- Bandeau alerte stock (fond rouge clair).
- 2 cartes KPI côte à côte.
- Liste de produits avec barre de progression de stock + bouton "Commander".

**Composants et contenu**
- Onglets : "🗂 Vue d'ensemble" (actif, fond noir), "📋 Demandes" (badge rouge "1"), "🏢 Depot", "🏬 Salon", "🕐 Historique".
- Bandeau alerte (icône triangle rouge) : "49 en rupture · 93 sous le seuil — à réapprovisionner".
- KPI "VALEUR DU STOCK" → "21 670 000 F" (grand, serif) ; KPI "À COMMANDER" → "122" (grand, doré).
- En-tête de liste : "225 PRODUITS · TRIÉS PAR URGENCE" + lien "Voir le détail >" à droite.
- Cartes produit (répétées, ~8 visibles au total sur les 2 captures), chacune avec : icône (sac ou flacon selon type), nom du produit en gras, ligne méta "🏢 Beauty and Co" + badge type ("REVENTE" vert ou "BACKBAR" violet), barre de progression horizontale très majoritairement vide avec une pointe rouge à gauche (= stock quasi nul), badge rond rouge avec chiffre "0" à droite (quantité en stock), texte "Commander ~N" en dessous du badge :
  - "Conditionneur Redken 300ml" — REVENTE — 0 en stock — Commander ~5
  - "Laque Fixation Forte 400ml" — REVENTE — 0 — Commander ~8
  - "Gel Coiffant Extra Strong" — REVENTE — 0 — Commander ~10
  - "Masque Charbon Detox Visage" — REVENTE — 0 — Commander ~4
  - "Creme Solaire SPF50 Visage" — REVENTE — 0 — Commander ~5
  - "Huile Seche Corps Multi-Usage" — REVENTE — 0 — Commander ~4
  - "Beurre de Karite Pur 200g" — REVENTE — 0 — Commander ~10
  - "Lotion Corporelle Hydratante 500ml" — REVENTE — 0 — Commander ~6
  - "Vernis Semi-Permanent Nude" — REVENTE — 0 — Commander ~8
  - "Top Coat Brillance" — BACKBAR (badge violet, icône goutte) — 0 — Commander ~8

**Navigation / flow** : accessible depuis le menu principal "Stock" de la sidebar (pas depuis Paramètres cette fois — item actif dans la sidebar = "Stock"). Les onglets "Demandes/Depot/Salon/Historique" mènent à des vues dédiées de gestion des stocks (non capturées en détail). "Voir le détail" mène probablement à la liste complète des 225 produits. Chaque carte produit pourrait être cliquable pour ajuster la commande.

**Détails visuels notables** : petite icône sablier "⏳" à gauche du bouton "Commander" (probablement indicateur d'urgence/délai de réappro). Distinction visuelle nette entre badge "REVENTE" (vert) et "BACKBAR" (violet), cohérente avec le toggle vu dans le formulaire produit (écran 12). Barre de progression quasi vide avec liseré rouge = code couleur d'urgence de rupture de stock, réutilisé de façon cohérente dans toute l'appli (même rouge que le bandeau d'alerte et le badge "0 en stock" de la liste produits de l'écran 10).

---

## Layout global commun (sidebar de navigation)

Présent à l'identique sur tous les écrans de cette partie (sauf dans les modales, qui masquent partiellement la sidebar via l'overlay) :
- **Logo** : icône diamant doré, "ELITE" (serif majuscules, grand), "privé" (script/italic doré, petit), sous-titre "BEAUTY AND CO" (petites capitales grises, tracking large).
- **Menu principal** (icône + libellé, une ligne par item) : Accueil (maison), Planning (calendrier), Clients (personnes), Suivi (cœur), Lookbook (étiquette), Stock (sac), Parametres (roue crantée). Item actif = fond pilule crème clair + icône/texte en doré ; items inactifs en gris.
- **Bloc profil utilisateur** (bas de sidebar, séparé par une ligne fine) : avatar rond initiales "PE" cerclé or, "Proprietaire Elite" (gras), "ADMIN" (petites capitales grises) ; puis lien "Deconnexion" (icône flèche sortie) ; puis mention "ELITE PRIVE v1.0" tout en bas, petite et grise.

Cette sidebar occupe environ 19% de la largeur totale de l'écran et reste fixe pendant le scroll du contenu principal.
