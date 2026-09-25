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
| `/` | [`app/page.tsx`](../app/page.tsx) | **Accueil** — centre de pilotage du jour | inline (cartes daisyUI — refonte Figma 156-72) |
| `/recap-ventes` | [`app/recap-ventes/page.tsx`](../app/recap-ventes/page.tsx) | **Récap des ventes** | inline (`BoardHeader` + `DataTable`/`StatBand`) |
| `/planning` | [`app/planning/page.tsx`](../app/planning/page.tsx) | **Planning** — calendrier par praticienne (ADR 0020) | [`components/planning/planning-board.tsx`](../components/planning/planning-board.tsx) |
| `/equipe` | [`app/equipe/page.tsx`](../app/equipe/page.tsx) | *(redirige vers `/planning`, ADR 0020 — n'a jamais été un écran distinct, ADR 0005)* | — |
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
| `Sidebar` | [`components/shell/sidebar.tsx`](../components/shell/sidebar.tsx) | Logo + nav 5 items + menu identité au pied (Mon compte / Déconnexion — plus de « Changer d'utilisateur » depuis ce menu, ADR 0026). Pas de section Réglages (ADR 0001). |
| `ComptoirBar` | [`components/shell/comptoir-bar.tsx`](../components/shell/comptoir-bar.tsx) | Barre pleine largeur ancrée au pied. Rose « Nouvelle vente » si 0 vente ; taupe (cliente + total + « Ouvrir le comptoir ») si ≥1 vente ouverte. Cachée quand le Comptoir est déployé. |
| `ComptoirPanel` | [`components/comptoir/comptoir-panel.tsx`](../components/comptoir/comptoir-panel.tsx) | Le Comptoir déployé (voir §4). |
| `AppDataProvider` | [`components/providers/app-data-provider.tsx`](../components/providers/app-data-provider.tsx) | Façade de compat ; `useAppData()` = `useAppStore()`. `computeTotals` réexporté ici. |
| `useSession` | [`lib/session.ts`](../lib/session.ts) | Qui tient le poste + PIN. `sessionStorage`, simulé. |

---

## 3. Écrans de navigation, un par un

### Accueil — `/` — [`app/page.tsx`](../app/page.tsx)
Landing, refonte Figma 156-72 (base daisyUI, cartes — plus de `Board`/`Lane`). `BoardHeader` (titre « {nom}, {salon du poste} » — salon porté par la session, pas par la personne ; plus de sous-titre ; `action` : filtre de salon `ChipFilter` **Tous les salons** — défaut · Almadies · Sea Plaza (ADR 0028, étendu à l'Accueil) ; **« Créer un rendez-vous »**, ouvre [`PriseRdvModal`](../components/prise-rdv/prise-rdv-modal.tsx) — le parcours de prise de rendez-vous b&co recopié, ADR 0032). Le bloc de compteurs « Le point du jour » est **retiré** (la journée est visible, la file a son lien). Deux sections :
1. **Cartes cadeaux** — [`AccueilGiftCards`](../components/journee/accueil-gift-cards.tsx) : aperçu de la file de préparation (ADR 0012) — les 3 commandes non résolues les plus anciennes, dans **exactement la même tuile et la même grille** que `/cartes-cadeaux` ([`GiftCardTile`](../components/journee/gift-card-tile.tsx) + `GIFT_CARD_GRID`). Plus de bouton scan ici (il vit sur la page dédiée). Lien **« Voir tout · N »** → `/cartes-cadeaux`. Section **masquée** quand il n'y a rien à préparer.
2. **Rendez-vous** — recherche (cliente nom/téléphone/e-mail, ou n° de rendez-vous `res-22` / `22` / `#22` — un numéro se retrouve quelles que soient les dates) + deux `DatePicker` **Du / Au** toujours visibles (défaut aujourd'hui → aujourd'hui ; plus de `Pills` de période) filtrent `reservationRows` (et le filtre de salon ci-dessus) au-delà du seul jour courant. Une cliente trouvée par la recherche — même sans rendez-vous dans la période affichée — apparaît en plus dans une grille **« Clientes »** (`ClientMatchCard`, jusqu'à 4) menant directement à `/clientele/[id]`. Bascule `SegmentedToggle` **Liste / Calendrier** (ADR 0019) — n'apparaît que quand Du = Au, le Calendrier ne sachant lire qu'un seul jour ; une plage de plusieurs jours retombe sur Liste sans bascule. Vide → « Journée libre » (aucun filtre actif) ou « Aucun résultat » (recherche/période sans correspondance) + lien planning.
   - **Liste** (défaut) — [`AccueilDayList`](../components/journee/accueil-day-list.tsx) : grille de cartes (une carte = une réservation, heure `start → end` · avatar + payeuse · composition du passage « 1 femme + 1 enfant » (ADR 0018) · jusqu'à 3 lignes prestations + extras (boisson/produit pré-commandé), le reste en « + N de plus » — la carte ne grossit jamais), groupée par tranche de 2h puis, dès que la période affichée dépasse un jour, par date (en-tête « Aujourd'hui »/« lundi 22 septembre »…, ADR 0029). Actions par carte : **Voir les détails** (`AppointmentDetailSheet`, détail complet) + **Encaisser** / **Voir la vente** (`useEncaissement`). **Ne partage plus la `DayList` du Planning** (divergence assumée le temps de la passe daisyUI du Planning — pas de rail, pas de filet « maintenant », pas de dépliage).
   - **Calendrier** — [`AccueilCalendar`](../components/journee/accueil-calendar.tsx) : rail heures + une colonne, fond blanc, un bloc = une réservation (grain réservation, pas rendez-vous), positionné sur son passage `start → end`, empilement d'avatars des praticiennes distinctes de la réservation. **Fond unique `#FFF1F1` sans contour (ADR 0033, remplace la palette de l'ADR 0022)** — chaque bloc liste ses prestations (regroupées, ×N, 4 max puis « +N autres ») et ses praticiennes en avatars 34px ; un bloc n'est jamais rogné, il grandit selon son contenu et le lane-packing se fait en pixels. Réservations simultanées → colonnes côte à côte (lane-packing glouton). Survol → `Tooltip` (payeuse, heure, composition, prestations, praticiennes) pour désambiguïser un bloc rétréci. Clic → `AppointmentDetailSheet`. Pas de bouton Encaisser inline (bloc trop étroit en cas de chevauchement).
- Dialogs : `AppointmentDetailSheet`, `encaissementDialog` via `useEncaissement`.

### Cartes cadeaux — `/cartes-cadeaux` — [`components/journee/gift-card-queue.tsx`](../components/journee/gift-card-queue.tsx) (ADR 0012)
En tête : **recherche** (acheteuse, destinataire, n° de carte, prestation, téléphone — accents/casse/tirets ignorés) + bouton **Scanner une carte** (`highlight-rose`, dialogue `ScanCamera` + saisie → remplit la recherche). Sans recherche : « À imprimer · N » (`a_imprimer`) puis « Prêtes à remettre · N » (`imprimee`). Avec recherche : + « Remises / expédiées · N » (`remise`/`livree`, lecture seule, « Remise le JJ/MM » via `handedOverAt`). Code exact → tuile mise en évidence (ombre rosée) ; après un scan, focus sur son action. Tuile [`GiftCardTile`](../components/journee/gift-card-tile.tsx) (partagée avec l'Accueil) : badge neutre Livraison/Retrait (icône) + code · acheteuse · **contenu** (`giftCardContent` : montant, ou noms des prestations d'une carte `prestations`) · cible (« Livrer à … » / tél `formatPhone` / adresse complète, ou « Retrait au comptoir » / « Prévenir au … ») · « Commandée il y a N j » (plus de bord ambre). Pied : **Imprimer** (`useReactToPrint` → `printGiftCardOrder`) puis **Réimprimer** (icône) + **Marquer comme remise/expédiée** (`markGiftCardOrderHandedOver`, pose `handedOverAt`). Données : [`lib/data/cartes-cadeaux.ts`](../lib/data/cartes-cadeaux.ts) (`GIFT_CARD_ORDERS`, `carteCadeauByCode`, `normalizeGiftCardCode`, `giftCardContent`). Face imprimée : [`components/shared/gift-card.tsx`](../components/shared/gift-card.tsx) (jamais rendue à l'écran ; carte prestations → liste des prestations, jamais de prix).

### Récap des ventes — `/recap-ventes` — [`app/recap-ventes/page.tsx`](../app/recap-ventes/page.tsx)
`BoardHeader` (retour « Accueil ») ; le corps garde les organismes de tableau (`Pills`, `DataTable`, `StatBand`).
- Filtre période (jour/semaine/mois — mais le mock ne tient que la session).
- `StatBand` (total encaissé, nb ventes, panier moyen) + 2 cartes (par mode de paiement, par praticienne — attribution au prorata du prix des prestations de la réservation d'origine).
- `DataTable` des ventes encaissées → clic ouvre `ReceiptView` en `Dialog`.
- Ligne « ventes abandonnées » en pied.

### Planning — `/planning` — [`components/planning/planning-board.tsx`](../components/planning/planning-board.tsx)
Refonte totale (ADR 0020, en-tête/vue Mois/palette/tri revus par ADR 0024, vue Mois retirée par
ADR 0025 — absente du Figma de référence) : un seul écran, le programme de chaque praticienne —
plus de bascule de vue, plus de liste de réservations (celle-ci ne vit plus que sur l'Accueil).
`/equipe` redirige ici.
- `BoardHeader section="Planning"` (sans `reset` — la relève au « Aujourd'hui » se fait sur `PeriodNav`).
- `PeriodNav` — barre compacte ◀ ▶ + libellé de période + bascule **Jour/Semaine** (Mois retiré,
  ADR 0025), remplace `DateStrip` (bandeau mois + rangée de 7 jours cliquables, retiré). Pas de
  sélecteur de jour indépendant : on atterrit sur un jour précis via la vue Semaine (clic sur une cellule).
- `Switch` « Afficher les annulés ».
- `RosterFilter` — sidebar (avatar + case à cocher par praticienne, groupée Coiffeur/Esthéticien/Ménage,
  poignée de glisser-déposer par ligne — réordonne dans son groupe, session-only —, menu `…` :
  Isoler cette ligne / Marquer absente aujourd'hui). Remplace le rail de colonnes.
- Corps : `DayTimeline` (vue Jour) ou `WeekTimeline` (vue Semaine) — **une ligne par praticienne**,
  le temps défile **horizontalement** en vue Jour (axe renversé vs l'ancien `DayGrid`). Zone grisée
  = hors de l'horaire hebdomadaire (`Praticienne.weeklySchedule`) du jour affiché ; ligne entière
  grisée (hachures) = jour de repos. Un bloc affiche, aligné en haut, l'heure + la **cliente** dans le
  fauteuil (bénéficiaire, sinon payeuse), puis la prestation en gris si le bloc a la hauteur ; deux prestations qui se chevauchent pour une même praticienne s'empilent en
  sous-lignes (`pack`), jamais superposées. Taper un bloc ouvre `AppointmentDetailSheet`.
  Couleur par praticienne : `praticienneAccent`, 16 teintes (ADR 0024, 2ᵉ exception nommée à la
  règle du signal unique après ADR 0022).
- **Aucune création de réservation** (ADR 0006/0009) — le bouton « Créer un
  rendez-vous » ne vit plus que sur l'Accueil. Sous-composants (inchangés) :
  - `AppointmentDetailSheet` — [`components/planning/appointment-detail-sheet.tsx`](../components/planning/appointment-detail-sheet.tsx) — fiche réservation : payeuse, prestations, praticiennes ; Encaisser / Ajuster / Annuler (motif facultatif).
  - `PriseRdvModal` — [`components/prise-rdv/prise-rdv-modal.tsx`](../components/prise-rdv/prise-rdv-modal.tsx) — « Modifier » : le parcours de prise de rendez-vous b&co, pré-rempli avec la réservation (ADR 0032). Voir la ligne « Créer / modifier un rendez-vous » plus bas.

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
- [`message-inbox.tsx`](../components/messages/message-inbox.tsx) — inbox ~380px : groupe « Programmées » (anniversaires en tête) + fils (non-lus d'abord). Ligne = avatar + nom + dernier msg + horodatage + `channel-glyph` coloré + jeton d'état (`Auto`/`Bot`/`Vous`/`Manager`) + point ambre si `unread`. Filtre `ClientSearchField`.
- [`conversation-panel.tsx`](../components/messages/conversation-panel.tsx) — en-tête (nom + palier + glyphe + jeton + actions de main) ; timeline (`message-bubble.tsx` cliente↔salon, carte système pour une relance envoyée, élément estompé pour une relance `pending`) ; composeur actif seulement si état `receptionniste`. `markConversationRead` au montage. Transfert manager via `ConfirmDialog`.
- [`channel-glyph.tsx`](../components/messages/channel-glyph.tsx), [`lib.ts`](../components/messages/lib.ts) (libellés d'état, horodatage relatif, tri).
- Store : `conversations` + actions `takeOverConversation` / `handBackToBot` / `transferToManager` / `sendClientMessage` (réponse cliente scriptée ~1,5 s) / `markConversationRead`. Données : [`lib/data/conversations.ts`](../lib/data/conversations.ts) (`CONVERSATIONS`, 9 fils).
- Sidebar : item « Messages » + badge ambre `conversations.filter(c => c.unread).length`.

### Catalogue — `/catalogue` — [`app/catalogue/page.tsx`](../app/catalogue/page.tsx)
`CatalogueSwitch` à 2 volets — **jamais relié à la caisse** (volet « Les Planches » et volet « Photos de référence » retirés, ADR 0021). Grammaire visuelle propre — [`components/catalogue/catalogue-parts.tsx`](../components/catalogue/catalogue-parts.tsx) (vitrine à cartes flottantes, pas « Le Tableau ») :
| Volet | Composant |
|---|---|
| Produits | [`components/catalogue/catalogue-produits.tsx`](../components/catalogue/catalogue-produits.tsx) (stock lu depuis le store) |
| Boissons | [`components/catalogue/catalogue-boissons.tsx`](../components/catalogue/catalogue-boissons.tsx) (le Bar b&co) |

### Compte — `/compte` — [`app/compte/page.tsx`](../app/compte/page.tsx)
Refonte « trois gestes » (ADR 0026, remplace l'ancien `Tabs` Profil/Sécurité) : **`PhotoSection`** + **`LogoutSection`** ([`components/compte/photo-section.tsx`](../components/compte/photo-section.tsx), [`logout-section.tsx`](../components/compte/logout-section.tsx)) en colonne de gauche, **`PasswordSection`** ([`password-section.tsx`](../components/compte/password-section.tsx)) en colonne de droite — mot de passe simulé, pas de PIN réel. Plus de `SwitchUserDialog` ni de changement d'utilisateur depuis ce menu ou la sidebar.

### Composants — `/composants` — [`app/composants/page.tsx`](../app/composants/page.tsx)
Vitrine hors métier : Fondations / Atomes / Molécules / Comptoir & Planning / Organismes.

---

## 4. Le Comptoir (overlay, sans route)

Monté par `AppShell`. `ComptoirPanel` ([`components/comptoir/comptoir-panel.tsx`](../components/comptoir/comptoir-panel.tsx)) affiché quand `comptoirDeployed`.
Bureau taupe + feuille crème. Étape courante = `activeSale.step` : `"vente"` | `"paiement"` | `"recu"`.

| Étape / zone | Composant | Fichier |
|---|---|---|
| Barre d'onglets de vente | `SaleTabsBar` | [`components/comptoir/sale-tabs-bar.tsx`](../components/comptoir/sale-tabs-bar.tsx) |
| Panneau menu (gauche) | `MenuPanel` | [`components/comptoir/menu-panel.tsx`](../components/comptoir/menu-panel.tsx) — onglets Prestations/Produits/Boissons, rail de catégories (2 niveaux), recherche |
| Blocs ticket partagés | `TicketFrame`/`TicketHead`/`TicketClientCard`/`TicketLineBody`/`TicketTotals` | [`components/comptoir/ticket-parts.tsx`](../components/comptoir/ticket-parts.tsx) — le même ticket dans la colonne de droite des 3 stations (ADR 0031) |
| Ticket panier (droite, `step: "vente"`) | `SaleCartPanel` | [`components/comptoir/sale-cart-panel.tsx`](../components/comptoir/sale-cart-panel.tsx) — cliente en tête, lignes (qty, retrait), total, Encaisser. **Plus de remise ici** |
| Station Règlement (`"paiement"`) | `SettlementStep` | [`components/comptoir/settlement-step.tsx`](../components/comptoir/settlement-step.tsx) — gauche : À encaisser, 4 tuiles (Carte/Espèces grosses icônes, Wave/OM logos, toutes libellées), 1 à 3 parts (dernière = reste calculé), `NumericKeypad`, rendu espèces |
| Ticket règlement (droite) | `SettlementTicket` (+ `RemiseComposer`) | [`components/comptoir/settlement-ticket.tsx`](../components/comptoir/settlement-ticket.tsx) — « Accorder une remise » → sélection de lignes → compositeur %/montant/code manager en pied ; étiquette « Remise −X · modifier » par ligne ; Confirmer l'encaissement |
| Avantages de la cliente | `AdvantagesSection` | [`components/comptoir/advantages-section.tsx`](../components/comptoir/advantages-section.tsx) — déjà payé (`CoverageSection`), carte cadeau dépliable, points ±100 |
| Moyens de paiement | `PAYMENT_MODES`, `PaymentModeGlyph` | [`components/comptoir/payment-modes.tsx`](../components/comptoir/payment-modes.tsx) |
| Ventilation remises | `DiscountBreakdown` | [`components/comptoir/discount-breakdown.tsx`](../components/comptoir/discount-breakdown.tsx) — une ligne par remise, partagée avec le Récap |
| Station Reçu (`"recu"`) | `ReceiptStep` | [`components/comptoir/receipt-step.tsx`](../components/comptoir/receipt-step.tsx) — gauche : vente encaissée, parts, motif de remise inline bloquant, suite ; droite : le ticket devenu reçu imprimable (`react-to-print`) |
| Scanner | `IdentifyDialog` | [`components/comptoir/identify-dialog.tsx`](../components/comptoir/identify-dialog.tsx) — `<video>` réel + lecture QR (`BarcodeDetector`) + **un seul champ code de fidélité** → attache la fiche (sa carte cadeau se lie ensuite d'elle-même), bouton « Annuler » (ADR 0013) |
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
`addCartLine`/`updateCartQty`/`removeCartLine`, `setGiftCardAdjustment` (la carte se lie seule via `updateSale`/`openNewTab` → `syncGiftCardToClient`, cf. `giftCardForClient`), `grantDiscount`/`setDiscountReason`, `setLoyaltyPointsUsed`, `confirmPayment`.
- **`computeTotals(sale)`** — pure, ligne 112 : ordre déjà payé → remises accordées (par ligne, ADR 0031) → points → carte cadeau → acompte. Constantes `RECEPTIONIST_MAX_PCT = 10`, `MAX_REMISE_PCT = 20`.

### Données mock — [`lib/data/`](../lib/data/)
| Fichier | Contient |
|---|---|
| `types.ts` | Modèle conceptuel partagé (`Praticienne`, `Cliente`, `Reservation`, `RendezVous`, `Sale`, `CartLine`, `Conversation`, `Message`, `Style`, `PreferenceDomain`…). |
| `clientele.ts` | `CLIENTS` + `clientFullName`/`clientInitial`/`searchClients`. |
| `planning.ts` | `RESERVATIONS` (réservations « du jour ») + `flattenRendezVous`, `reservationById`, `appointmentEndTime`, `timeToMinutes`. |
| `menu.ts` | `SERVICES` (verbatim du catalogue b&co), `PRODUITS`, `SERVICE_CATEGORIES`, `PRODUCT_CATEGORIES` (marques : Kérastase, Saryna Keys, Nefertiti, Beccy Wave, Autres), `KERASTASE_GAMMES`, `serviceById`. |
| `boissons.ts` | `BOISSONS` — le Bar b&co (type `Boisson`, sans catégorie ni stock, ADR 0016). |
| `praticiennes.ts` | `PRATICIENNES` (roster + `weeklySchedule` — horaire hebdomadaire récurrent, ADR 0020) + `scheduleFor`/`isWorkingOn`/`dayOfWeek`. |
| `conversations.ts` | `CONVERSATIONS` (9 fils de démo, ADR 0011) + `conversationByClientId` / `conversationById`. |
| `styles.ts` | `STYLES` (illustre les suggestions de la conseillère en Messages ; n'a plus de volet Catalogue dédié depuis ADR 0021). |
| `cartes-cadeaux.ts` | `CARTES_CADEAUX` + `carteCadeauByCode`, `normalizeGiftCardCode`, `giftCardExpiryLabel`. |
| `utilisateurs.ts` | `UTILISATEURS` (qui peut tenir le poste), `ROLE_LABEL`. |
| `pays.ts` | `PAYS_OPTIONS`, `PAYS_DEFAUT`. |

---

## 6. Kit UI — [`components/ui/`](../components/ui/)

- **`board.tsx`** — langage « Le Tableau » (ADR 0005) : `BoardHeader`, `Board`, `Lane`, `Legend`, `FlipChip`, `WeekStrip`, `ChipFilter`, `VoletSwitch`, `BoardEmpty`. Utilisé par Accueil, Clientèle (Messages a son propre langage maître-détail) — plus seulement `BoardHeader`/`ChipFilter` côté Planning depuis sa refonte daisyUI native (ADR 0020) ; Catalogue est passé à sa propre grammaire vitrine (`components/catalogue/catalogue-parts.tsx`, ADR 0021) ; `WeekStrip` n'a plus aucun appelant (export mort, gardé pour Clientèle si besoin).
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
| Programme d'une praticienne, semaine, absences | [`components/planning/planning-board.tsx`](../components/planning/planning-board.tsx) (`day-timeline.tsx`/`week-timeline.tsx`/`roster-filter.tsx`) |
| Ajuster/reprogrammer/annuler une réservation, encaisser depuis une fiche | `appointment-detail-sheet.tsx` + `prise-rdv/prise-rdv-modal.tsx` |
| Créer / modifier un rendez-vous — parcours b&co recopié (ADR 0032) | `components/prise-rdv/` : `prise-rdv-modal.tsx` (cadre mis à l'échelle + orchestration), `steps/clientes-step.tsx` (seule étape propre au PDV), autres fichiers recopiés du site ; `lib/prise-rdv/planifier.ts` (horaires libres, praticienne d'office) ; action store `saveParcoursReservation` |
| Roster / horaire hebdomadaire équipe | `RosterFilter`, [`lib/data/praticiennes.ts`](../lib/data/praticiennes.ts) (`weeklySchedule`) |
| Rechercher / créer une cliente | [`components/clientele/repertoire-view.tsx`](../components/clientele/repertoire-view.tsx), `new-client-dialog.tsx`, `shared/client-search-field.tsx` |
| Fiche cliente, notes, préférences, coordonnées | [`components/clientele/fiche-cliente-view.tsx`](../components/clientele/fiche-cliente-view.tsx) + `edit-*-dialog.tsx` |
| Carte / points de fidélité | `fidelite-view.tsx`, `loyalty-card.tsx` ; calcul dans `app-store.ts` (`confirmPayment`) |
| Messages / échanges / relances / anniversaires | [`components/messages/`](../components/messages/) ; store `conversations` + actions ; données [`lib/data/conversations.ts`](../lib/data/conversations.ts) |
| Cartes cadeaux (file, impression) | [`components/journee/gift-card-queue.tsx`](../components/journee/gift-card-queue.tsx) + [`components/shared/gift-card.tsx`](../components/shared/gift-card.tsx) ; ledger [`lib/data/cartes-cadeaux.ts`](../lib/data/cartes-cadeaux.ts) |
| Produits / boissons du Catalogue | [`app/catalogue/page.tsx`](../app/catalogue/page.tsx) + `components/catalogue/*` |
| Panier, encaissement, paiement, reçu | `components/comptoir/*` (voir §4), état dans `lib/store/app-store.ts` |
| Remises (par ligne, code manager), carte cadeau, points | `settlement-ticket.tsx` + `advantages-section.tsx` + `computeTotals` / `grantDiscount` / `removeRemise` dans `app-store.ts` (ADR 0002/0003/0008/0031) |
| Modes de paiement, paiement en 3 parts | [`components/comptoir/settlement-step.tsx`](../components/comptoir/settlement-step.tsx) + `payment-modes.tsx` |
| Nouvelle vente / barre du comptoir | [`components/shell/comptoir-bar.tsx`](../components/shell/comptoir-bar.tsx) |
| Sidebar / navigation / menu identité | [`components/shell/sidebar.tsx`](../components/shell/sidebar.tsx) |
| Profil, PIN, changer d'utilisateur | `app/compte/page.tsx` + `components/compte/*` ; `lib/session.ts` |
| Menu des prestations / prix / durées | [`lib/data/menu.ts`](../lib/data/menu.ts) (verbatim b&co) ; boissons du Bar → [`lib/data/boissons.ts`](../lib/data/boissons.ts) |
| Un composant UI (bouton, dialog, tableau…) | [`components/ui/`](../components/ui/) — vitrine `/composants` |
| Couleurs / typo / tokens | [`app/globals.css`](../app/globals.css), [`../DESIGN.md`](../DESIGN.md) |
