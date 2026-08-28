# Réservation au-dessus du Rendez-vous ; prise de rendez-vous hors de l'app

Jusqu'ici, `RendezVous` portait `{ clientId, staffId, serviceId, start, durationMin }` — un rendez-vous = **une** cliente, **une** praticienne, **une** prestation. Le vrai fonctionnement du salon Beauty and Co ne rentre pas dans ce moule :

- une cliente réserve souvent **plusieurs prestations à la fois** (soin + épilation, tissage + manucure) ;
- elle peut réserver **pour deux personnes** (une amie, un enfant) mais **une seule règle** au comptoir ;
- **plusieurs rendez-vous coexistent à la même heure** — praticiennes différentes ;
- certaines prestations se font **à deux praticiennes** en parallèle, ce qui divise le temps de chaise ;
- et le **parcours de prise de rendez-vous vit déjà sur la plateforme de réservation en ligne** — le refaire dans le point de vente était du travail dupliqué pour un geste rare.

## Décision

**Deux objets au lieu d'un.**

- **`Reservation`** — le niveau **payeuse**. `{ id, payerClientId, source: "en_ligne" | "comptoir", saleId?, rendezVous: RendezVous[] }`. C'est l'unité qu'on **encaisse** : une réservation → une Vente, un seul règlement. `saleId` porte la relation « En cours » (ex-`RendezVous.saleId`).
- **`RendezVous`** — désormais **atomique**. `{ id, reservationId, serviceId, staffId, secondStaffId?, beneficiaryClientId?, beneficiaryName?, start, durationMin, status }`. Une prestation, un créneau, un·e bénéficiaire, une praticienne — deux si `twoPractitionersEligible` (`secondStaffId`, `durationMin` déjà divisée). Occupe une lane du Planning ; apparaît sur **les deux** lanes quand `secondStaffId` est posé.

**`Service` gagne `twoPractitionersEligible: boolean`.** Le Menu (`lib/data/menu.ts`) est régénéré **verbatim** depuis le catalogue de réservation b&co (`b&co/lib/data/booking-services.ts`) : 107 prestations, 8 catégories (dont Mini&Co · Hair / Spa), ids/libellés/prix/durées/éligibilité « à 2 » identiques. La pastille « 2 » sur la tuile du Comptoir signale l'éligibilité.

**Bénéficiaire = fiche cliente _ou_ nom libre.** `beneficiaryName` (« Awa (amie) », « Salématou (7 ans) ») quand la personne n'a pas de fiche ; les deux champs absents ⇒ le bénéficiaire est la payeuse.

**La prise de rendez-vous est retirée du point de vente.** Plus de formulaire de création/édition (`components/journee/appointment-form-dialog.tsx` supprimé), plus de bouton « Nouveau rendez-vous », plus de « Décaler / modifier ». Le store perd `createAppointment` / `updateAppointment`. Seuls gestes sur un rendez-vous : **Confirmer**, **Annuler** (flips de statut), **Encaisser** (au niveau réservation).

## Conséquences

- **`Sale.originAppointmentId` → `originReservationId`.** `openNewTab({ reservationId })` sème une ligne de panier par prestation planifiée (fusion des identiques en quantité), payeuse = `payerClientId`, `beneficiary` posé sur la ligne quand ce n'est pas elle. Abandonner l'onglet libère `reservation.saleId` (ré-encaissable).
- **Encaisser + praticienne absente** : le garde-fou `ReplaceStaffDialog` liste maintenant **chaque** rendez-vous de la réservation dont la praticienne est indisponible et demande une remplaçante par ligne (`staffOverrides: Record<rvId, staffId>`).
- **Récap des ventes** : l'attribution par praticienne répartit le total de la vente **au prorata du prix de chaque prestation** de la réservation d'origine.
- **Planning / Accueil / Fiche réservation** : rendus à partir de `flattenRendezVous(reservations)` ; « Encaisser » agit sur `reservation.id` ; méta de lane = prestation + « pour {bénéficiaire} » + « à 2 ({seconde}) » + « +N sur la note ».
- Praticiennes : ajout d'**Adja** (esthéticienne) pour que les exemples de parallélisme tiennent.
- `CONTEXT.md` : nouvelles entrées **Réservation**, **Bénéficiaire** ; **Rendez-vous**, **Encaisser**, **Planning**, **Menu** amendées.
- `docs/USERFLOW.md` : modèle conceptuel (objets + carte relationnelle + états) et section Planning amendés.

## Alternatives écartées

- **Garder un `RendezVous` unique, multi-valué inline** (`beneficiaries: [{ clientId, prestations: [...] }]`). Écarté : illisible à plat, impossible à poser sur une lane sans re-agréger.
- **Renommer `Rendez-vous` → `Créneau` et introduire `Rendez-vous` comme niveau payeuse.** Écarté : casse trop de libellés existants (« un rendez-vous » = la venue, partout dans l'app et les docs).
- **Garder le formulaire de prise de rendez-vous** « au cas où ». Écarté : les réservations sont faites en ligne ; un constructeur multi-prestations dans le POS aurait été de la surface morte à maintenir.
