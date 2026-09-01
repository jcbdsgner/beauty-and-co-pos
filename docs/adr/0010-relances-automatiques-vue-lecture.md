# Relances entièrement automatiques ; la section devient une vue de lecture

L'[ADR 0004](0004-relances-section-clientele-recentree.md) avait promu **Relances** en
section à trois volets : la tournée du matin (messages à valider et envoyer, geste
quotidien), les envois groupés (Campagnes), le contenu conseillère (config rare-édition).
On revient dessus : les relances **partent automatiquement**, leurs conditions et leurs
textes sont définis par la direction dans un **back-office hors de cette app**. La
réceptionniste n'envoie plus rien et ne configure plus rien.

## Décision

- La section Relances devient un **écran unique en lecture** : les relances déjà envoyées
  automatiquement (cliente, type, date, canal, filtrable) et celles **à venir**, les
  **anniversaires** en tête pour que le comptoir en tienne compte à l'arrivée de la cliente.
- **Retirés :**
  - le volet « Contenu conseillère » (conseils par famille, `BeautyTip`, `lib/data/conseils.ts`,
    `beauty-tip-form-dialog`) ;
  - le volet « Envois groupés » et l'objet **Campagne** (`lib/data/campagnes.ts`,
    `campaign-form-dialog`, `envois-groupes-tab`) ;
  - l'envoi manuel « Valider & envoyer » et la tournée carte-par-carte (`sendTourneeBatch`,
    `revertTourneeBatch`, `tourneeBatches`) ;
  - le bloc « Recommandations / Proposer » de la fiche cliente (`proposeStyleRelance`) ;
  - l'autorisation de remise de reconquête (`en_attente_autorisation` → `autorisee`).
- Le widget « Tournée du matin » de l'Accueil devient **informatif** — un rappel de ce qui
  part aujourd'hui, sans bouton d'envoi.
- La **conseillère** reste la signature des messages ; son savoir est édité hors app.

## Conséquences

- `CONTEXT.md` : entrées **Relances** et **Conseillère** réécrites, entrée **Campagne** retirée.
- `RelanceStatus` simplifié (plus d'états d'autorisation ; à préciser à l'implémentation —
  vraisemblablement `a_venir | envoyee`).
- `docs/USERFLOW.md` : section Relances et modèle conceptuel à amender à l'implémentation.
- ADR 0004 : ses volets « envois groupés » et « contenu conseillère » sont supersédés ; la
  promotion de Relances en item de sidebar reste valable.

## Alternative écartée

Garder un envoi manuel pour les seuls anniversaires. Écarté : si tout le reste est auto,
maintenir un unique geste manuel recrée une « tournée du matin » à vider — exactement ce
qu'on retire.
