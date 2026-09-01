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
Une **prestation planifiée** atomique, une ligne de la Réservation : une prestation, un·e bénéficiaire, un créneau (début + durée), une praticienne — **deux** quand la prestation est « réalisable à 2 » (`secondStaffId`, durée déjà divisée). C'est ce qui occupe une lane du Planning. **Plusieurs rendez-vous à la même heure, c'est normal** : praticiennes différentes, même réservation ou non. Conceptuellement proche du Créneau b&co (voir [b&co/CONTEXT.md](../b&co/CONTEXT.md)) mais aucun lien d'id n'existe entre les deux mocks. Un rendez-vous est simplement **actif ou annulé** — **pas** de « en attente / confirmé » : les réservations arrivent fermes de la plateforme en ligne, la réceptionniste ne les valide jamais. Elle ne **crée** jamais de réservation dans l'app (ça se fait en ligne), mais elle **ajuste** celles qui arrivent : changer la praticienne ou la prestation, ajouter ou retirer un rendez-vous à la réservation, changer le·la bénéficiaire, **reprogrammer** un créneau, **annuler** (motif facultatif), **encaisser** au niveau réservation. Ces ajustements ne repartent pas vers la plateforme externe (ADR 0009).
_Avoid_: RDV (abréviation d'affichage uniquement, pas le terme du glossaire), Créneau (réservé au vocabulaire b&co côté client), Décaler (le geste s'appelle Reprogrammer)

**Bénéficiaire**:
La personne qui **reçoit** une prestation d'un rendez-vous — distincte de la **payeuse** de la réservation. Soit une fiche cliente connue, soit un simple **nom libre** (« Awa (amie) », « Salématou (7 ans) ») quand elle n'a pas de fiche. Absente ⇒ le bénéficiaire est la payeuse elle-même. Affichée « pour {nom} » sur le Planning, la fiche réservation et la ligne de ticket.
_Avoid_: Invité·e, accompagnant·e, second client

**Accueil**:
La section d'atterrissage de l'app : le centre de pilotage du jour — chronologie des rendez-vous du jour (groupés par praticienne, chacun avec « Encaisser »), résumé de l'argent réellement encaissé, widget « Tournée du matin » (rappel de ce qui part automatiquement aujourd'hui, lien vers la section Relances). Porté le nom **Journée** pendant la refonte v2 du userflow, revenu à **Accueil**. Ne ressuscite pas le verbe **Accueillir** (retiré — voir Encaisser) : la section s'appelle Accueil, le geste au comptoir reste « Encaisser ». Coexiste avec le rôle « Accueil » de la vue Équipe (la fonction de la personne au comptoir) — même mot, contextes distincts (item de navigation vs filtre de rôle).
_Avoid_: Journée (nom de refonte v2, abandonné), Accueillir (verbe retiré), Dashboard, Tableau de bord, Home, Bienvenue

