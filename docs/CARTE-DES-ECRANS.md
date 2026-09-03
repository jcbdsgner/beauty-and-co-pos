# Carte des écrans — Point de vente (Beauty and Co)

> **But de ce document.** Retrouver instantanément *où vit* une page ou un composant sans
> re-scanner tout le projet. Scan complet effectué le **2026-09-01** (branche `main`).
> Vocabulaire canonique : [`../CONTEXT.md`](../CONTEXT.md). Parcours cible : [`USERFLOW.md`](USERFLOW.md).
> Décisions : [`adr/`](adr/). `FEATURES.md` est **historique (pré-refonte)** — ne pas s'y fier.
>
> Stack : Next.js 16 (App Router, `app/`), React 19, Zustand, Tailwind v4, Radix. Bureau uniquement.
> **Tout est mock en mémoire** (`lib/data/*`) — un refresh réinitialise tout. Aucun backend.

---

## 1. Table de routage (raccourci)

| Route | Fichier page | Écran | Rendu par |
|---|---|---|---|
| `/` | [`app/page.tsx`](../app/page.tsx) | **Accueil** — centre de pilotage du jour | inline (langage « Le Tableau ») |
| `/recap-ventes` | [`app/recap-ventes/page.tsx`](../app/recap-ventes/page.tsx) | **Récap des ventes** | inline (`BoardHeader` + `DataTable`/`StatBand`) |
| `/planning` | [`app/planning/page.tsx`](../app/planning/page.tsx) | **Planning** (groupé par praticienne) | [`components/planning/planning-board.tsx`](../components/planning/planning-board.tsx) |
| `/equipe` | [`app/equipe/page.tsx`](../app/equipe/page.tsx) | **Équipe** = Planning sur la vue par praticienne | même `PlanningBoard` (`initialView="praticienne"`) |
| `/clientele` | [`app/clientele/page.tsx`](../app/clientele/page.tsx) | **Clientèle** — recherche d'abord | [`components/clientele/repertoire-view.tsx`](../components/clientele/repertoire-view.tsx) |
| `/clientele/[id]` | [`app/clientele/[id]/page.tsx`](../app/clientele/[id]/page.tsx) | **Fiche cliente** | [`components/clientele/fiche-cliente-view.tsx`](../components/clientele/fiche-cliente-view.tsx) |
| `/clientele/[id]/fidelite` | [`app/clientele/[id]/fidelite/page.tsx`](../app/clientele/[id]/fidelite/page.tsx) | **Carte de fidélité** (plein écran, imprimable) | [`components/clientele/fidelite-view.tsx`](../components/clientele/fidelite-view.tsx) |
| `/messages` | [`app/messages/page.tsx`](../app/messages/page.tsx) | **Messages** — messagerie maître-détail (ex-Relances, ADR 0011) | [`components/messages/messages-view.tsx`](../components/messages/messages-view.tsx) |
| `/cartes-cadeaux` | [`app/cartes-cadeaux/page.tsx`](../app/cartes-cadeaux/page.tsx) | **Cartes cadeaux** — file de commandes à préparer (drill-in Accueil, ADR 0012) | [`components/journee/gift-card-queue.tsx`](../components/journee/gift-card-queue.tsx) |
| `/catalogue` | [`app/catalogue/page.tsx`](../app/catalogue/page.tsx) | **Catalogue** — 3 volets | inline + `components/catalogue/*` |
| `/compte` | [`app/compte/page.tsx`](../app/compte/page.tsx) | **Compte** (Profil / Sécurité) | `components/compte/*` |
| `/composants` | [`app/composants/page.tsx`](../app/composants/page.tsx) | **Composants** (vitrine du système de design, ~50 composants) | inline |

**Le Comptoir n'a pas de route.** C'est un overlay `fixed inset-0` monté une fois par le layout,
piloté par `comptoirDeployed` dans le store. Voir §4.

