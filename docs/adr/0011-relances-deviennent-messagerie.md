---
status: accepted
---

# La section Relances devient une messagerie ; la réceptionniste échange avec la cliente

L'[ADR 0010](0010-relances-automatiques-vue-lecture.md) (2026-09-01) avait figé Relances en **écran unique de lecture** : la direction pilote tout, l'app ne fait qu'afficher. À l'usage, il manque le geste évident quand une cliente **répond** à une relance — la réceptionniste ne peut rien faire dans l'app. On tranche : la section devient une **messagerie**, renommée **Messages**. La réceptionniste peut **prendre la main** sur un fil et écrire à la cliente, ou **repasser la main** à la Conseillère, ou **transférer à la direction** (état terminal, hors app).

Ce qui **reste** de l'ADR 0010 : la réceptionniste ne **configure** toujours rien — conditions, délais et textes des relances sont définis par la direction dans un back-office hors de cette app. Elle ne fait qu'**écrire dans un fil**, pas programmer des envois.

## Décision

- **Section renommée `Relances` → `Messages`** (sidebar, route `/relances` → `/messages`, icône cœur → bulle). « Relance » reste le mot pour **un message automatique** à l'intérieur d'un fil.
- **Un fil (`Conversation`) par cliente**, réunissant sur **une seule timeline** : les relances automatiques déjà envoyées, celles **à venir** (en attente, visibles dans le fil), et les messages échangés.
- **États d'un fil** : `conseillere` (défaut — la Conseillère tient le fil : les relances programmées partent, elle répond automatiquement) ; `receptionniste` (un humain tient le fil : il écrit, **les relances programmées de cette cliente sont en pause**) ; `direction` (**terminal** — le fil a été transféré hors de l'app ; il reste visible en lecture seule, figé). Une 4ᵉ valeur `auto` = `conseillere` jamais encore touchée par un humain (même comportement, jeton distinct dans l'inbox).
  - Transitions : `auto|conseillere → receptionniste` (« Répondre / Prendre la conversation ») ; `receptionniste → conseillere` (« Repasser à la Conseillère » — jamais retour à `auto`) ; `* → direction` (« Transférer à la direction », dialog de confirmation qui explique que la conversation **quitte l'app**).
- **Écran maître-détail** : inbox (~380 px, une ligne par fil, tri attention-d'abord puis activité) + panneau conversation (en-tête, timeline de bulles, composeur désactivé avec motif quand l'état est `conseillere`/`direction`).
- **Concept « non lu »** (nouveau) : un fil avec une réponse cliente non vue porte le **signal ambre** ; compteur sur l'item de sidebar.
- **Anniversaires en tête** de l'inbox (groupe « Programmées / à venir ») — conserve l'usage « le comptoir jette un œil avant l'arrivée de la cliente », sans surface sur l'Accueil.
- **Widget « Tournée du matin » retiré de l'Accueil** (bloc + `roundReady`/`roundBreakdown`/`RELANCE_TYPE_SINGULAR`). L'Accueil ne pointe plus vers Messages ; l'info vit dans l'inbox.
- **Fiche cliente** : le bloc « Relances à venir » (lecture) devient un accès **« Voir les échanges »** vers le fil de la cliente (`/messages?client=<id>`), avec un aperçu des derniers messages.

## Conséquences

- **Modèle de données** : `Relance` (`{ clientId, type, status a_venir|envoyee, channel, date, message }`) disparaît comme objet de premier plan. Nouveaux : `Conversation` (`{ id, clientId, channel, state, unread }`, `messages: Message[]`) et `Message` (`{ id, sender cliente|receptionniste|conseillere, channel, at, body, relanceType?, pending?, lateDays?, styleId?, discountLabel? }`). Une relance = un `Message` avec `relanceType` (et `pending: true` tant qu'elle n'est pas partie). `RelanceStatus` supprimé ; `RelanceType` / `RelanceChannel` conservés.
- **`CONTEXT.md`** : entrée **Relances** réécrite en **Messages** ; **Conseillère** réécrite (de « signe les messages » à « agent conversationnel virtuel qui tient la conversation ») ; nouveaux termes **Conversation / Fil**, **Message**, **Non lu**, **Prise en main** ; l'entrée **Tournée du matin** et le _Avoid_ correspondant disparaissent.
- **`docs/USERFLOW.md`** : section Relances réécrite en Messages ; modèle conceptuel amendé (`Relance` → `Conversation`/`Message`) ; widget « Tournée du matin » retiré.
- **ADR 0001 (persona unique) préservé** : « Transférer à la direction » est explicitement **hors app** — aucune boîte de réception, aucune connexion manager, aucun écran direction créé. Le fil devient simplement figé côté réceptionniste.
- **ADR 0010** : partiellement superséde. La section n'est plus « lecture seule » ; le principe « la réceptionniste ne configure pas les relances » tient.
- **Prototype sans backend** : les réponses de la cliente et de la Conseillère sont **simulées** (scriptées), comme le paiement et le scan.

## Alternative écartée

Garder Relances en lecture seule et ajouter juste un bouton « Répondre » qui ouvre WhatsApp/SMS hors de l'app. Écarté : l'insight utilisateur est qu'on doit **voir les messages automatiques déjà envoyés dans le fil** au moment de répondre — un renvoi vers une app tierce casse ce fil unifié, et ne permet ni la prise en main explicite ni le passage à la Conseillère.

## Note sur la valse ADR 0004 → 0010 → 0011

Trois révisions de cette zone en une semaine. 0004 promeut Relances en section à volets ; 0010 (même jour que 0011) la réduit à un moniteur ; 0011 en fait une messagerie. Le fil conducteur assumé : **la réceptionniste ne configure rien** (constant depuis 0010) ; ce qui bouge, c'est ce qu'elle peut **faire** face à une cliente qui répond — rien (0010), puis échanger (0011). L'ajout d'un canal de réponse est une capacité nouvelle, pas un retour à la tournée-du-matin-à-vider de 0004.
