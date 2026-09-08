# Forfaits, Abonnements & Packs : décomptés au comptoir, jamais vendus

b&co introduit les **Forfaits** (plans d'abonnement) et les **Packs** (lots de prestations
prépayées à −20 %), avec une souscription / un achat en ligne et une consommation
automatique à la confirmation d'une réservation
(`b&co/docs/backoffice-spec.md`). point-de-vente doit savoir les **honorer** quand une
cliente encaisse — mais rien de plus.

**Décidé :**

1. **Décompte seul.** La réceptionniste **consomme** une prestation d'un Pack ou d'un
   Abonnement existant ; elle n'en **vend** jamais et ne souscrit personne. C'est cohérent
   avec toute l'app : une prestation naît d'une réservation (ADR 0006), une carte cadeau
   s'achète hors app (ADR 0002), la direction ne se connecte pas (ADR 0001). Un Pack ou
   une souscription qui naîtrait au comptoir romprait ce principe et réintroduirait un
   paiement récurrent dans une app qui n'en a pas.

2. **Le décompte a lieu à « Confirmer l'encaissement »**, définitivement — pas à l'arrivée
   de la réservation. b&co consomme à la confirmation de la réservation ; point-de-vente
   n'a pas de parcours de réservation, l'encaissement est son seul moment de vérité. Une
   vente abandonnée ne décompte rien.

3. **point-de-vente détecte la couverture lui-même**, depuis son propre ledger simulé
   (`lib/data/abonnements.ts`, `lib/data/pack-purchases.ts`). La `Reservation` n'arrive
   avec aucun indicateur de couverture — les deux mocks ne sont pas intégrés et les gestes
   de point-de-vente ne repartent pas vers la plateforme (ADR 0009). Un lecteur venu de
   b&co s'attendrait à ce que la réservation porte déjà la couverture : ici, non.

4. **Ce n'est pas une Remise.** Une prestation couverte est **facturée 0 F** et **sort de
   l'assiette** de la remise accordée et des points. Ordre : couverture Pack/Abonnement →
   remise accordée → points → carte cadeau → acompte. Modèle : l'**Acompte** (ADR 0015),
   pas la carte cadeau.

5. **Auto-appliqué, décochable, groupé — zéro geste obligatoire.** Comme la carte cadeau et
   les points fidélité, la couverture est déjà là quand la vente s'ouvre : toute ligne du
   panier correspondant à une prestation encore disponible est couverte d'office, les
   lignes sont groupées par instrument d'origine, la réceptionniste valide l'encaissement
   et avance. Un clic décoche tout un groupe si la cliente préfère garder ses prestations
   pour plus tard. Quand un abonnement **et** un pack couvrent la même prestation :
   l'**abonnement d'abord** (il se recharge au cycle suivant), le pack ensuite ; à égalité,
   le plus récent. Un seul instrument par ligne.

6. **Un abonnement échu (`isPaymentDue`) ou révoqué n'est pas décomptable** — affiché grisé
   avec le motif. La réceptionniste ne règle pas de cycle et ne révoque pas depuis l'app.

## Conséquences

- Nouveaux `lib/data/forfaits.ts` + `lib/data/packs.ts` — reflets verbatim de b&co,
  régénérés par script comme le Menu (`Service.id` ≡ `BookingSubService.id`).
- Nouveaux ledgers simulés `abonnements.ts` / `pack-purchases.ts` rattachés à des clientes
  de seed, avec au moins un abonnement échu et un révoqué.
- `Sale` gagne l'état de couverture (map ligne → instrument) ; `computeTotals` sort les
  lignes couvertes de `prestations` et du `subtotal`, expose `couvertureTotal` et le
  détail par instrument.
- Le décompte s'écrit dans `redeemedPrestationIds` à `confirmPayment` ; définitif pour un
  Pack, porté sur le cycle courant pour un Abonnement.
- **Pas de points fidélité** sur une prestation couverte (à valider) — elle ne fait pas
  passer d'argent par cette vente, contrairement à l'acompte.
- Le pied de ticket, le reçu et le Récap des ventes ventilent « Prestations déjà payées »
  par instrument, avec le reliquat du Pack en légende (comme la carte cadeau).
- La section « Abonnement » de la fiche cliente, jusqu'ici toujours vide, devient réelle :
  abonnements (statut de cycle) + packs (prestations restantes, ou « entièrement utilisé »).
  C'est la seule vue d'ensemble de ce qu'une cliente a pris — au comptoir on ne voit que
  ce qui touche la vente en cours.
- `CONTEXT.md` : entrées **Forfait**, **Abonnement**, **Pack**, **Prestation déjà payée**
  (vocabulaire b&co, non renommé).

## Alternatives écartées

- **Vendre un Pack au comptoir** (paiement immédiat, comme un produit). Écarté : rupture du
  principe « rien de commercial ne naît au comptoir » pour un gain marginal — l'achat en
  ligne existe déjà chez b&co.
- **Opt-in ligne par ligne** (rien coché d'office), comme b&co. Écarté : au comptoir, la
  cliente qui a un pack veut l'utiliser par défaut ; le décochage groupé couvre le cas
  inverse sans ralentir la caisse.
- **Consommer à l'ouverture de la vente** plutôt qu'à l'encaissement. Écarté : une vente
  peut être abandonnée, et la réceptionniste ajuste le panier jusqu'au bout.
