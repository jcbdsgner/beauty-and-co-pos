# Relances promue en section, Clientèle recentrée, « Journée » redevient « Accueil »

`docs/USERFLOW.md` v2 fusionnait l'ancien Clients + Suivi + Campagnes + Conseils & cycles de relance en une section **Clientèle** à onglets, au motif que « ce sont des façons de regarder la même chose : la relation cliente dans le temps ». Après maquettage de cette section, nous revenons partiellement dessus (v2.1) :

- **`Relances` devient un item de sidebar à part entière** (Suivi + Campagnes + Contenu conseillère comme volets). La table de rythme de USERFLOW range elle-même « la tournée de relance du matin » en **Quotidien** — la v2 avait dû ajouter un widget « Tournée du matin » sur l'écran d'atterrissage *pour compenser* le fait qu'un geste quotidien était enterré sous un onglet d'une section « pas tous les jours ». Même raisonnement que la sortie de Planning hors de l'Accueil : un rythme d'usage mérite sa propre place.
- **`Clientèle` se recentre** sur Répertoire + Fiche cliente, en page unique *recherche d'abord* (grande recherche + « Vues récemment » + « Attendues aujourd'hui », annuaire filtrable en dessous ; plus de barre d'onglets). Fiche cliente = en-tête d'identité collant + corps deux colonnes (« le maintenant » / « la référence »).
- **`Journée` redevient `Accueil`.** Le nom de refonte est abandonné. Le verbe au comptoir reste **« Encaisser »** — « Accueillir » ne revient pas comme geste.

Sidebar : 5 items — **Accueil / Planning / Clientèle / Relances / Catalogue** — plus la barre Comptoir.

## Conséquences

- L'objet **Campagne** garde son nom dans le modèle conceptuel et le code ; seul l'écran qui le porte est renommé **Envois groupés**, volet de la section Relances.
- Le lien de cross-référence que la fusion cherchait à préserver (une recommandation de Fiche cliente crée une carte de Relance) fonctionne entre deux sections ; il n'exigeait pas la co-location dans une barre d'onglets.
- Le widget « Tournée du matin » de l'Accueil reste le raccourci d'1 tap pour « Valider & envoyer » en bloc ; son lien « Voir le détail » pointe désormais vers la section Relances (top-level), plus vers un onglet de Clientèle.
- `CONTEXT.md` : nouvelles entrées **Accueil**, **Clientèle**, **Relances**, **Campagne** ; l'entrée **Conseillère** pointe vers la section Relances (volet paramétrage) et non plus vers un onglet de Clientèle.
- `docs/USERFLOW.md` : amendé inline (bandeau v2.1 + sections concernées).
- Code : `Journée` → `Accueil` dans la sidebar, les libellés et les commentaires (`app/page.tsx`, `components/shell/sidebar.tsx`, `components/journee/*`, `components/shell/comptoir-bar.tsx`, `lib/store/app-store.ts`, `app/recap-ventes/page.tsx` — non encore fait au moment de l'ADR).

## Alternative écartée

Garder la section Clientèle à onglets (Répertoire · Relances · Campagnes · Conseils). Écarté : elle mélange un geste quotidien (vider la tournée) avec de la consultation en profondeur et de la config rare-édition, et impose au geste le plus fréquent un tap dans une section dont ce n'est pas le rôle — d'où le widget de compensation sur l'Accueil, symptôme que le rangement était faux.
