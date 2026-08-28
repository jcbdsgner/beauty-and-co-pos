# Point de vente — Beauty and Co

Plateforme de point de vente (accueil des clientes, caisse, encaissement) pour Beauty and Co — même marque que le site vitrine [b&co](../b&co), dont ce projet réutilise les tokens de marque (couleurs, polices, logo).

## Language

_À compléter au fil des décisions de conception — voir le format utilisé dans `b&co/CONTEXT.md` pour un exemple rempli (Forfait, Créneau, Prestation, etc.). Utiliser `/grill-with-docs` pour faire mûrir chaque terme au moment où il devient une décision réelle plutôt que de le deviner à l'avance._

**Point de vente**:
_À définir._

**Caisse**:
_À définir._

**Encaisser**:
Le geste central de la réceptionniste : prendre le paiement d'une cliente qui se présente au comptoir. La cliente a réservé en ligne, est venue, a eu sa/ses prestation·s — elle passe à la caisse **à la fin**. Depuis l'Accueil ou le Planning, « Encaisser » sur un rendez-vous ouvre un onglet du Comptoir pré-rempli avec la **payeuse** (la cliente qui règle) et **toutes les prestations de la réservation** — y compris celles faites pour une amie ou un enfant — prêt pour le paiement. Une seule note, un seul règlement. Remplace **« Accueillir »**, retiré : la réceptionniste n'accueille pas à l'arrivée, la cliente va directement voir sa praticienne.
_Avoid_: Accueillir (retiré), Passer en caisse, Servir

**Réceptionniste**:
L'unique persona de point-de-vente : la personne au comptoir qui accueille les clientes, tient la caisse et encaisse tout au long de la journée. Elle n'a aucun rôle de configuration du salon (menu, prix, effectif, entités) — ces décisions appartiennent à la direction et se prennent hors de cette app. Un·e praticien·ne peut ponctuellement utiliser le poste, avec exactement les mêmes droits : il n'existe pas de second rôle, pas de déverrouillage « direction / admin » nulle part dans l'app.
_Avoid_: Caissière, caissier, hôtesse, gestionnaire, propriétaire, admin (pas des rôles distincts — un seul persona)

**Réservation**:
La prise de rendez-vous **au niveau de la payeuse** : une cliente (celle qui règle) réserve pour elle-même et éventuellement pour d'autres (une amie, un enfant), une ou plusieurs prestations, réparties sur une ou plusieurs praticiennes, à une ou plusieurs heures. Presque toujours faite **en ligne** par la cliente sur la plateforme de réservation externe ; le parcours de prise de rendez-vous **ne vit pas dans cette app** (voir ADR 0006). C'est l'unité qu'on **encaisse** : une réservation → une Vente, un seul règlement pour tout.
_Avoid_: Panier de réservation, Commande, Dossier

