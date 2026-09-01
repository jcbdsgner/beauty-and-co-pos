# Remise accordée : deux seuils, 10 % au code personnel puis code manager jusqu'à 20 %

[ADR 0003](0003-modele-de-remise.md) posait un plafond unique de **20 %** sur la remise
accordée, débloquée par le seul code personnel de la réceptionniste. On le scinde en deux
seuils : **jusqu'à 10 %**, le code personnel suffit ; **de 10 à 20 %**, la réceptionniste
saisit en plus un **code manager** — un code temporaire que la direction lui communique au
cas par cas. **20 % reste le plafond absolu.** Le motif obligatoire après l'encaissement,
l'ordre de calcul et la base (total des prestations, produits exclus) sont inchangés.

Pourquoi : accorder 20 % de tête sur un geste quotidien était trop large. 10 % couvre le
geste commercial courant ; la tranche 10–20 % devient un acte tracé qui exige un feu vert
de la direction — sans jamais obliger celle-ci à se connecter à l'app. L'[ADR 0001](0001-persona-unique-poste-de-comptoir.md)
tient : le manager n'est pas un rôle applicatif, juste une autorisation venue de l'extérieur.

## Conséquences

- `RemiseAccordee` gagne `managerCode?: string`, conservé sur la vente pour la traçabilité.
  Valeur **non vérifiée** — mock sans backend, tout code à 4–6 chiffres passe.
- `grantDiscount(...)` : refuse une valeur > 10 % sans code manager ; refuse > 20 % dans
  tous les cas.
- `components/comptoir/discount-section.tsx` : le champ « code manager » apparaît dès que la
  valeur saisie (montant ou %) dépasse 10 % des prestations, et devient obligatoire.
- `CONTEXT.md` : entrée **Remise accordée** réécrite, nouvelle entrée **Code manager**.
- `docs/USERFLOW.md` : § Comptoir à amender à l'implémentation.

## Alternative écartée

Un bloc « remise manager » distinct, choisi d'emblée. Écarté : dédouble le modèle de remise
et l'UI pour une différence qui n'est qu'un seuil sur le même objet.
