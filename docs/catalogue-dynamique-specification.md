# Noor Communication — spécification du catalogue administrable

Version : 1.0 — 12 novembre 2026  
Statut : spécification fonctionnelle préparatoire ; aucune migration ni donnée de production modifiée.

## 1. Objectif

Le catalogue public ne doit plus être limité à des catégories codées dans JavaScript. Les administrateurs autorisés doivent pouvoir gérer depuis l'espace d'administration du site, puis depuis l'application mobile connectée à la même API Supabase :

- les catégories et leurs noms ;
- les pôles commerciaux associés (nom d'affichage facultatif) ;
- les familles visibles de subdivisions ;
- les subdivisions ;
- les réalisations et leurs médias ;
- les tarifs et les prestations ;
- l'ordre, le statut de publication et l'archivage.

Une modification validée dans l'administration doit être répercutée sur le site et l'application sans nouvelle version du code.

## 2. Taxonomie initiale approuvée

Les sept catégories initiales sont des données de départ, pas une limite technique. Les identifiants ci-dessous sont des slugs proposés ; leur gel définitif reste à confirmer.

| Catégorie | Pôle / sous-marque | Slug proposé | Subdivisions initiales |
|---|---|---|---|
| Design graphique | NoorCreative | design-graphique | Logo simple ; Logo complexe ou illustré ; Identité visuelle basique ; Charte graphique complète ; Flyers ; Bannières réseaux sociaux ; Cartes de visite ; Kakemonos ; Carrousels |
| Photographie | NoorPictures | photographie | Photo studio ; Photo extérieure ; Photo beauté ; Photo événement ; Photo produit |
| Vidéographie | Noorfilms | videographie | Vidéo simple ; Vidéo professionnelle ; Motion design |
| Live streaming | NoorStream | live-streaming | Live streaming |
| Édition | Noorédition | edition | Couvertures de livre ; Pages de garde et rapports ; Mise en page de documents ; Packaging |
| Communication digitale | Noordigital | communication-digitale | Community management ; Stratégie digitale |
| Web et applications | NoorDev | web-applications | Site vitrine ; Maintenance web |

Les familles visibles de Design graphique sont :
- **Identité visuelle** : Logo simple, Logo complexe ou illustré, Identité visuelle basique, Charte graphique complète.
- **Supports graphiques** : Flyers, Bannières réseaux sociaux, Cartes de visite, Kakemonos, Carrousels.

Motion design reste dans Vidéographie. Live streaming est une catégorie distincte. Web et applications conserve uniquement Site vitrine et Maintenance web pour la structure initiale. Les pôles sont des appellations commerciales de Noor Communication, pas des sociétés juridiquement indépendantes.

## 3. Fonctions administrateur obligatoires

### Catégories
- Créer une catégorie avec nom, slug, description, pôle facultatif, image/icône facultative, ordre et statut.
- Modifier le nom, la description, le pôle, l'image, l'ordre et le statut.
- Renommer sans changer l'identifiant interne immuable.
- Réordonner par glisser-déposer ou commandes haut/bas.
- Désactiver/archiver sans perdre les contenus ni les liens historiques.
- Supprimer uniquement si aucun contenu dépendant n'existe, ou après une opération explicite de transfert/réaffectation.

### Familles et subdivisions
- Créer, modifier, réordonner, archiver et supprimer selon les mêmes règles de dépendance.
- Une subdivision appartient à une catégorie ; une famille est facultative et sert à organiser visuellement les subdivisions.
- Une catégorie peut exister sans famille ni subdivision.
- Les deux familles de Design graphique sont visibles dans le catalogue public.

### Réalisations
- Créer, modifier, dupliquer, déplacer, ordonner, publier, dépublier et archiver.
- Champs : titre, slug, description courte et longue, client facultatif, année facultative, catégorie, subdivision facultative, image de couverture, galerie/médias, mise en avant, ordre, statut.
- Autoriser les formats médias réellement pris en charge ; contrôler MIME, taille et extension côté serveur.
- Conserver les médias existants lors d'un changement de titre ou de catégorie.
- Prévoir l'ajout futur de vidéos sans imposer une refonte de la taxonomie.

### Tarifs
- Créer, modifier, dupliquer, déplacer, ordonner, publier, dépublier et archiver une ligne tarifaire.
- Champs : catégorie, subdivision facultative, nom de prestation, détail, montant, devise, préfixe (« dès »), suffixe (ex. « /h »), délai standard, délai express, ordre, statut.
- Autoriser les tarifs fixes, « dès », prix par heure et prestations sur devis.
- Les montants et devises doivent être des champs structurés, pas uniquement du texte libre.
- Un tarif peut rester rattaché à une catégorie lorsqu'il couvre plusieurs subdivisions ; ne pas forcer une association artificielle.
- Une catégorie sans tarif publié affiche **« Bientôt disponible »**. Ne pas transformer automatiquement cette mention en « Sur devis ».

### Publication et historique
- Tout nouvel élément peut être enregistré en brouillon.
- Prévisualiser avant publication.
- Les éléments non publiés ne sont pas accessibles au public.
- Journaliser les opérations sensibles : création, renommage, déplacement, publication, archivage et suppression.
- Afficher une confirmation avant une suppression ou un déplacement qui affecte plusieurs éléments.

## 4. Règles de données et d'intégrité

1. Chaque catégorie, famille, subdivision, réalisation et tarif possède un UUID immuable.
2. Les slugs sont uniques dans leur périmètre et modifiables uniquement avec mise à jour des alias historiques.
3. Les relations utilisent des clés étrangères, jamais le nom visible comme clé de relation.
4. Renommer une catégorie ne doit pas casser les réalisations, tarifs, URLs ni liens d'administration.
5. Une suppression avec dépendances est refusée par défaut. L'administrateur doit d'abord déplacer ou archiver les dépendances ; aucune suppression en cascade silencieuse.
6. L'archivage est réversible. Une suppression définitive doit être une action distincte, autorisée et journalisée.
7. Les opérations de déplacement doivent être transactionnelles.
8. Les tris sont explicites par champ `sort_order`.
9. Les comptes publics ne peuvent ni créer, ni modifier, ni supprimer le catalogue.
10. L'autorisation est vérifiée côté serveur et par RLS ; masquer un bouton dans le navigateur ne constitue pas une protection.
11. Les trois comptes administrateurs prévus peuvent gérer les contenus selon leurs rôles. Seul le compte principal (owner) peut inviter ou administrer les comptes, selon la politique existante.
12. Le site web et l'application mobile utilisent les mêmes tables, règles RLS et fonctions métier.

## 5. Modèle relationnel cible à étudier

- `catalogue_categories` : catégories.
- `catalogue_category_families` : familles visibles, rattachées à une catégorie.
- `catalogue_subcategories` : subdivisions, catégorie obligatoire, famille facultative.
- `catalogue_category_aliases` : anciens slugs de catégories et ancres historiques.
- `projects` : réalisations, avec références UUID vers catégorie et subdivision.
- `service_pricing` : tarifs, référence obligatoire vers catégorie et référence subdivision facultative.
- `catalogue_audit_logs` : journal des créations, modifications et suppressions, alimenté par des déclencheurs SQL.

Le modèle exact devra être comparé aux colonnes, contraintes, politiques RLS et données déjà présentes avant toute migration. Ne pas créer ces tables à l'aveugle ni remplacer les tables existantes.

## 6. Migration et compatibilité

- Conserver les sept catégories actuelles, les 26 subdivisions, les 36 réalisations et les 27 lignes tarifaires (25 historiques et 2 tarifs photo provisoires) de la source locale.
- Préserver les identifiants historiques : `identite`, `print`, `edition`, `photo`, `video`, `digital`, `web`, ainsi que les identifiants des subdivisions.
- Prévoir des alias pour les anciens liens `realisations.html#identite`, `#print`, leurs liens de subdivisions et les liens de tarifs.
- Regrouper Identité et Print sous Design graphique sans effacer les anciens identifiants.
- Déplacer Live streaming hors de Vidéographie sans perdre son ancien identifiant de subdivision `live`.
- Conserver Motion design dans Vidéographie.
- Importer d'abord en brouillon ; comparer les nombres et les identifiants avant/après ; publier seulement après validation.
- La source locale reste un mécanisme de secours jusqu'à validation du catalogue dynamique. Les cinq lignes de la table `services` ne doivent pas remplacer à elles seules la taxonomie détaillée.
- Ne jamais exécuter le snapshot SQL de référence comme migration.

## 7. État actuel et limites à traiter

L'interface `admin.html` / `admin.js` permet actuellement de gérer les services, réalisations, tarifs, pages, articles, messages et paramètres, mais :
- les catégories et subdivisions ne disposent pas encore d'un gestionnaire dédié ;
- le champ catégorie des réalisations et tarifs est du texte libre ;
- la structure de cinq lignes de `services` ne représente pas la taxonomie à trois niveaux ;
- le catalogue local contient des données qui ne sont pas toutes importées dans Supabase.

Cette spécification ne prétend pas que ces fonctionnalités de taxonomie sont déjà opérationnelles. Elles nécessitent une évolution coordonnée du schéma, des politiques RLS, de l'API, de l'administration et du rendu public.

## 8. Séquence de réalisation

1. Inventorier précisément le schéma Supabase, les RLS, les contraintes et les données existantes en lecture seule.
2. Valider les slugs finaux et la correspondance de chaque réalisation/tarif.
3. Préparer une migration additive avec sauvegarde, clés étrangères, index, politiques RLS et fonctions nécessaires.
4. Construire les écrans CRUD d'administration et les contrôles de validation.
5. Adapter le site public à la lecture de la taxonomie dynamique avec fallback local.
6. Importer en brouillon et comparer les comptes : 7 catégories, 2 familles visibles, 26 subdivisions, 36 réalisations, 27 tarifs provisoires.
7. Tester les rôles, l'accès anonyme, les opérations de renommage/déplacement/archivage et les anciens liens.
8. Publier après validation explicite ; réutiliser ensuite la même API dans l'application mobile.

**Aucune migration Supabase ni modification de données de production n'est autorisée par ce document seul.**