**Rendez-vous**:
Une **prestation planifiée** atomique, une ligne de la Réservation : une prestation, un·e bénéficiaire, un créneau (début + durée), une praticienne — **deux** quand la prestation est « réalisable à 2 » (`secondStaffId`, durée déjà divisée). C'est ce qui occupe une lane du Planning. **Plusieurs rendez-vous à la même heure, c'est normal** : praticiennes différentes, même réservation ou non. Conceptuellement proche du Créneau b&co (voir [b&co/CONTEXT.md](../b&co/CONTEXT.md)) mais aucun lien d'id n'existe entre les deux mocks. Un rendez-vous est simplement **actif ou annulé** — **pas** de « en attente / confirmé » : les réservations arrivent fermes de la plateforme en ligne, la réceptionniste ne les valide jamais. Seuls gestes possibles ici : **Annuler**, **Encaisser** — jamais créer, confirmer ni décaler.
_Avoid_: RDV (abréviation d'affichage uniquement, pas le terme du glossaire), Créneau (réservé au vocabulaire b&co côté client)

**Bénéficiaire**:
La personne qui **reçoit** une prestation d'un rendez-vous — distincte de la **payeuse** de la réservation. Soit une fiche cliente connue, soit un simple **nom libre** (« Awa (amie) », « Salématou (7 ans) ») quand elle n'a pas de fiche. Absente ⇒ le bénéficiaire est la payeuse elle-même. Affichée « pour {nom} » sur le Planning, la fiche réservation et la ligne de ticket.
_Avoid_: Invité·e, accompagnant·e, second client

**Accueil**:
La section d'atterrissage de l'app : le centre de pilotage du jour — chronologie des rendez-vous du jour (groupés par praticienne, chacun avec « Encaisser »), résumé de l'argent réellement encaissé, widget « Tournée du matin » (raccourci vers la section Relances). Porté le nom **Journée** pendant la refonte v2 du userflow, revenu à **Accueil**. Ne ressuscite pas le verbe **Accueillir** (retiré — voir Encaisser) : la section s'appelle Accueil, le geste au comptoir reste « Encaisser ». Coexiste avec le rôle « Accueil » de la vue Équipe (la fonction de la personne au comptoir) — même mot, contextes distincts (item de navigation vs filtre de rôle).
_Avoid_: Journée (nom de refonte v2, abandonné), Accueillir (verbe retiré), Dashboard, Tableau de bord, Home, Bienvenue

**Planning**:
La section de navigation dédiée à l'agenda : vue semaine, disponibilités de l'équipe, **confirmation / annulation** d'un rendez-vous, marquage d'une absence, historique des annulations. **Pas de création ni d'édition de rendez-vous** — la prise de rendez-vous se fait en ligne (ADR 0006) ; le Planning est une vue de lecture + les gestes de comptoir. Distinct de la **Chronologie du jour** (qui vit sur l'Accueil) : consulter la journée qui vient est un geste quotidien à haute fréquence ; ouvrir le Planning complet est rare.
_Avoid_: Agenda, Calendrier, Rendez-vous (nom de l'objet, pas de la section)

**Clientèle**:
La section de consultation de la relation cliente dans la durée. Porte d'entrée **recherche d'abord** : grande recherche cliente (mécanisme unique, partagé avec le Comptoir et le Formulaire de rendez-vous) + « Vues récemment » + « Attendues aujourd'hui » ; l'annuaire complet filtrable (Toutes / Nouvelles / Historique / VIP) vit sur la même page, en dessous. Mène à la **Fiche cliente** (identité, historique de visites, abonnement, fidélité, préférences, recommandations). Ne contient plus la tournée de relance ni les campagnes — parties dans la section **Relances**.
_Avoid_: Clients (ancien nom de la section), Répertoire / Annuaire (une vue de la section, pas la section), Fichier client, CRM

**Relances**:
La section dédiée au suivi relationnel piloté, promue en item de sidebar propre. Trois volets : la **tournée du matin** (la pile de messages de relance à valider et envoyer, geste **quotidien**), les **envois groupés** (l'écran qui porte les Campagnes — voir Campagne), et le **paramétrage de la conseillère** (conseils par famille de soin, délais et textes de relance par prestation). Sortie de Clientèle parce que la tournée du matin est un geste quotidien, même rythme que l'Accueil — pas une consultation occasionnelle. Le widget « Tournée du matin » de l'Accueil en est le raccourci ; le traitement carte par carte se fait ici.
_Avoid_: Suivi (ancien nom), Fidélisation, Marketing

**Campagne**:
Un message envoyé en masse à une **audience** de clientes, calculée par critère (pas une liste figée). Distincte d'une **Relance** par sa cardinalité : une audience, pas une cliente précise. L'objet garde le nom « Campagne » dans le modèle et le code ; l'écran qui les regroupe, un volet de la section Relances, s'appelle **Envois groupés**.
_Avoid_: Newsletter, Mailing, Blast, Envoi groupé (nom de l'écran, pas de l'objet)

**Menu**:
La liste des prestations et des produits que la réceptionniste peut mettre dans un panier et encaisser : chaque entrée a un nom, un prix, une catégorie ; les prestations portent en plus une **durée** et un marqueur **« réalisable à 2 »** (pastille 2 praticiennes). C'est ce qu'on parcourt dans le panneau de gauche du Comptoir. Édité hors de cette app — point-de-vente ne fait que le lire : la liste des prestations **reflète, verbatim, le catalogue de réservation Beauty and Co** (`b&co/lib/data/booking-services.ts`) — mêmes ids, libellés, prix, durées, éligibilité « à 2 ».
_Avoid_: Catalogue (réservé au module de consultation ci-dessous), Carte (ambigu avec carte de fidélité / carte cadeau), Tarifs (réducteur)

**Catalogue**:
Le module de consultation autonome (section de navigation propre) où la réceptionniste feuillette des styles signature et une banque de photos de référence pour inspirer la cliente et lui montrer un résultat. Sans lien avec l'encaissement — on n'encaisse jamais depuis le Catalogue, on peut seulement basculer un style vers le panier si une vente est ouverte.
_Avoid_: Lookbook, Styles (ancien nom du module), Book, Références

**Style**:
Une entrée du Catalogue : un look signature nommé, rattaché à une catégorie (coiffure, ongles, soin visage…), avec un prix indicatif et un éventuel marqueur « tendance ». Curaté, orienté présentation — distinct d'une entrée du Menu même quand les deux décrivent la même prestation.
_Avoid_: Look, Modèle, Prestation vedette

**Conseillère**:
La conseillère beauté virtuelle qui signe les messages de relance et de campagne envoyés aux clientes (« Votre conseillère beauté · Beauty and Co »). Ce n'est pas une personne de l'équipe. Son savoir — conseils par famille de soin, délais et textes de relance par prestation — est édité dans la section **Relances** (volet paramétrage), qu'il alimente.
_Avoid_: Assistante, bot, IA (côté cliente elle est simplement « la conseillère »)

**Remise**:
Toute réduction appliquée à une vente. Trois mécanismes, **cumulables**, pouvant amener le total à 0 F : des **points fidélité** utilisés, une **carte cadeau**, et une **remise accordée** par la réceptionniste. Le pied de ticket, le reçu et le Récap des ventes les **ventilent** ligne par ligne — jamais un total « Remises » agrégé.
_Avoid_: Réduction, Rabais, Ristourne, Promo (« code promo » réservé au cas où il en existerait un un jour)

**Remise accordée**:
La réduction discrétionnaire qu'une réceptionniste accorde avec **son code personnel** : un montant fixe ou un pourcentage, **plafonné à 20 % du total des prestations** (les produits n'en bénéficient jamais). Au-delà, il faut l'accord de la direction — hors de cette app. Voir aussi **Motif de remise**.
_Avoid_: Remise manager, remise responsable, override (il n'existe pas de rôle « manager »)

**Motif de remise**:
La justification en texte libre d'une remise accordée, saisie sur un écran bloquant **après** « Confirmer l'encaissement » et avant le reçu — jamais avant, pour ne pas ralentir le comptoir avec une cliente en face. Visible ensuite sur le reçu et dans le Récap des ventes.

**Carte cadeau**:
Un instrument **prépayé** — pas une remise. Elle porte un solde propre ; la vente n'en consomme que ce qu'il faut pour couvrir le reste à payer, et le **reliquat reste sur la carte** pour un prochain passage. Saisie au clavier ou scannée. Statuts : active, utilisée (solde épuisé), expirée — chacun avec son message au comptoir, jamais le texte générique d'un code mal tapé.
_Avoid_: Bon cadeau, chèque cadeau, avoir

**Points fidélité**:
Le solde de fidélité d'une cliente, avec deux mouvements distincts. L'**acquisition** : 10 points par tranche de 1 000 F réellement payés (calculée sur le total après remises). L'**utilisation** : 100 points = 1 000 F de réduction, par pas de 100, dans la limite du solde — c'est l'un des trois mécanismes de Remise.
_Avoid_: Cagnotte, miles, points de fidélité (« points fidélité » à l'écrit)
