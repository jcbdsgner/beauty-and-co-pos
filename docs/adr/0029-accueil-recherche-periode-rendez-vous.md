# Accueil : recherche + période sur la section « Rendez-vous »

La section « Rendez-vous » de l'Accueil (ADR 0014) était figée sur le jour courant, sans aucun moyen de retrouver un rendez-vous d'hier ou de la semaine prochaine ailleurs qu'en naviguant le Planning jour par jour — qui, depuis ADR 0020/0025, n'affiche justement plus aucune liste (« un seul objet : le programme de chaque praticienne », recherche et liste retirées, reportées sur l'Accueil). Besoin exprimé : pouvoir chercher une cliente ou une praticienne et choisir une période pour voir tous les rendez-vous correspondants, pas seulement ceux du jour.

## Décision

- La section garde son rôle (« centre de pilotage du jour ») mais n'est plus figée : une barre de recherche (cliente — nom/téléphone — ou praticienne, même logique que `searchClients`) et un sélecteur de période (Aujourd'hui — défaut, Cette semaine, Ce mois, Personnalisé avec deux `DatePicker`) filtrent désormais `reservationRows` à la place du filtre `date === aujourd'hui` codé en dur. Un filtre de salon (`ChipFilter`, même mécanisme que le Planning, ADR 0028) rejoint l'en-tête de l'Accueil. Quand la recherche correspond à des clientes (même hors période affichée, y compris sans aucun rendez-vous), une grille « Clientes » (`ClientMatchCard`) les affiche au-dessus de la liste, chacune menant directement à sa fiche.
- **Le Planning n'est pas touché.** ADR 0020/0025 tiennent : aucune recherche, aucune liste, aucune bascule de vue n'apparaît au Planning. Toute la fonctionnalité vit sur l'Accueil.
- **Le Calendrier reste borné à un seul jour.** `AccueilCalendar` est un rail horaire à une colonne (ADR 0019) ; il n'a pas de forme utile au-delà d'une journée. Dès que la période n'est pas « Aujourd'hui », la bascule Liste/Calendrier disparaît et l'écran retombe sur Liste.
- **`AccueilDayList` apprend à grouper par jour.** Groupée par tranche de 2h (ADR 0018) comme avant quand tout tient sur un seul jour (le cas par défaut, rendu à l'identique — pas d'en-tête de date) ; dès que la période affichée couvre plusieurs jours, un en-tête de date (« Aujourd'hui », « lundi 22 septembre »…) s'intercale au-dessus des tranches horaires de chaque jour.

## Alternative écartée

Un nouvel écran dédié « Rendez-vous » (recherche + période, liste seule), avec un lien depuis l'Accueil/Planning. Envisagé puis écarté par l'utilisateur en grill : la fonctionnalité doit vivre directement dans la section existante de l'Accueil plutôt que d'ouvrir une nouvelle surface.
