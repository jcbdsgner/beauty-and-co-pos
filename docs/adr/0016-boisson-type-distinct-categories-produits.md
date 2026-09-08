---
status: accepted
---

# Boisson, type distinct du Produit — et les catégories de produits par marque

## Contexte

Le Menu se parcourait par trois familles **Services · Produits · Boissons**, mais dans les
données une boisson était un `Produit` comme un autre, rangé sous une catégorie sentinelle
`categoryId: "boissons"` présente dans `PRODUCT_CATEGORIES`. Toute l'UI devait ensuite
*exclure* cette catégorie fantôme (`c.id !== "boissons"`, `categoryId !== "boissons"`) partout —
rail du Comptoir, volet Catalogue, filtre « Tout ». Le stock des boissons était un nombre porté
mais jamais affiché (« un bar ne se compte pas au verre »).

Par ailleurs le rayon revente ne comptait qu'une marque (Kérastase). Le salon en vend
désormais plusieurs (**Saryna Keys**, **Nefertiti**, un fourre-tout **Autres**), et veut les
choisir au comptoir comme on choisit une grande catégorie de prestation.

## Décision

### 1. `Boisson` est un type distinct

- Nouveau type `Boisson` (`lib/data/boissons.ts`, tableau `BOISSONS`) : `id`, `name`, `price`,
  `active`, `image?`, `description?`. **Ni `categoryId`, ni `subcategory`, ni `stock`.**
- `CartLine.kind` gagne `"boisson"`. `computeTotals` : `subtotal = prestations + produits + boissons`.
  Une boisson **compte pour le total et les points fidélité gagnés**, n'est **jamais** dans
  l'assiette d'une remise accordée (comme les produits), et n'a **pas** de décrément de stock à
  l'encaissement.
- `saleNeedsClient` inchangé : seule une **prestation** au panier force l'identification — une
  vente de boissons (ou de produits, ou des deux) s'encaisse sans cliente ([ADR 0013](0013-identification-cliente-conditionnelle-nouvelle-vente.md)).

### 2. Catégories de produits par marque

- `PRODUCT_CATEGORIES` = `kerastase`, `saryna-keys`, `nefertiti`, `autres` (ordre d'affichage,
  « Autres » en dernier). Plus de `boissons` dans la liste.
- **Kérastase** garde ses **gammes** en sous-catégories (`KERASTASE_GAMMES`). Les trois autres
  catégories n'ont pas de sous-niveau.

### 3. Menu : trois onglets, rail à deux niveaux pour les produits

- L'onglet est relabellé **« Prestations »** (valeur interne inchangée) ; les trois onglets sont
  **Prestations · Produits · Boissons**.
- Le rail des **Produits** passe au même composant à deux niveaux que les Prestations : blocs de
  catégorie dans le rail vertical (Kérastase, Saryna Keys, Nefertiti, Autres), et Kérastase
  déplie ses gammes en pastilles au-dessus de la grille. **Blocs en texte seul** — pas de
  pictogramme (aucune marque disponible, et le rail gère déjà l'absence d'icône).
- Les **Boissons** n'ont pas de rail.
- Le volet **Produits** du Catalogue garde ses chips (catégorie + gamme), qui passent à l'échelle
  des quatre catégories.

## Conséquences

- `lib/data/types.ts` : nouveau `Boisson` ; `CartLine.kind` `"service" | "produit" | "boisson"` ;
  `Produit` perd le cas « bar » de son commentaire `subcategory` / `description`.
- `lib/data/menu.ts` : `PRODUCT_CATEGORIES` réécrit ; les entrées `boisson-*` sortent de `PRODUITS`.
- `lib/data/boissons.ts` : nouveau — `BOISSONS` (les 7 références du bar, sans stock).
- `lib/store/app-store.ts` : `BOISSONS` exposé via le provider ; `computeTotals` additionne les
  boissons ; `addCartLine` / cap de quantité tolèrent `kind: "boisson"` (cap 20, pas de stock) ;
  `confirmPayment` ne décrémente que les `kind: "produit"`.
- `components/comptoir/menu-panel.tsx` : `productFilterTree()` bâti comme `serviceFilterTree()` ;
  onglet « Prestations » ; grille des boissons depuis `BOISSONS`.
- `components/catalogue/catalogue-produits.tsx` : quatre catégories ; `catalogue-boissons.tsx`
  lit `BOISSONS`.
- `CONTEXT.md` : entrées **Prestation**, **Produit**, **Boisson** ajoutées ; **Menu**, **Catalogue**,
  **Encaisser** amendées.

## Alternatives écartées

- **Garder la boisson en `Produit` avec un sentinel `categoryId`** (statu quo assaini : juste
  retirer « boissons » de `PRODUCT_CATEGORIES`). Écarté : la valeur magique fuit dans chaque
  filtre et chaque garde ; un lecteur futur ne sait pas si « boissons » est une catégorie ou pas.
  Le type distinct rend la troisième famille explicite dans les données, comme elle l'est à l'écran.
- **Enregistrer la ligne de panier d'une boisson en `kind: "produit"`** (distinction limitée au
  catalogue). Écarté : incohérent avec le choix d'en faire un concept à part, et brouille le reçu.
