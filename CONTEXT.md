# Point de vente — Beauty and Co

Plateforme de point de vente (accueil des clientes, caisse, encaissement) pour Beauty and Co — même marque que le site vitrine [b&co](../b&co), dont ce projet réutilise les tokens de marque (couleurs, polices, logo).

## Language

_À compléter au fil des décisions de conception — voir le format utilisé dans `b&co/CONTEXT.md` pour un exemple rempli (Forfait, Créneau, Prestation, etc.). Utiliser `/grill-with-docs` pour faire mûrir chaque terme au moment où il devient une décision réelle plutôt que de le deviner à l'avance._

**Point de vente**:
_À définir._

**Caisse**:
_À définir._

**Encaisser**:
Le geste central de la réceptionniste : prendre le paiement d'une cliente qui se présente au comptoir. La cliente a réservé en ligne, est venue, a eu sa/ses prestation·s — elle passe à la caisse **à la fin**. Depuis l'Accueil ou le Planning, « Encaisser » sur un rendez-vous ouvre un onglet du Comptoir pré-rempli avec la **payeuse** (la cliente qui règle) et **toutes les prestations de la réservation** — y compris celles faites pour une amie ou un enfant — prêt pour le paiement. Une seule note, un seul règlement. Remplace **« Accueillir »**, retiré : la réceptionniste n'accueille pas à l'arrivée, la cliente va directement voir sa praticienne. Une **vente ouverte à froid** (« + Nouvelle vente ») ne contient par nature que des **produits** — une prestation ne naît jamais au comptoir, elle arrive d'une réservation. Elle s'encaisse donc **sans identifier de cliente** (facultatif — à ajouter pour la fidélité ou une carte cadeau) ; dès qu'une prestation entre au panier, la cliente redevient obligatoire (ADR 0013).
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
La section d'atterrissage de l'app : le centre de pilotage du jour — la **vue journée** (« Le jour » : une ligne par réservation, triée par heure, chacune avec « Encaisser » — partagée avec le Planning, ADR 0014), résumé de l'argent réellement encaissé, cartes cadeaux à imprimer. Son en-tête porte aussi un accès **« Créer un rendez-vous »** vers la plateforme de réservation externe (la prise de rendez-vous ne vit pas dans l'app, ADR 0006/0009) — utile quand une cliente veut réserver par téléphone. Porté le nom **Journée** pendant la refonte v2 du userflow, revenu à **Accueil**. Ne ressuscite pas le verbe **Accueillir** (retiré — voir Encaisser) : la section s'appelle Accueil, le geste au comptoir reste « Encaisser ». Coexiste avec le rôle « Accueil » de la vue Équipe (la fonction de la personne au comptoir) — même mot, contextes distincts (item de navigation vs filtre de rôle).
_Avoid_: Journée (nom de refonte v2, abandonné), Accueillir (verbe retiré), Dashboard, Tableau de bord, Home, Bienvenue

