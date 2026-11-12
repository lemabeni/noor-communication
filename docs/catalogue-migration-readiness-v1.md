# Noor Communication — état de préparation du catalogue dynamique

Date : 12 novembre 2026  
Branche : `main`  
Statut : code et scripts préparatoires enregistrés ; aucune migration exécutée.

## 1. Données préparées

Le seed préparatoire est construit à partir de `js/catalogue.js`, vérifié par correspondance des identifiants et des relations :

| Élément | Nombre attendu |
|---|---:|
| Catégories | 7 |
| Familles visibles de Design graphique | 2 |
| Subdivisions | 26 |
| Réalisations | 36 |
| Tarifs | 27 |

Les 27 tarifs comprennent les 25 tarifs historiques, Photo beauté à 20 $ et Photo produit à 15 $. Les deux nouveaux tarifs conservent les délais vides/à définir. Les prix sont des brouillons modifiables.

Toutes les lignes du seed sont insérées avec `is_published = false`. Les réalisations conservent leurs slugs et chemins d'images locaux. Les anciennes catégories sont reliées aux nouvelles par six alias : `identite`, `print`, `photo`, `video`, `digital`, `web`. Le slug `edition` est déjà identique et ne nécessite pas d'alias.

## 2. Modifications du code

- `admin.js` : onglets Catégories, Familles visibles et Subdivisions ; formulaires de création/modification ; archivage réversible ; rattachement des réalisations et tarifs aux catégories/subdivisions après disponibilité des colonnes.
- `js/site-pages.js` : lecture des tables du catalogue dynamique publié, regroupement des familles, affichage « Bientôt disponible » quand aucun tarif n'est publié, et retour automatique au catalogue local si les tables ne sont pas disponibles.
- `js/site-pages.js` et `js/catalogue.js` : catalogue local aligné sur les sept catégories, les deux familles de Design graphique, les 26 subdivisions, les 36 réalisations et les 27 tarifs.
- `services.html` et `realisations.html` : styles des familles visibles.
- Anciennes ancres prises en charge : `#identite`, `#print`, `#photo`, `#video`, `#digital`, `#web` ; l'ancien lien `#video--live` est redirigé vers `#live-streaming--live`.

Les slugs deviennent stables après création dans l'administration ; les libellés restent renommables. Cela évite de casser les liens sans mécanisme d'alias de subdivision.

## 3. Sécurité prévue dans le schéma SQL

Le brouillon de schéma comprend :
- clés étrangères avec suppression restrictive ;
- vérification qu'une subdivision appartient à la même catégorie que la réalisation ou le tarif ;
- lecture publique limitée aux catégories/familles/subdivisions publiées et non archivées ;
- mutations réservées aux administrateurs via `private.is_noor_admin()` ;
- archivage réversible ;
- journal d'audit en lecture réservée aux administrateurs, alimenté par des triggers SQL ;
- index sur les relations et tris.

Les fonctions d'autorisation existantes ont été contrôlées en lecture seule : `private.is_noor_admin()` existe, est SECURITY DEFINER, et est exécutable par `authenticated`. Le rôle authentifié a USAGE sur le schéma `private`.

## 4. Contrôles effectués

- Syntaxe JavaScript de `admin.js`, `js/site-pages.js` et `js/catalogue.js` : contrôle de compilation réussi.
- Exécution isolée de la transformation locale : 7 catégories, 26 subdivisions, 36 réalisations et 27 tarifs ; Motion design reste en Vidéographie ; Live streaming est séparé ; les deux familles Design graphique sont visibles.
- Vérification des liens historiques et des valeurs « Bientôt disponible ».
- Inventaire Supabase final en lecture seule : 0 nouvelle table de catalogue, 0 réalisation, 0 tarif, 1 compte administrateur. Aucune donnée de production n'a été modifiée.

## 5. Ce qui reste avant mise en production

1. Faire relire le script SQL et le seed par le propriétaire.
2. Les tester sur un projet Supabase de développement/staging : création des tables, triggers, RLS, grants et seed complet.
3. Tester l'administration dans un vrai navigateur avec un compte admin et un compte authentifié non-admin.
4. Vérifier le rendu public avec des données publiées et le fallback sans tables.
5. Vérifier les anciens liens sur le domaine réellement déployé.
6. Appliquer la migration et le seed en production uniquement après approbation explicite.
7. Publier les éléments progressivement après contrôle des contenus.

**Important :** les scripts `.draft` ne sont pas des migrations numérotées et ne doivent pas être exécutés tels quels en production. Le site conserve son catalogue local tant que la structure dynamique n'est pas installée et publiée.
