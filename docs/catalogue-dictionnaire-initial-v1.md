# Dictionnaire initial Noor Communication — correspondance des données

Version 1.0 — 12 novembre 2026  
Branche : `main`  
Statut : correspondance technique préparatoire, à valider avant migration.  
Aucune donnée Supabase n'a été modifiée.

## 1. État observé de Supabase

Inventaire en lecture seule du projet `ghjdhdnztvcrijualwxc` :

| Table | Lignes observées |
|---|---:|
| `services` | 5 |
| `projects` | 0 |
| `service_pricing` | 0 |
| `blog_posts` | 0 |
| `site_content` | 0 |
| `site_settings` | 2 |
| `contact_messages` | 0 |
| `noor_admin_users` | 1 |

La base contient cinq services génériques, mais aucune réalisation ni ligne tarifaire. Le catalogue de référence détaillé est encore dans `js/catalogue.js` : 7 catégories historiques, 26 subdivisions, 36 réalisations référencées et 25 lignes tarifaires. Il faut importer cette source locale sans la confondre avec les cinq lignes de `services`.

Les tables publiques existantes ont RLS activé. Les politiques observées autorisent les administrateurs reconnus par `private.is_noor_admin()` à gérer les contenus et les visiteurs anonymes à lire les contenus publiés. Les messages restent réservés aux administrateurs pour la lecture. Deux avertissements de sécurité restent présents : RLS sans politique sur `private.noor_contact_rate_limits` et `public.noor_admin_users` (INFO ; vérifier les privilèges et l'accès effectif), et protection des mots de passe compromis désactivée (WARN). Ne pas supprimer ni assouplir ces protections pendant la migration du catalogue.

## 2. Taxonomie cible initiale

| Catégorie cible | Pôle | Slug proposé | Ancien(s) identifiant(s) à préserver |
|---|---|---|---|
| Design graphique | NoorCreative | `design-graphique` | `identite`, `print` |
| Photographie | NoorPictures | `photographie` | `photo` |
| Vidéographie | Noorfilms | `videographie` | `video` |
| Live streaming | NoorStream | `live-streaming` | anciennement subdivision `live` de `video` |
| Édition | Noorédition | `edition` | `edition` |
| Communication digitale | Noordigital | `communication-digitale` | `digital` |
| Web et applications | NoorDev | `web-applications` | `web` |

Les slugs cibles sont des propositions techniques et ne deviennent définitifs qu'après validation. Les UUID de base de données seront les identifiants relationnels immuables. Les anciens slugs restent des alias de navigation, pas des clés étrangères.

### Design graphique — deux familles visibles

**Identité visuelle**
- `logo-simple` — Logo simple
- `logo-complexe` — Logo complexe ou illustré
- `identite-basique` — Identité visuelle basique
- `charte` — Charte graphique complète

**Supports graphiques**
- `flyers` — Flyers
- `bannieres` — Bannières réseaux sociaux
- `cartes` — Cartes de visite
- `kakemono` — Kakemonos
- `carrousel` — Carrousels

### Autres subdivisions

- Photographie : `studio`, `exterieur`, `beaute`, `evenement`, `produit`.
- Vidéographie : `video-simple`, `video-pro`, `motion`.
- Live streaming : `live`.
- Édition : `couverture`, `page-garde`, `mise-en-page`, `packaging`.
- Communication digitale : `community-management`, `strategie-digitale`.
- Web et applications : `site-vitrine`, `maintenance-web`.

Total : 26 subdivisions. Motion design reste en Vidéographie. La subdivision `live` est transférée à la nouvelle catégorie Live streaming sans changer son identifiant historique.

## 3. Correspondance des 25 lignes tarifaires

Chaque ligne ci-dessous est affectée à une subdivision car son libellé la désigne clairement. Les montants, préfixes, suffixes et délais doivent être importés tels qu'ils existent dans la source, sans conversion ni arrondi.

### Design graphique — 12 lignes

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Logo simple | `logo-simple` | 25 $ | 5 à 7 jours | 4 jours |
| Logo complexe ou illustré | `logo-complexe` | 40 $ | 5 à 7 jours | 4 jours |
| Identité visuelle basique | `identite-basique` | 50 $ | 7 jours | 4 jours |
| Charte graphique complète | `charte` | 100 $ | 7 à 10 jours | 5 jours |
| Flyer simple | `flyers` | 10 $ | 2 à 3 jours | 24 h |
| Flyer essentiel | `flyers` | 20 $ | 2 à 3 jours | 24 h |
| Flyer upgrade | `flyers` | dès 50 $ | 4 jours | 48 h |
| Bannière réseaux sociaux | `bannieres` | 10 $ | 2 à 3 jours | 24 h |
| Carrousel (1 à 10 slides) | `carrousel` | 10 $ | 3 jours | 48 h |
| Carte de visite | `cartes` | 15 $ | 2 à 3 jours | 24 h |
| Kakemono simple | `kakemono` | 25 $ | 2 à 3 jours | 48 h |
| Kakemono upgrade | `kakemono` | 50 $ | 4 jours | 48 h |

### Édition — 6 lignes

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Couverture de livre | `couverture` | dès 25 $ | 4 jours | 48 h |
| Page de garde, rapport | `page-garde` | 20 $ | 2 à 3 jours | 24 h |
| Mise en page de documents | `mise-en-page` | dès 30 $ | 4 à 7 jours | 72 h |
| Packaging simple | `packaging` | 30 $ | 4 à 6 jours | 72 h |
| Packaging moyen | `packaging` | 50 $ | 4 à 7 jours | 72 h |
| Packaging upgrade | `packaging` | 150 $ | 5 à 7 jours | 72 h |

### Photographie — 3 lignes

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Photo studio | `studio` | dès 15 $ | 2 à 3 jours | 24 h |
| Photo outdoor et corporate | `exterieur` | dès 25 $/h | 2 à 3 jours | 48 h |
| Photo événement | `evenement` | 50 $/h | 10 jours | 5 à 7 jours |

La source locale affiche aussi une indication de prix sur Photo beauté (`Sur devis`) et Photo produit (`dès 15 # Dictionnaire initial Noor Communication — correspondance des données

Version 1.0 — 12 novembre 2026  
Branche : `main`  
Statut : correspondance technique préparatoire, à valider avant migration.  
Aucune donnée Supabase n'a été modifiée.

## 1. État observé de Supabase

Inventaire en lecture seule du projet `ghjdhdnztvcrijualwxc` :

| Table | Lignes observées |
|---|---:|
| `services` | 5 |
| `projects` | 0 |
| `service_pricing` | 0 |
| `blog_posts` | 0 |
| `site_content` | 0 |
| `site_settings` | 2 |
| `contact_messages` | 0 |
| `noor_admin_users` | 1 |

La base contient cinq services génériques, mais aucune réalisation ni ligne tarifaire. Le catalogue de référence détaillé est encore dans `js/catalogue.js` : 7 catégories historiques, 26 subdivisions, 36 réalisations référencées et 25 lignes tarifaires. Il faut importer cette source locale sans la confondre avec les cinq lignes de `services`.

Les tables publiques existantes ont RLS activé. Les politiques observées autorisent les administrateurs reconnus par `private.is_noor_admin()` à gérer les contenus et les visiteurs anonymes à lire les contenus publiés. Les messages restent réservés aux administrateurs pour la lecture. Deux avertissements de sécurité restent présents : RLS sans politique sur `private.noor_contact_rate_limits` et `public.noor_admin_users` (INFO ; vérifier les privilèges et l'accès effectif), et protection des mots de passe compromis désactivée (WARN). Ne pas supprimer ni assouplir ces protections pendant la migration du catalogue.

## 2. Taxonomie cible initiale

| Catégorie cible | Pôle | Slug proposé | Ancien(s) identifiant(s) à préserver |
|---|---|---|---|
| Design graphique | NoorCreative | `design-graphique` | `identite`, `print` |
| Photographie | NoorPictures | `photographie` | `photo` |
| Vidéographie | Noorfilms | `videographie` | `video` |
| Live streaming | NoorStream | `live-streaming` | anciennement subdivision `live` de `video` |
| Édition | Noorédition | `edition` | `edition` |
| Communication digitale | Noordigital | `communication-digitale` | `digital` |
| Web et applications | NoorDev | `web-applications` | `web` |

Les slugs cibles sont des propositions techniques et ne deviennent définitifs qu'après validation. Les UUID de base de données seront les identifiants relationnels immuables. Les anciens slugs restent des alias de navigation, pas des clés étrangères.

### Design graphique — deux familles visibles

**Identité visuelle**
- `logo-simple` — Logo simple
- `logo-complexe` — Logo complexe ou illustré
- `identite-basique` — Identité visuelle basique
- `charte` — Charte graphique complète

**Supports graphiques**
- `flyers` — Flyers
- `bannieres` — Bannières réseaux sociaux
- `cartes` — Cartes de visite
- `kakemono` — Kakemonos
- `carrousel` — Carrousels

### Autres subdivisions

- Photographie : `studio`, `exterieur`, `beaute`, `evenement`, `produit`.
- Vidéographie : `video-simple`, `video-pro`, `motion`.
- Live streaming : `live`.
- Édition : `couverture`, `page-garde`, `mise-en-page`, `packaging`.
- Communication digitale : `community-management`, `strategie-digitale`.
- Web et applications : `site-vitrine`, `maintenance-web`.

Total : 26 subdivisions. Motion design reste en Vidéographie. La subdivision `live` est transférée à la nouvelle catégorie Live streaming sans changer son identifiant historique.

## 3. Correspondance des 25 lignes tarifaires

Chaque ligne ci-dessous est affectée à une subdivision car son libellé la désigne clairement. Les montants, préfixes, suffixes et délais doivent être importés tels qu'ils existent dans la source, sans conversion ni arrondi.

### Design graphique — 12 lignes

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Logo simple | `logo-simple` | 25 $ | 5 à 7 jours | 4 jours |
| Logo complexe ou illustré | `logo-complexe` | 40 $ | 5 à 7 jours | 4 jours |
| Identité visuelle basique | `identite-basique` | 50 $ | 7 jours | 4 jours |
| Charte graphique complète | `charte` | 100 $ | 7 à 10 jours | 5 jours |
| Flyer simple | `flyers` | 10 $ | 2 à 3 jours | 24 h |
| Flyer essentiel | `flyers` | 20 $ | 2 à 3 jours | 24 h |
| Flyer upgrade | `flyers` | dès 50 $ | 4 jours | 48 h |
| Bannière réseaux sociaux | `bannieres` | 10 $ | 2 à 3 jours | 24 h |
| Carrousel (1 à 10 slides) | `carrousel` | 10 $ | 3 jours | 48 h |
| Carte de visite | `cartes` | 15 $ | 2 à 3 jours | 24 h |
| Kakemono simple | `kakemono` | 25 $ | 2 à 3 jours | 48 h |
| Kakemono upgrade | `kakemono` | 50 $ | 4 jours | 48 h |

### Édition — 6 lignes

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Couverture de livre | `couverture` | dès 25 $ | 4 jours | 48 h |
| Page de garde, rapport | `page-garde` | 20 $ | 2 à 3 jours | 24 h |
| Mise en page de documents | `mise-en-page` | dès 30 $ | 4 à 7 jours | 72 h |
| Packaging simple | `packaging` | 30 $ | 4 à 6 jours | 72 h |
| Packaging moyen | `packaging` | 50 $ | 4 à 7 jours | 72 h |
| Packaging upgrade | `packaging` | 150 $ | 5 à 7 jours | 72 h |

### Photographie — 3 lignes

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Photo studio | `studio` | dès 15 $ | 2 à 3 jours | 24 h |
| Photo outdoor et corporate | `exterieur` | dès 25 $/h | 2 à 3 jours | 48 h |
| Photo événement | `evenement` | 50 $/h | 10 jours | 5 à 7 jours |

). À la demande du fondateur, deux lignes provisoires sont ajoutées au catalogue tarifaire : Photo beauté à partir de 20 $ (montant arbitraire initial) et Photo produit à partir de 15 $ (reprend l'indication locale). Les délais restent à définir. Ces deux lignes doivent être importées en brouillon (`is_published = false`) afin d'être modifiables depuis l'administration avant publication. Voir `docs/catalogue-tarifs-provisoires-v1.md`. Le total tarifaire cible passe donc de 25 à 27 lignes provisoires.

### Vidéographie — 3 lignes

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Vidéo simple | `video-simple` | dès 50 $ | 5 à 7 jours | 72 h |
| Vidéo pro | `video-pro` | dès 100 $ | 7 à 10 jours | 5 jours |
| Motion design | `motion` | dès 100 $ | 10 jours | 5 à 7 jours |

### Live streaming — 1 ligne

| Prestation source | Subdivision cible | Prix | Délai standard | Express |
|---|---|---:|---|---|
| Live streaming | `live` | dès 100 $ | Sur devis | Sur devis |

La ligne Live streaming est déplacée vers la catégorie Live streaming, et non conservée dans Vidéographie.

### Catégories sans ligne tarifaire

- Communication digitale : 0 ligne tarifaire.
- Web et applications : 0 ligne tarifaire.

Le site affichera **« Bientôt disponible »** pour ces catégories tant qu'aucun tarif n'y est publié. Il ne faut pas convertir cette mention en « Sur devis ».

Répartition : Design graphique 12 ; Photographie 3 ; Vidéographie 3 ; Live streaming 1 ; Édition 6 ; Communication digitale 0 ; Web et applications 0. Total : 27 lignes provisoires après ajout de Photo beauté et Photo produit.

## 4. Réalisations — répartition source

| Catégorie cible | Subdivision | Nombre | Slugs de réalisations |
|---|---|---:|---|
| Design graphique | Logo complexe | 3 | `logo-resurrection`, `logo-nzambe-kaka`, `logo-fascitech` |
| Design graphique | Identité visuelle basique | 3 | `hoodie-yeshua`, `tshirt-nzambe-kaka`, `tshirt-20ans` |
| Design graphique | Flyers | 12 | `conjer`, `nzambe-kaka-affiche`, `culte-dominical`, `convention-exode`, `tabeera`, `sept-fois`, `impact-jeunesse`, `jeune-courageux`, `salon-gb-pro`, `cillia-beauty`, `eau-saine`, `save-the-date` |
| Design graphique | Bannières | 2 | `ruth-ndanda`, `bon-debut-semaine` |
| Édition | Couvertures | 3 | `croissance-eglise`, `pais-mes-brebis`, `pharisien-moderne` |
| Photographie | Studio | 4 | `studio-1` à `studio-4` |
| Photographie | Extérieur | 3 | `outdoor-1` à `outdoor-3` |
| Photographie | Beauté | 2 | `beaute-1`, `beaute-2` |
| Photographie | Événement | 4 | `evenement-1` à `evenement-4` |

Total : 36 réalisations. Les subdivisions sans réalisation doivent rester présentes dans le catalogue. Aucune réalisation ne doit être créée pour combler les catégories vides.

## 5. Décisions de structure pour la base

- Catégories, familles et subdivisions seront des tables relationnelles distinctes.
- `projects` référence une catégorie par UUID et une subdivision facultative par UUID.
- `service_pricing` référence une catégorie par UUID et une subdivision facultative par UUID. La subdivision peut être nulle lorsqu'un tarif couvre plusieurs subdivisions.
- `services` ne sera pas réutilisée comme table de catégories sans migration explicite : elle représente actuellement cinq services génériques et n'a pas la granularité voulue.
- Ajouter un champ de statut/archivage distinct de `is_published` pour préserver les historiques.
- Ajouter des alias de slugs pour les anciennes URL. Les identifiants historiques des subdivisions sont préservés.
- Les noms de catégories et de subdivisions ne servent jamais de clés étrangères.
- Les suppressions de catégories/familles/subdivisions ayant des dépendances sont refusées par défaut ; pas de cascade silencieuse.
- Les politiques RLS doivent autoriser la lecture publique des seuls éléments publiés et les mutations des seuls administrateurs. Les politiques existantes doivent être conservées ou remplacées explicitement dans une migration relue.

## 6. Vérifications avant import

Avant tout changement de schéma ou import :
1. Valider les slugs cibles définitifs.
2. Vérifier le mapping des deux indications photo sans ligne tarifaire.
3. Vérifier les descriptions et métadonnées des 36 réalisations, les chemins d’images et les relations catégorie/subdivision.
4. Préparer une sauvegarde et un plan de retour arrière.
5. Créer les nouvelles structures de façon additive.
6. Importer les catégories, familles et subdivisions en brouillon.
7. Importer les 36 réalisations et les 27 lignes tarifaires en brouillon.
8. Comparer les comptes, slugs, médias, prix, délais et relations avant/après.
9. Tester les permissions avec anon, admin et owner.
10. Publier uniquement après validation.

**Ce document est un dictionnaire de correspondance préparatoire. Il ne constitue pas une migration SQL et n'a effectué aucune écriture dans Supabase.**