**Planning**:
La section de navigation dédiée à l'agenda : vue semaine, disponibilités de l'équipe (chacune avec son horaire de présence du jour), **ajustement** d'une réservation (praticienne, prestation, créneau, bénéficiaire), **reprogrammation**, **annulation** avec motif, marquage d'une absence, historique des annulations. **Aucune création de réservation** — ça se fait sur la plateforme en ligne (ADR 0006, 0009) ; le bouton « Créer un rendez-vous » l'ouvre dans un onglet externe. La fiche réservation et ses gestes sont identiques depuis le Planning et depuis l'Accueil. Distinct de la **Chronologie du jour** (qui vit sur l'Accueil) : consulter la journée qui vient est un geste quotidien à haute fréquence ; ouvrir le Planning complet est rare.
_Avoid_: Agenda, Calendrier, Rendez-vous (nom de l'objet, pas de la section)

**Reprogrammer**:
Déplacer un rendez-vous existant à un autre créneau (jour + heure), depuis la fiche réservation. Seul contrôle : une praticienne ne peut pas se retrouver avec deux rendez-vous qui se chevauchent — le cas est **bloqué**. Remplace « Décaler », que l'ADR 0006 avait retiré quand le Planning était en lecture seule (cf. ADR 0009).
_Avoid_: Décaler, Déplacer, Reporter

**Clientèle**:
La section de consultation de la relation cliente dans la durée. Porte d'entrée **recherche d'abord** : grande recherche cliente (mécanisme unique, partagé avec le Comptoir) + « Vues récemment » + « Attendues aujourd'hui » ; l'annuaire complet filtrable (Toutes / Nouvelles / Historique / VIP) vit sur la même page, en dessous. Mène à la **Fiche cliente** (identité, historique de visites, abonnement, fidélité, **préférences**). Ne contient ni tournée de relance ni campagnes — la vue lecture des relances vit dans la section **Relances**.
_Avoid_: Clients (ancien nom de la section), Répertoire / Annuaire (une vue de la section, pas la section), Fichier client, CRM

**Préférence**:
Ce que le salon retient des goûts d'une cliente, sur sa fiche : le **type de cheveux**, la **référence couleur**, puis un texte libre par domaine — **mani-pédi-onglerie**, **coiffure**, **spa**, **épilation** — et les **préférences de boisson**. Des photos de référence peuvent être attachées par domaine. Une **note** ajoutée à la fiche peut être rangée dans l'un de ces domaines : son texte vient alors compléter la préférence correspondante (sinon elle reste une note interne).
_Avoid_: Profil beauté (le libellé d'une carte, pas le concept), Goûts

**Relances**:
La section qui donne à la réceptionniste une **vue en lecture** sur les relances partant automatiquement aux clientes : celles déjà envoyées (cliente, type, date, canal — filtrable) et celles **à venir**, les **anniversaires** en tête pour qu'elle puisse en tenir compte quand la cliente se présente. Elle **n'envoie rien** et **ne configure rien** — conditions, délais et textes sont définis par la direction dans un back-office hors de cette app, l'envoi est automatique (ADR 0010). Le widget « Tournée du matin » de l'Accueil en est le rappel du jour.
_Avoid_: Suivi (ancien nom), Fidélisation, Marketing, Tournée du matin (rappel de l'Accueil, plus un geste d'envoi), Campagne / Envois groupés (retirés)

**Menu**:
La liste des prestations et des produits que la réceptionniste peut mettre dans un panier et encaisser : chaque entrée a un nom, un prix, une catégorie ; les prestations portent en plus une **durée** et un marqueur **« réalisable à 2 »** (pastille 2 praticiennes) ; les **produits** portent un **stock**, décrémenté à chaque vente — un produit à zéro ne peut plus être ajouté au panier. C'est ce qu'on parcourt dans le panneau de gauche du Comptoir, où l'icône de la catégorie sélectionnée coiffe la liste. Édité hors de cette app — point-de-vente ne fait que le lire : la liste des prestations **reflète, verbatim, le catalogue de réservation Beauty and Co** (`b&co/lib/data/booking-services.ts`) — mêmes ids, libellés, prix, durées, éligibilité « à 2 ».
_Avoid_: Catalogue (réservé au module de consultation ci-dessous), Carte (ambigu avec carte de fidélité / carte cadeau), Tarifs (réducteur)

**Catalogue**:
Le module de consultation autonome (section de navigation propre), trois volets : **Les Planches** (styles signature), **Photos de référence** (banque d'images), **Produits** (chaque produit avec sa photo et son **stock restant**, en lecture). Sert à inspirer la cliente, lui montrer un résultat, et savoir ce qu'il reste en rayon. Sans lien avec l'encaissement — on n'encaisse jamais depuis le Catalogue ; la baisse de stock se fait au Comptoir au moment de la vente.
_Avoid_: Lookbook, Styles (ancien nom du module), Book, Références

**Style**:
Une entrée du Catalogue : un look signature nommé, rattaché à une catégorie (coiffure, ongles, soin visage…), avec un prix indicatif et un éventuel marqueur « tendance ». Curaté, orienté présentation — distinct d'une entrée du Menu même quand les deux décrivent la même prestation.
_Avoid_: Look, Modèle, Prestation vedette

**Conseillère**:
La conseillère beauté virtuelle qui signe les messages de relance envoyés aux clientes (« Votre conseillère beauté · Beauty and Co »). Ce n'est pas une personne de l'équipe. Son savoir — conseils par famille de soin, délais et textes de relance par prestation — est édité par la direction dans un back-office **hors de cette app** ; point-de-vente n'affiche que le résultat (cf. Relances).
_Avoid_: Assistante, bot, IA (côté cliente elle est simplement « la conseillère »)

**Remise**:
Toute réduction appliquée à une vente. Trois mécanismes, **cumulables**, pouvant amener le total à 0 F : des **points fidélité** utilisés, une **carte cadeau**, et une **remise accordée** par la réceptionniste. Le pied de ticket, le reçu et le Récap des ventes les **ventilent** ligne par ligne — jamais un total « Remises » agrégé.
_Avoid_: Réduction, Rabais, Ristourne, Promo (« code promo » réservé au cas où il en existerait un un jour)

**Remise accordée**:
La réduction discrétionnaire qu'une réceptionniste accorde avec **son code personnel** : un montant fixe ou un pourcentage, calculé sur le **total des prestations** (les produits n'en bénéficient jamais). Deux seuils : **jusqu'à 10 %**, le code personnel de la réceptionniste suffit ; **de 10 à 20 %**, il faut en plus un **code manager**. **20 % est le plafond absolu** — au-delà, rien n'est possible dans l'app. Voir aussi **Code manager**, **Motif de remise**.
_Avoid_: Remise manager (c'est une remise accordée avec code manager, pas un objet distinct), remise responsable, override

**Code manager**:
Un code que la direction communique **au cas par cas** à la réceptionniste pour l'autoriser à accorder une remise entre 10 et 20 %. Le manager **ne se connecte jamais** à l'app et n'y configure rien — l'ADR 0001 (persona unique) tient : il n'y a toujours qu'un persona au comptoir, le code manager est une autorisation qui vient de l'extérieur, pas un rôle applicatif. Saisi au moment d'accorder la remise, il est conservé sur la vente pour la traçabilité.
_Avoid_: Code direction, code responsable, code superviseur, PIN admin

**Motif de remise**:
La justification en texte libre d'une remise accordée, saisie sur un écran bloquant **après** « Confirmer l'encaissement » et avant le reçu — jamais avant, pour ne pas ralentir le comptoir avec une cliente en face. Visible ensuite sur le reçu et dans le Récap des ventes.

**Carte cadeau**:
Un instrument **prépayé** — pas une remise. Elle porte un solde propre ; la vente n'en consomme que ce qu'il faut pour couvrir le reste à payer, et le **reliquat reste sur la carte** pour un prochain passage. Saisie au clavier ou scannée. Statuts : active, utilisée (solde épuisé), expirée — chacun avec son message au comptoir, jamais le texte générique d'un code mal tapé.
_Avoid_: Bon cadeau, chèque cadeau, avoir

**Points fidélité**:
Le solde de fidélité d'une cliente, avec deux mouvements distincts. L'**acquisition** : 10 points par tranche de 1 000 F réellement payés (calculée sur le total après remises). L'**utilisation** : 100 points = 1 000 F de réduction, par pas de 100, dans la limite du solde — c'est l'un des trois mécanismes de Remise.
_Avoid_: Cagnotte, miles, points de fidélité (« points fidélité » à l'écrit)