**Planning**:
La section de navigation dédiée à l'agenda : la **vue journée** en trois vues basculables — **Liste chronologique** (défaut, une ligne par réservation, pour encaisser), **Par praticienne** (grain rendez-vous, pour l'équipe et les absences), **Grille calendrier** (pour les trous et chevauchements) — ADR 0014 ; vue semaine, disponibilités de l'équipe (chacune avec son horaire de présence du jour), **ajustement** d'une réservation (praticienne, prestation, créneau, bénéficiaire), **reprogrammation**, **annulation** avec motif, marquage d'une absence, historique des annulations. **Aucune création de réservation** — ça se fait sur la plateforme en ligne (ADR 0006, 0009) ; le bouton « Créer un rendez-vous » l'ouvre dans un onglet externe. La fiche réservation et ses gestes sont identiques depuis le Planning et depuis l'Accueil. Distinct de la **Chronologie du jour** (qui vit sur l'Accueil) : consulter la journée qui vient est un geste quotidien à haute fréquence ; ouvrir le Planning complet est rare.
_Avoid_: Agenda, Calendrier, Rendez-vous (nom de l'objet, pas de la section)

**Reprogrammer**:
Déplacer un rendez-vous existant à un autre créneau (jour + heure), depuis la fiche réservation. Seul contrôle : une praticienne ne peut pas se retrouver avec deux rendez-vous qui se chevauchent — le cas est **bloqué**. Remplace « Décaler », que l'ADR 0006 avait retiré quand le Planning était en lecture seule (cf. ADR 0009).
_Avoid_: Décaler, Déplacer, Reporter

**Clientèle**:
La section de consultation de la relation cliente dans la durée. Porte d'entrée **recherche d'abord** : grande recherche cliente (mécanisme unique, partagé avec le Comptoir) + « Vues récemment » + « Attendues aujourd'hui » ; l'annuaire complet filtrable (Toutes / Nouvelles / Historique / VIP) vit sur la même page, en dessous. Mène à la **Fiche cliente** (identité, historique de visites, abonnement, fidélité, **préférences**, accès « Voir les échanges »). Ne contient ni tournée de relance ni campagnes — les échanges avec la cliente vivent dans la section **Messages**.
_Avoid_: Clients (ancien nom de la section), Répertoire / Annuaire (une vue de la section, pas la section), Fichier client, CRM

**Préférence**:
Ce que le salon retient des goûts d'une cliente, sur sa fiche : le **type de cheveux**, la **référence couleur**, puis un texte libre par domaine — **mani-pédi-onglerie**, **coiffure**, **spa**, **épilation** — et les **préférences de boisson**. Des photos de référence peuvent être attachées par domaine. Une **note** ajoutée à la fiche peut être rangée dans l'un de ces domaines : son texte vient alors compléter la préférence correspondante (sinon elle reste une note interne).
_Avoid_: Profil beauté (le libellé d'une carte, pas le concept), Goûts

**Messages**:
La section messagerie : un **fil de conversation par cliente** réunissant sur une seule timeline les **relances** automatiques déjà envoyées, celles **à venir**, et les messages échangés. La réceptionniste peut **prendre la main** sur un fil pour écrire à la cliente, **repasser la main** à la Conseillère, ou **transférer à la direction** (état terminal, hors app). Les **anniversaires** du jour restent en tête de l'inbox, pour en tenir compte quand la cliente se présente. Elle **ne configure toujours rien** — conditions, délais et textes des relances sont définis par la direction dans un back-office hors de cette app (ADR 0010, 0011). Ex-**Relances** (item de sidebar renommé ; « relance » reste le mot pour un message automatique dans un fil).
_Avoid_: Relances (ancien nom de la section), Suivi, Fidélisation, Marketing, Chat / Messagerie instantanée (côté cliente c'est WhatsApp/SMS/email, pas un chat propriétaire), Tournée du matin (retirée), Campagne / Envois groupés (retirés)

**Conversation** (ou **Fil**):
L'échange avec une cliente précise dans la section Messages : une timeline unique de **Messages** (relances automatiques envoyées, relances à venir, réponses de la cliente, réponses de la Conseillère ou de la réceptionniste), plus un **état** et le **canal** (WhatsApp / SMS / email). Un fil par cliente. États : `conseillere` (la Conseillère tient le fil — défaut ; `auto` tant qu'aucun humain n'y a touché), `receptionniste` (un humain tient le fil ; les relances programmées de cette cliente sont **en pause**), `direction` (**terminal** — transféré hors de l'app, le fil reste visible figé).
_Avoid_: Ticket, Discussion, Échange (le libellé d'un bouton, pas l'objet)

**Message**:
Une entrée d'un **Fil** : un émetteur (**cliente**, **réceptionniste** ou **Conseillère**), un canal, une date, un corps. Une **relance** est un Message porté par la Conseillère avec un type (anniversaire / soins / fidélité / reconquête / recommandation) ; tant qu'elle n'est pas partie, elle apparaît dans le fil comme un message **à venir**.
_Avoid_: Bulle (la forme à l'écran, pas l'objet), Notification

**Prise en main**:
Le geste par lequel la réceptionniste passe un fil de l'état `conseillere` à `receptionniste` pour écrire elle-même à la cliente. Tant qu'elle tient le fil, les relances automatiques de cette cliente sont suspendues. Elle peut ensuite **repasser la main** à la Conseillère (les relances reprennent) ou **transférer à la direction**.
_Avoid_: Reprise, Escalade, Assignation

**Non lu**:
L'état d'un fil dont la dernière réponse de la cliente n'a pas encore été vue. Porte le **signal ambre** de l'app (le seul) dans l'inbox et un compteur sur l'item de sidebar. Se lève quand le fil est ouvert.
_Avoid_: Nouveau, En attente, Notification

**Menu**:
La liste des prestations et des produits que la réceptionniste peut mettre dans un panier et encaisser : chaque entrée a un nom, un prix, une **catégorie** et éventuellement une **sous-catégorie** — pour les prestations, une famille dans « coiffure » (Tissage, Brushing…) ; pour les produits, une **gamme** (Kérastase → Nutritive, Chronologiste, Blond Absolu…). Les prestations portent en plus une **durée** et un marqueur **« réalisable à 2 »** (pastille 2 praticiennes) ; les **produits** portent un **stock**, décrémenté à chaque vente — un produit à zéro ne peut plus être ajouté au panier. On le parcourt dans le panneau de gauche du Comptoir via trois grandes familles — **Services · Produits · Boissons** (le Bar) — qui reprennent les volets du Catalogue. Édité hors de cette app — point-de-vente ne fait que le lire : la liste des prestations **reflète, verbatim, le catalogue de réservation Beauty and Co** (`b&co/lib/data/booking-services.ts`) — mêmes ids, libellés, prix, durées, éligibilité « à 2 ». Les libellés de prestation arrivent **en capitales** (« DEFRISAGE PROFESSIONNEL BEAUTY AND CO / TEXLAX ») : c'est la casse du catalogue b&co, conservée telle quelle à l'écran — jamais recasée (ni Title Case, ni phrase). La lisibilité au comptoir se règle par la mise en page, pas par la casse.
_Avoid_: Catalogue (réservé au module de consultation ci-dessous), Carte (ambigu avec carte de fidélité / carte cadeau), Tarifs (réducteur)

**Catalogue**:
Le module de consultation autonome (section de navigation propre), trois volets : **Les Planches** (styles signature), **Produits** (chaque produit avec sa photo et son **stock restant**, en lecture) et **Boissons** (le Bar Beauty & Co). Sert à inspirer la cliente, lui montrer un résultat, et savoir ce qu'il reste en rayon. Sans lien avec l'encaissement — on n'encaisse jamais depuis le Catalogue ; la baisse de stock se fait au Comptoir au moment de la vente. *(Le volet « Photos de référence » — banque d'images uploadables — a été retiré ; les photos par domaine d'une cliente vivent sur sa fiche, cf. Préférence.)*
_Avoid_: Lookbook, Styles (ancien nom du module), Book, Références

**Style**:
Une entrée du Catalogue : un look signature nommé, rattaché à une catégorie (coiffure, ongles, soin visage…), avec un prix indicatif et un éventuel marqueur « tendance ». Curaté, orienté présentation — distinct d'une entrée du Menu même quand les deux décrivent la même prestation.
_Avoid_: Look, Modèle, Prestation vedette

**Conseillère**:
L'agent conversationnel beauté virtuel qui **tient la conversation automatiquement** avec les clientes : elle envoie les relances programmées et répond aux messages entrants — par défaut sur chaque fil, ou dès que la réceptionniste lui **repasse la main**. Ses messages sont signés « Votre conseillère beauté · Beauty and Co ». Ce n'est pas une personne de l'équipe. Son savoir — conseils par famille de soin, délais et textes de relance — est édité par la direction dans un back-office **hors de cette app** ; point-de-vente n'affiche que le résultat. Côté cliente, toujours « la conseillère », jamais « bot ».
_Avoid_: Assistante, bot, IA, chatbot (côté cliente elle est simplement « la conseillère »)

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
Un instrument **prépayé** — pas une remise. **Achetée et payée sur une plateforme externe** (le parcours d'achat ne vit pas dans cette app), avec un mode de remise choisi à l'achat : e-carte (hors périmètre), **retrait** au salon en version imprimée, ou **livraison** de la version imprimée. Elle couvre soit un **montant**, soit des **prestations** précises. Au comptoir, saisir ou scanner son code fait **deux choses** (même dialogue unique que la carte de fidélité — cf. ADR 0013) : ça **identifie la détentrice** que la carte porte (attache sa fiche à la vente, comme la carte de fidélité) **et** ça **applique** la carte au panier. Ce qui est appliqué est **ajustable**, comme le nombre de points fidélité utilisés : pour une carte en montant, combien du solde on consomme (le **reliquat reste sur la carte**) ; pour une carte en prestations, quelles lignes du panier elle couvre. Instrument **au porteur** : celui qui la présente l'utilise, aucune vérification de titulaire (elle a été offerte) ; une carte sans détentrice connue s'applique quand même, sans identifier. Statuts (au comptoir) : active, utilisée (solde épuisé), expirée — chacun avec son message, jamais le texte générique d'un code mal tapé (ADR 0002, 0012).
_Avoid_: Bon cadeau, chèque cadeau, avoir

**Commande de carte cadeau**:
Une carte cadeau achetée en version imprimée (retrait ou livraison) que le salon doit **préparer** : l'imprimer, puis la remettre à la personne ou la confier à la livraison. Aucun encaissement — c'est déjà payé. Portée : acheteur (toujours une fiche cliente), montant, code du ledger, mode de remise, et — pour une livraison — nom / téléphone / adresse du bénéficiaire. Statuts : à imprimer → imprimée → remise (retrait) / livrée (livraison, = confiée au coursier ; la livraison réelle est hors app). La file des commandes non résolues vit sur la route `/cartes-cadeaux`, atteinte par la cellule « Cartes à préparer » de l'Accueil (ADR 0012).
_Avoid_: Bon de commande, ticket carte cadeau, à imprimer (un statut, pas l'objet)

**Carte de fidélité**:
La carte nominative d'une cliente — plaque « carte de crédit » avec un QR, consultable et imprimable depuis sa fiche. Au comptoir, elle sert de **jeton d'identification** : scanner son QR ou saisir son code (`loyaltyCode`, format `BACO-FID-XXXX`) attache la fiche à la vente en cours, sans passer par la recherche par nom. C'est **l'un des deux jetons d'identification** — la **carte cadeau** identifie aussi sa détentrice (cf. sa fiche). Instrument **au porteur** — la présenter suffit, on ne vérifie pas que le porteur en est la titulaire. Garde-fou = lisibilité : le nom de la cliente s'affiche en tête de ticket, confronté de visu à la personne en face ; le dialogue offre un « Ce n'est pas la bonne cliente » pour détacher (ADR 0013). Ne fait que **porter** les Points fidélité.
_Avoid_: Carte de membre, badge client, carte VIP

**Points fidélité**:
Le solde de fidélité d'une cliente, avec deux mouvements distincts. L'**acquisition** : 10 points par tranche de 1 000 F réellement payés (calculée sur le total après remises). L'**utilisation** : 100 points = 1 000 F de réduction, par pas de 100, dans la limite du solde — c'est l'un des trois mécanismes de Remise.
_Avoid_: Cagnotte, miles, points de fidélité (« points fidélité » à l'écrit)