Nav de la sidebar (5 items) : Accueil · Planning · Clientèle · Messages · Catalogue.
`/recap-ventes` est rattaché à Accueil, `/equipe` à Planning, `/compte` au menu identité.

---

## 2. Coquille applicative (présente partout)

Montée par [`app/layout.tsx`](../app/layout.tsx) → [`components/shell/app-shell.tsx`](../components/shell/app-shell.tsx).
Structure : `Sidebar` | ( page scrollable `max-w-6xl` + `ComptoirBar` ) + `ComptoirPanel`. Pas d'en-tête de coquille — chaque page porte son propre `BoardHeader`.

| Composant | Fichier | Rôle |
|---|---|---|
| `Sidebar` | [`components/shell/sidebar.tsx`](../components/shell/sidebar.tsx) | Logo + nav 5 items + menu identité au pied (Mon compte / Changer d'utilisateur / Déconnexion). Pas de section Réglages (ADR 0001). |
| `ComptoirBar` | [`components/shell/comptoir-bar.tsx`](../components/shell/comptoir-bar.tsx) | Barre pleine largeur ancrée au pied. Rose « Nouvelle vente » si 0 vente ; taupe (cliente + total + « Ouvrir le comptoir ») si ≥1 vente ouverte. Cachée quand le Comptoir est déployé. |
| `ComptoirPanel` | [`components/comptoir/comptoir-panel.tsx`](../components/comptoir/comptoir-panel.tsx) | Le Comptoir déployé (voir §4). |
| `AppDataProvider` | [`components/providers/app-data-provider.tsx`](../components/providers/app-data-provider.tsx) | Façade de compat ; `useAppData()` = `useAppStore()`. `computeTotals` réexporté ici. |
| `useSession` | [`lib/session.ts`](../lib/session.ts) | Qui tient le poste + PIN. `sessionStorage`, simulé. |

---

## 3. Écrans de navigation, un par un

### Accueil — `/` — [`app/page.tsx`](../app/page.tsx)
Landing. Langage « Le Tableau » (ADR 0005). `BoardHeader` avec une `action` : lien externe **« Créer un rendez-vous »** (`BOOKING_URL` de [`lib/data/planning.ts`](../lib/data/planning.ts), `Button external`) — 2ᵉ point d'entrée vers la plateforme de réservation, l'autre étant le pied du dialogue d'édition (ADR 0009). Deux `Board` (widget « Tournée du matin » retiré ADR 0011, section gift-cards inline retirée ADR 0012) :
1. **Le point du jour** — 2 `PointCell` : **« Cartes à préparer »** (compteur `giftCardOrders` non résolus) → `/cartes-cadeaux`, **« Rendez-vous du jour »** → `/planning`. *(« Encaissé aujourd'hui » a quitté l'Accueil — reste via `/recap-ventes`.)*
2. **Le jour** — `DayList` (une ligne = une réservation, triée par heure, dépliable en prestations), partagé avec le Planning (ADR 0014) ; bouton **Encaisser** par réservation. Pas de basculeur de vue ici (Accueil = vue chrono seule). Le compteur de RDV du jour ne vit que dans la cellule « Rendez-vous du jour » ci-dessus.
- Dialogs : `AppointmentDetailSheet`, `encaissementDialog` via `useEncaissement`.

### Cartes cadeaux — `/cartes-cadeaux` — [`components/journee/gift-card-queue.tsx`](../components/journee/gift-card-queue.tsx) (ADR 0012)
File des `GiftCardOrder` non résolus, **deux plaques** pour les deux gestes : « À imprimer · N » (`a_imprimer`) puis « Prêtes à remettre · N » (`imprimee`) — pas de jeton d'état, la légende de plaque porte la phase. Une ligne = colonne figure (montant + ancienneté « 3 j », **bord ambre si ≥ 4 j en attente**) · acheteuse + badge Retrait/Livraison · cible de remise (« Pour {destinataire} » / « Livrer à {destinataire} — tél · adresse » / « Retrait au comptoir — prévenir au {tél} »). Actions : **Imprimer** (`useReactToPrint` sur un `GiftCard` hors-écran par row → `printGiftCardOrder`) puis **Réimprimer** (outline) + **Marquer comme remise/expédiée** (`markGiftCardOrderHandedOver` → quitte la file). Store : `giftCardOrders` slice. Données : [`lib/data/cartes-cadeaux.ts`](../lib/data/cartes-cadeaux.ts) (`GIFT_CARD_ORDERS` + ledger `CARTES_CADEAUX` inchangé). Face imprimée : [`components/shared/gift-card.tsx`](../components/shared/gift-card.tsx) (jamais rendue à l'écran).

