# Tarifs provisoires — Photographie

Version 1.0 — 12 novembre 2026  
Branche : `main`  
Statut : valeurs de départ choisies à la demande du fondateur ; modifiables depuis l'administration avant ou après publication.

| Catégorie | Subdivision | Prestation | Prix provisoire | Préfixe | Suffixe | Délais |
|---|---|---|---:|---|---|---|
| Photographie | `beaute` | Photo beauté | 20 | Dès | — | À définir |
| Photographie | `produit` | Photo produit | 15 | Dès | — | À définir |

## Règles d'import

- Ces deux lignes complètent les 25 lignes tarifaires déjà répertoriées : total cible provisoire **27 lignes**.
- Les montants sont en dollars américains (USD).
- Le prix Photo beauté de 20 $ est une proposition arbitraire initiale.
- Le prix Photo produit reprend l'indication « dès 15 $ » déjà présente dans le catalogue local.
- Les délais standard et express restent vides / à définir : aucun délai n'a été inventé.
- Ces tarifs doivent être importés en brouillon (`is_published = false`) pour que le propriétaire puisse les modifier dans l'administration avant publication.
- Le formulaire d'administration devra permettre de modifier le montant, le préfixe, le suffixe, la description, les délais, l'ordre et le statut de publication.
- Il ne faut pas traiter ces montants comme un engagement commercial définitif avant validation par le propriétaire.

Importées dans `public.service_pricing` le 12 novembre 2026. Les deux lignes sont présentes en brouillon (`is_published = false`) et restent modifiables depuis l'administration.


L'affichage public ajoute déjà le symbole `$` après le montant ; le champ `price_suffix` de ces deux lignes reste donc vide pour éviter un affichage doublé (`20 $ $`).