### Récap des ventes — `/recap-ventes` — [`app/recap-ventes/page.tsx`](../app/recap-ventes/page.tsx)
`BoardHeader` (retour « Accueil ») ; le corps garde les organismes de tableau (`Pills`, `DataTable`, `StatBand`).
- Filtre période (jour/semaine/mois — mais le mock ne tient que la session).
- `StatBand` (total encaissé, nb ventes, panier moyen) + 2 cartes (par mode de paiement, par praticienne — attribution au prorata du prix des prestations de la réservation d'origine).
- `DataTable` des ventes encaissées → clic ouvre `ReceiptView` en `Dialog`.
- Ligne « ventes abandonnées » en pied.

### Planning — `/planning` (et Équipe `/equipe`) — [`components/planning/planning-board.tsx`](../components/planning/planning-board.tsx)
Un seul composant `PlanningBoard`, prop `initialView` (`"chrono"` | `"praticienne"` | `"grille"`) — `/planning` → `chrono`, `/equipe` → `praticienne` (ADR 0014).
- `BoardHeader section="Planning"` + `reset`.
- `WeekStrip` (sélecteur de jour sur la semaine).
- `ChipFilter` de vue (Liste chronologique / Par praticienne / Grille calendrier) + `Switch` « Afficher les rendez-vous annulés ».
- `Board` « Le jour » avec **rail de légende 280px** = roster de l'équipe (chacune + horaire de présence du jour). Groupes Équipe / Ménage.
- **Liste chronologique** (défaut) : `DayList` — une ligne par réservation, triée par heure, dépliable en prestations. **Par praticienne** : lanes groupées, grain rendez-vous. **Grille calendrier** : `DayGrid` — heures × praticiennes, blocs positionnés.
- Par lane : Encaisser, ouvrir `AppointmentDetailSheet`, menu `…` (marquer indisponible, voir).
- **Aucune création de réservation** (ADR 0006/0009). Sous-composants :
  - `AppointmentDetailSheet` — [`components/planning/appointment-detail-sheet.tsx`](../components/planning/appointment-detail-sheet.tsx) — fiche réservation : payeuse, prestations, praticiennes ; Encaisser / Ajuster / Annuler (motif facultatif).
  - `EditRendezVousDialog` — [`components/planning/edit-rendez-vous-dialog.tsx`](../components/planning/edit-rendez-vous-dialog.tsx) — ajuster (prestation/praticienne/bénéficiaire), reprogrammer, ajouter/retirer un rendez-vous, annuler. Bouton « Créer un rendez-vous » → plateforme externe.

### Clientèle — `/clientele` — [`components/clientele/repertoire-view.tsx`](../components/clientele/repertoire-view.tsx)
Recherche d'abord (mécanisme partagé = `ClientSearchField` / `searchClients`).
- Hors recherche : `Board` « Vues récemment » (store `recentClientIds`) + « Attendues aujourd'hui ».
- `Board` « Tout l'annuaire » avec `ChipFilter` (Toutes / Nouvelles / Historique / VIP).
- `NewClientDialog` — [`components/clientele/new-client-dialog.tsx`](../components/clientele/new-client-dialog.tsx) — création cliente, pré-remplissage depuis la requête, garde anti-doublon téléphone, pays de résidence.

### Fiche cliente — `/clientele/[id]` — [`components/clientele/fiche-cliente-view.tsx`](../components/clientele/fiche-cliente-view.tsx)
En-tête collant (avatar + nom sur bandeau) + 2 colonnes de `Board` :
- Gauche : **Valeur cliente**, **Échanges** (aperçu 2 derniers messages + « Voir les échanges » → `/messages?client=<id>`), **Notes** (rangeables par domaine de préférence).
- Droite : **Carte de fidélité** (→ `/clientele/[id]/fidelite`), **Coordonnées** (+ praticienne préférée), **Préférences beauté** (5 domaines), **Abonnement** (vide).
- Dialogs : `EditCoordonneesDialog`, `EditPreferencesDialog` ([`components/clientele/`](../components/clientele/)). `StyleDetailDialog` pour une reco.
- `noteClientViewed(id)` appelé au montage (alimente « Vues récemment »).

### Carte de fidélité — `/clientele/[id]/fidelite` — [`components/clientele/fidelite-view.tsx`](../components/clientele/fidelite-view.tsx)
Plein écran. `LoyaltyCard` ([`components/clientele/loyalty-card.tsx`](../components/clientele/loyalty-card.tsx)) — plaque « carte de crédit » taupe→rose, QR démo dérivé de l'id. Télécharger (canvas), imprimer, envoyer (WhatsApp/e-mail simulés).

### Messages — `/messages` — [`components/messages/messages-view.tsx`](../components/messages/messages-view.tsx) (ex-Relances, ADR 0011)
Messagerie maître-détail. Sélection par `?client=<id>`. **La réceptionniste échange** mais ne configure rien.
- [`message-inbox.tsx`](../components/messages/message-inbox.tsx) — inbox ~380px : groupe « Programmées » (anniversaires en tête) + fils (non-lus d'abord). Ligne = avatar + nom + dernier msg + horodatage + `channel-glyph` coloré + jeton d'état (`Auto`/`Conseillère`/`Vous`/`Direction`) + point ambre si `unread`. Filtre `ClientSearchField`.
- [`conversation-panel.tsx`](../components/messages/conversation-panel.tsx) — en-tête (nom + palier + glyphe + jeton + actions de main) ; timeline (`message-bubble.tsx` cliente↔salon, carte système pour une relance envoyée, élément estompé pour une relance `pending`) ; composeur actif seulement si état `receptionniste`. `markConversationRead` au montage. Transfert direction via `ConfirmDialog`.
- [`channel-glyph.tsx`](../components/messages/channel-glyph.tsx), [`lib.ts`](../components/messages/lib.ts) (libellés d'état, horodatage relatif, tri).
- Store : `conversations` + actions `takeOverConversation` / `handBackToConseillere` / `transferToDirection` / `sendClientMessage` (réponse cliente scriptée ~1,5 s) / `markConversationRead`. Données : [`lib/data/conversations.ts`](../lib/data/conversations.ts) (`CONVERSATIONS`, 9 fils).
- Sidebar : item « Messages » + badge ambre `conversations.filter(c => c.unread).length`.

### Catalogue — `/catalogue` — [`app/catalogue/page.tsx`](../app/catalogue/page.tsx)
`VoletSwitch` à 3 volets — **jamais relié à la caisse** (volet « Photos de référence » retiré v2.6) :
| Volet | Composant |
|---|---|
| Les Planches | [`components/catalogue/catalogue-styles.tsx`](../components/catalogue/catalogue-styles.tsx) (+ `style-detail-dialog.tsx`, `style-meta.ts`) |
| Produits | [`components/catalogue/catalogue-produits.tsx`](../components/catalogue/catalogue-produits.tsx) (stock lu depuis le store) |
| Boissons | [`components/catalogue/catalogue-boissons.tsx`](../components/catalogue/catalogue-boissons.tsx) (le Bar b&co) |

### Compte — `/compte` — [`app/compte/page.tsx`](../app/compte/page.tsx)
`Tabs` : **Profil** ([`components/compte/profil-view.tsx`](../components/compte/profil-view.tsx)) et **Sécurité** ([`components/compte/securite-view.tsx`](../components/compte/securite-view.tsx), changement de PIN simulé).
`SwitchUserDialog` ([`components/compte/switch-user-dialog.tsx`](../components/compte/switch-user-dialog.tsx)) — aussi ouvert depuis la sidebar.

### Composants — `/composants` — [`app/composants/page.tsx`](../app/composants/page.tsx)
Vitrine hors métier : Fondations / Atomes / Molécules / Comptoir & Planning / Organismes.

---

## 4. Le Comptoir (overlay, sans route)

Monté par `AppShell`. `ComptoirPanel` ([`components/comptoir/comptoir-panel.tsx`](../components/comptoir/comptoir-panel.tsx)) affiché quand `comptoirDeployed`.
Bureau taupe + feuille crème. Étape courante = `activeSale.step` : `"vente"` | `"paiement"` | `"recu"`.

| Étape / zone | Composant | Fichier |
|---|---|---|
| Barre d'onglets de vente | `SaleTabsBar` | [`components/comptoir/sale-tabs-bar.tsx`](../components/comptoir/sale-tabs-bar.tsx) |
| Panneau menu (gauche) | `MenuPanel` | [`components/comptoir/menu-panel.tsx`](../components/comptoir/menu-panel.tsx) — services/produits, catégories, recherche |
| Ticket (droite) | `SaleCartPanel` | [`components/comptoir/sale-cart-panel.tsx`](../components/comptoir/sale-cart-panel.tsx) — cliente en tête, lignes, total, Encaisser |
| Remises | `DiscountSection` (+ `DiscountBreakdown`) | [`components/comptoir/discount-section.tsx`](../components/comptoir/discount-section.tsx) — carte cadeau, points, remise accordée (10 %/20 % + code manager) |
| Étape paiement | `PaymentStep` | [`components/comptoir/payment-step.tsx`](../components/comptoir/payment-step.tsx) — tuiles Wave / Orange Money (logos) / Carte / Espèces, `NumericKeypad`, paiement mixte |
| Étape reçu | `ReceiptStep` | [`components/comptoir/receipt-step.tsx`](../components/comptoir/receipt-step.tsx) — impression `react-to-print`, motif de remise bloquant post-paiement |
| Scanner | `IdentifyDialog` | [`components/comptoir/identify-dialog.tsx`](../components/comptoir/identify-dialog.tsx) — `<video>` réel + lecture QR (`BarcodeDetector`) + **un seul champ code** routé par ce qu'il résout (fidélité → fiche ; carte cadeau → détentrice + application ; repli au porteur), bouton « Annuler » (ADR 0013) |
| Envoi reçu | `SendReceiptButtons` | [`components/comptoir/send-receipt-buttons.tsx`](../components/comptoir/send-receipt-buttons.tsx) — partagé avec Récap |

### Module « journee/ » (encaissement partagé)
| Composant | Fichier | Rôle |
|---|---|---|
| `useEncaissement` | [`components/journee/use-encaissement.tsx`](../components/journee/use-encaissement.tsx) | Hook « Encaisser » partagé (Accueil, Planning, fiche réservation). Garde : praticienne absente → choisir remplaçante. |
| `ReplaceStaffDialog` | [`components/journee/replace-staff-dialog.tsx`](../components/journee/replace-staff-dialog.tsx) | Choix de la remplaçante avant ouverture du Comptoir. |
| `ReceiptView` | [`components/journee/receipt-view.tsx`](../components/journee/receipt-view.tsx) | Reçu lecture seule (Récap des ventes). |

---

## 5. State & données

### Store — [`lib/store/app-store.ts`](../lib/store/app-store.ts) (`useAppStore`, Zustand)
State : `clients`, `reservations`, `praticiennes`, `produits`, `sales`, `openTabIds`, `activeSaleId`,
`comptoirDeployed`, `recentClientIds`, `conversations`.
Actions clés : `addClient`/`updateClient`, `cancelAppointment`/`rescheduleRendezVous`/`updateRendezVous`/`addRendezVous`/`removeRendezVous`, `markStaffUnavailable`,
`deployComptoir`/`collapseComptoir`, `openNewTab`(prefill résa)/`switchTab`/`closeTab`,
`addCartLine`/`updateCartQty`/`removeCartLine`, `applyGiftCard`, `grantDiscount`/`setDiscountReason`, `setLoyaltyPointsUsed`, `confirmPayment`.
- **`computeTotals(sale)`** — pure, ligne 112 : ordre remise accordée → points → carte cadeau. Constantes `RECEPTIONIST_MAX_PCT = 10`, `MAX_REMISE_PCT = 20`.

### Données mock — [`lib/data/`](../lib/data/)
| Fichier | Contient |
|---|---|
| `types.ts` | Modèle conceptuel partagé (`Praticienne`, `Cliente`, `Reservation`, `RendezVous`, `Sale`, `CartLine`, `Conversation`, `Message`, `Style`, `PreferenceDomain`…). |
| `clientele.ts` | `CLIENTS` + `clientFullName`/`clientInitial`/`searchClients`. |
| `planning.ts` | `RESERVATIONS` (réservations « du jour ») + `flattenRendezVous`, `reservationById`, `appointmentEndTime`, `timeToMinutes`. |
| `menu.ts` | `SERVICES` (verbatim du catalogue b&co), `PRODUITS`, `SERVICE_CATEGORIES`, `PRODUCT_CATEGORIES`, `serviceById`. |
| `praticiennes.ts` | `PRATICIENNES` (roster + horaires du jour). |
| `conversations.ts` | `CONVERSATIONS` (9 fils de démo, ADR 0011) + `conversationByClientId` / `conversationById`. |
| `styles.ts` | `STYLES` (Catalogue → Les Planches). |
| `cartes-cadeaux.ts` | `CARTES_CADEAUX` + `carteCadeauByCode`, `normalizeGiftCardCode`, `giftCardExpiryLabel`. |
| `utilisateurs.ts` | `UTILISATEURS` (qui peut tenir le poste), `ROLE_LABEL`. |
| `pays.ts` | `PAYS_OPTIONS`, `PAYS_DEFAUT`. |

---

## 6. Kit UI — [`components/ui/`](../components/ui/)

- **`board.tsx`** — langage « Le Tableau » (ADR 0005) : `BoardHeader`, `Board`, `Lane`, `Legend`, `FlipChip`, `WeekStrip`, `ChipFilter`, `VoletSwitch`, `BoardEmpty`. Utilisé par Accueil, Planning, Clientèle, Catalogue (Messages a son propre langage maître-détail).
- **`atoms/`** — `button`, `badge`, `avatar`, `card`, `text-input`, `textarea`, `select`, `checkbox`, `switch`, `search-input`, `icon-button`, `logo`, `brand-mark`, `hero-number`, `progress-bar`, `round-step-button`, `photo-placeholder`, `spinner`, `skeleton`, `separator`, `tooltip`, `field-label`, `icons`.
- **`molecules/`** — `dialog`, `confirm-dialog`, `popover`, `dropdown-menu`, `tabs`, `accordion`, `command`, `pills`, `segmented-toggle`, `radio-group`, `stepper`, `numeric-keypad`, `date-picker`, `file-upload`, `input-otp`, `toast`, `alert`, `breadcrumb`, `empty-state`, `stat-tile`, `person-card`, `relance-card`, `appointment-timeline-row`, `sale-tray-trigger`, `field`, `carousel`.
- **`organisms/`** — `toolbar`, `data-table`, `docked-panel`.
- Partagé : [`components/shared/client-search-field.tsx`](../components/shared/client-search-field.tsx) (recherche cliente Comptoir + Messages) ; [`components/shared/gift-card.tsx`](../components/shared/gift-card.tsx) (`GiftCard` — face carte cadeau, famille visuelle `LoyaltyCard`).

Tokens de marque : [`app/globals.css`](../app/globals.css) — `--core-brand-color` (rose), `--brand-taupe-muted`, `--brand-cream`, `--brand-rose-soft`, `--brand-lilac` (VIP), `--pos-accent-dark`, `--board-*` (groove, amber = LE signal). Détail : [`../DESIGN.md`](../DESIGN.md).

---

## 7. « On me demande X → je vais où »

| Demande | Fichier(s) de départ |
|---|---|
| Écran d'accueil / du jour | [`app/page.tsx`](../app/page.tsx) |
| Chiffre d'affaires, ventes du jour, reçus historiques | [`app/recap-ventes/page.tsx`](../app/recap-ventes/page.tsx) |
| Agenda, semaine, absences, ajuster/reprogrammer/annuler une réservation | [`components/planning/planning-board.tsx`](../components/planning/planning-board.tsx) + `appointment-detail-sheet.tsx` + `edit-rendez-vous-dialog.tsx` |
| Roster / horaires équipe | `PlanningBoard` (rail), [`lib/data/praticiennes.ts`](../lib/data/praticiennes.ts) |
| Rechercher / créer une cliente | [`components/clientele/repertoire-view.tsx`](../components/clientele/repertoire-view.tsx), `new-client-dialog.tsx`, `shared/client-search-field.tsx` |
| Fiche cliente, notes, préférences, coordonnées | [`components/clientele/fiche-cliente-view.tsx`](../components/clientele/fiche-cliente-view.tsx) + `edit-*-dialog.tsx` |
| Carte / points de fidélité | `fidelite-view.tsx`, `loyalty-card.tsx` ; calcul dans `app-store.ts` (`confirmPayment`) |
| Messages / échanges / relances / anniversaires | [`components/messages/`](../components/messages/) ; store `conversations` + actions ; données [`lib/data/conversations.ts`](../lib/data/conversations.ts) |
| Cartes cadeaux (file, impression) | [`components/journee/gift-card-queue.tsx`](../components/journee/gift-card-queue.tsx) + [`components/shared/gift-card.tsx`](../components/shared/gift-card.tsx) ; ledger [`lib/data/cartes-cadeaux.ts`](../lib/data/cartes-cadeaux.ts) |
| Planches / photos / produits / boissons | [`app/catalogue/page.tsx`](../app/catalogue/page.tsx) + `components/catalogue/*` |
| Panier, encaissement, paiement, reçu | `components/comptoir/*` (voir §4), état dans `lib/store/app-store.ts` |
| Remises (carte cadeau, points, remise accordée, code manager) | [`components/comptoir/discount-section.tsx`](../components/comptoir/discount-section.tsx) + `computeTotals` / `grantDiscount` dans `app-store.ts` (ADR 0002/0003/0008) |
| Modes de paiement (Wave, Orange Money…) | [`components/comptoir/payment-step.tsx`](../components/comptoir/payment-step.tsx) |
| Nouvelle vente / barre du comptoir | [`components/shell/comptoir-bar.tsx`](../components/shell/comptoir-bar.tsx) |
| Sidebar / navigation / menu identité | [`components/shell/sidebar.tsx`](../components/shell/sidebar.tsx) |
| Profil, PIN, changer d'utilisateur | `app/compte/page.tsx` + `components/compte/*` ; `lib/session.ts` |
| Menu des prestations / prix / durées | [`lib/data/menu.ts`](../lib/data/menu.ts) (verbatim b&co) |
| Un composant UI (bouton, dialog, tableau…) | [`components/ui/`](../components/ui/) — vitrine `/composants` |
| Couleurs / typo / tokens | [`app/globals.css`](../app/globals.css), [`../DESIGN.md`](../DESIGN.md) |
