# PRD: Historique et rollback des versions de brand_structure

## 1. Introduction / Overview

Aujourd'hui, la table `brand_structures` stocke déjà un champ `version` par client et conserve automatiquement les 3 versions les plus récentes. Cependant, l'agence n'a **aucune interface** pour consulter l'historique ni revenir à une version précédente. En cas d'erreur après publication (texte effacé, mauvaise refonte, régression), la seule option est de réécrire manuellement le contenu.

Cette fonctionnalité ajoute :
- un **auto-versioning** à chaque sauvegarde côté agence (chaque "Enregistrer" crée une nouvelle ligne `brand_structures`)
- un **drawer "Historique"** dans l'éditeur agence permettant de lister, prévisualiser et restaurer une version antérieure
- une **republication atomique** : la version restaurée devient une nouvelle ligne publiée, et le client voit la transition via un court bandeau "Mise à jour en cours".

Le client conserve à tout moment l'accès à la version publiée active — il ne voit jamais un état intermédiaire ni une absence de contenu.

## 2. Goals

- Permettre à l'agence de consulter les **10 dernières versions** d'une `brand_structure` pour un client.
- Permettre la **restauration d'une version antérieure** en un clic, qui crée une nouvelle version publiée (l'historique reste intact).
- Garantir que le client a **toujours accès** à exactement une version publiée, sans interruption de service.
- Afficher au client un **bandeau "Mise à jour en cours"** pendant la fenêtre de bascule pour signaler le changement.
- Conserver un audit minimal : qui a créé la version, qui a restauré quoi, et à partir de quelle version source.

## 3. User Stories

### US-001 : Étendre le schéma `brand_structures` pour le versioning

**Description :** En tant que développeur, j'ai besoin que chaque sauvegarde crée une nouvelle ligne plutôt que de muter la ligne courante, afin de préserver l'historique.

**Acceptance Criteria :**
- [ ] Migration SQL qui ajoute les colonnes `created_by uuid references auth.users(id)`, `restored_from_version integer null`, `is_current boolean not null default false` à `brand_structures`
- [ ] Modifier la contrainte de version : la version `is_current = true` est la version active de l'éditeur agence (au plus une par client)
- [ ] La colonne `status = 'published'` reste la version visible côté client (au plus une par client)
- [ ] Mettre à jour `enforce_brand_structure_version_limit()` pour conserver les **10 versions les plus récentes** par client (et non plus 3), MAIS ne jamais supprimer la version `is_current = true` ni la version `status = 'published'`
- [ ] Backfill : pour chaque client existant, marquer la version la plus récente comme `is_current = true`
- [ ] `npm run typecheck` et `npm run lint` passent
- [ ] La migration s'applique sans erreur sur une base locale neuve

### US-002 : Sauvegarder = créer une nouvelle version

**Description :** En tant qu'agence, quand je clique "Enregistrer" dans l'éditeur, je veux qu'une nouvelle version soit créée dans l'historique, afin de pouvoir y revenir plus tard.

**Acceptance Criteria :**
- [ ] `saveBrandStructure()` dans [app/actions/brand-structure.ts](app/actions/brand-structure.ts) crée une **nouvelle ligne** dans `brand_structures` au lieu de muter la ligne existante
- [ ] La nouvelle ligne reçoit `version = max(version)+1` pour ce client, `is_current = true`, `created_by = auth.uid()`
- [ ] L'ancienne ligne `is_current = true` passe à `is_current = false` (transaction atomique)
- [ ] Si la version précédente était `status = 'published'`, la nouvelle ligne hérite de `status = 'modified'`, sinon `'draft'`
- [ ] La ligne `status = 'published'` reste inchangée (le client continue à voir la version publiée)
- [ ] Les tests existants dans [__tests__/actions/brand-structure.test.ts](__tests__/actions/brand-structure.test.ts) sont mis à jour et passent
- [ ] `npm run typecheck` passe

### US-003 : Publier = promouvoir la version courante

**Description :** En tant qu'agence, quand je clique "Publier", la version courante devient celle visible par le client, et l'ancienne publiée perd son statut.

**Acceptance Criteria :**
- [ ] `publishBrandStructure()` met à jour la ligne `is_current = true` à `status = 'published'`, `published_at = now()`
- [ ] L'ancienne ligne `status = 'published'` (si différente) passe à `status = 'archived'` — nouvelle valeur autorisée dans le check constraint
- [ ] Migration ajoute `'archived'` à la liste autorisée du check constraint de `status`
- [ ] À tout instant, au plus **une ligne** `status = 'published'` existe par client
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill — publier puis vérifier qu'une seule version est marquée publiée en DB

### US-004 : Bouton "Historique" dans le top bar de l'éditeur

**Description :** En tant qu'agence, je veux un bouton "Historique" visible en haut de l'éditeur, afin d'ouvrir un drawer listant les versions précédentes.

**Acceptance Criteria :**
- [ ] Bouton ajouté dans [app/(admin)/clients/[id]/editor/page.tsx](app/(admin)/clients/[id]/editor/page.tsx) à droite du top bar (ou intégré à `EditorPanel`)
- [ ] Variant `secondary` du composant `Btn`, libellé "Historique" avec icône horloge
- [ ] Cliquer ouvre un drawer latéral droit (nouveau composant `VersionHistoryDrawer`)
- [ ] Le drawer se ferme avec la touche Échap ou un clic sur l'overlay
- [ ] Visible uniquement pour `agency_admin` (la page entière l'est déjà)
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill

### US-005 : Drawer Historique — liste des versions

**Description :** En tant qu'agence, je veux voir dans le drawer la liste des 10 dernières versions avec leurs métadonnées, afin de choisir laquelle restaurer.

**Acceptance Criteria :**
- [ ] Drawer affiche une liste verticale ordonnée par `version desc`
- [ ] Chaque ligne montre : numéro de version, date de création (format relatif "il y a 3 jours"), auteur (email ou nom du profil), badge de statut (`Pill` avec `kind` adapté : `default` pour draft, `validated` pour published, `modified` pour modified, `archived` pour archived)
- [ ] La version `is_current = true` est marquée "Version courante" (non cliquable comme cible de restauration)
- [ ] La version `status = 'published'` est marquée "Publiée (visible par le client)"
- [ ] Si une version a `restored_from_version`, indiquer "Restaurée depuis v{N}"
- [ ] Loading state pendant le fetch ; empty state si une seule version existe
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill

### US-006 : Aperçu lecture seule d'une version

**Description :** En tant qu'agence, je veux pouvoir cliquer sur une version pour voir son contenu en lecture seule, afin de confirmer que c'est bien celle que je veux restaurer.

**Acceptance Criteria :**
- [ ] Cliquer sur une ligne ouvre un sous-panneau (ou remplace le contenu du drawer) avec l'aperçu de la version
- [ ] Aperçu = chaque section avec son `section_key` en titre et `content` en dessous (texte simple, lecture seule)
- [ ] Bouton "Retour à la liste" pour revenir à la liste des versions
- [ ] Bouton "Restaurer cette version" en bas du sous-panneau
- [ ] Aucune édition possible depuis l'aperçu
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill

### US-007 : Action serveur `restoreBrandStructureVersion`

**Description :** En tant que développeur, j'ai besoin d'une action serveur qui restaure une version donnée comme nouvelle version courante publiée.

**Acceptance Criteria :**
- [ ] Nouvelle fonction `restoreBrandStructureVersion(structureId: string)` dans [app/actions/brand-structure.ts](app/actions/brand-structure.ts)
- [ ] Vérifie que l'utilisateur est `agency_admin` (réutilise `requireAgencyAdmin`)
- [ ] Charge la version source par `structureId`, refuse si elle n'existe pas ou si elle est déjà `is_current = true`
- [ ] Refuse si le client est archivé (même règle que `publishBrandStructure`)
- [ ] Crée une nouvelle ligne `brand_structures` avec : `version = max(version)+1`, `sections` copié de la source, `is_current = true`, `status = 'published'`, `published_at = now()`, `restored_from_version = source.version`, `created_by = auth.uid()`
- [ ] Dans la même opération : l'ancienne `is_current` passe à `false`, l'ancienne `published` passe à `archived`
- [ ] Idéalement implémenté via une fonction SQL `public.restore_brand_structure_version(uuid)` appelée depuis l'action, pour garantir l'atomicité
- [ ] Retourne `{ success: true, newVersion: number }` ou `{ success: false, error: string }`
- [ ] `revalidatePath` sur `/clients/[id]/editor` et `/clients/[id]` et `/[brand]`
- [ ] Tests unitaires ajoutés à [__tests__/actions/brand-structure.test.ts](__tests__/actions/brand-structure.test.ts) couvrant : succès, version inexistante, version déjà courante, client archivé, utilisateur non admin
- [ ] `npm run typecheck` passe

### US-008 : Confirmation modale avant restauration

**Description :** En tant qu'agence, avant de restaurer une version, je veux une confirmation explicite, afin d'éviter une action accidentelle.

**Acceptance Criteria :**
- [ ] Clic sur "Restaurer cette version" ouvre une modale de confirmation
- [ ] Modale indique : "Restaurer la version {N} du {date} ? Une nouvelle version sera créée et publiée immédiatement. Le client verra le nouveau contenu sous quelques secondes."
- [ ] Boutons "Annuler" (`ghost`) et "Restaurer et publier" (`primary`, couleur `C.red`)
- [ ] État de chargement pendant l'appel serveur (bouton disabled + spinner)
- [ ] En cas de succès : drawer se ferme, page recharge, toast/banner "Version {N} restaurée et publiée"
- [ ] En cas d'erreur : message d'erreur dans la modale, drawer reste ouvert
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill

### US-009 : Bandeau client "Mise à jour en cours"

**Description :** En tant que client, quand l'agence publie une nouvelle version (manuelle ou restauration), je veux voir un bandeau temporaire signalant la mise à jour, afin de ne pas être surpris du changement. Le bandeau doit aussi s'afficher quand je reviens sur le portail après une mise à jour effectuée pendant mon absence (pas seulement en temps réel).

**Acceptance Criteria :**
- [ ] Détection côté client : sur les pages `app/(client)/[brand]/*`, comparer `published_at` (lu depuis la DB côté serveur, passé en prop au composant) à `last_seen_published_at` (localStorage)
- [ ] Si `published_at > last_seen_published_at`, afficher un bandeau en haut : "Votre stratégie a été mise à jour" (icône info, fond `C.panel` léger)
- [ ] Le bandeau s'affiche dans deux scénarios :
  1. **Bascule en direct** : la publication a lieu pendant que l'onglet client est ouvert (détectable au prochain navigation/revalidate)
  2. **Visite suivante** : l'utilisateur revient sur le portail après une publication faite en son absence — tant que `last_seen_published_at < published_at`, le bandeau apparaît
- [ ] Bandeau dismissible (croix) ; le dismiss met à jour `last_seen_published_at = published_at` dans localStorage
- [ ] Si l'utilisateur ne dismiss pas, le bandeau disparaît automatiquement après 10 secondes mais `last_seen_published_at` est tout de même mis à jour (sinon il réapparaîtrait à la prochaine navigation)
- [ ] Implémenté en composant client `'use client'` (`UpdateBanner`) inséré dans le layout `(client)` et recevant `publishedAt` en prop
- [ ] Ne s'affiche pas pour la toute première visite (pas de `last_seen_published_at` ⇒ on l'initialise à `published_at` sans afficher)
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill — couvrir les deux scénarios : (1) onglet ouvert pendant la publication, (2) connexion suivant la publication

### US-010 : RLS et accès — pas de fuite vers le client

**Description :** En tant que développeur sécurité, je veux garantir que les versions non publiées et le champ `created_by` ne sont jamais lisibles par les utilisateurs client.

**Acceptance Criteria :**
- [ ] La policy `brand_structures: client read published` reste : `status = 'published'` (donc ni `draft`, ni `modified`, ni `archived`)
- [ ] Aucune nouvelle policy n'élargit l'accès client à l'historique
- [ ] Test manuel : se connecter comme `client_admin`, exécuter `select * from brand_structures` ⇒ ne retourne qu'une seule ligne (la publiée)
- [ ] `npm run typecheck` passe

## 4. Functional Requirements

- **FR-1 :** Le schéma `brand_structures` ajoute les colonnes `created_by`, `restored_from_version`, `is_current`.
- **FR-2 :** Le check constraint `status` accepte `'draft' | 'published' | 'modified' | 'archived'`.
- **FR-3 :** Chaque appel à `saveBrandStructure` crée une nouvelle ligne (versioning auto à chaque sauvegarde) et bascule `is_current` atomiquement.
- **FR-4 :** Au plus une ligne par client a `is_current = true` ; au plus une ligne par client a `status = 'published'`.
- **FR-5 :** Le système conserve les **10 versions les plus récentes** par client. La purge ne supprime jamais la version courante ni la version publiée.
- **FR-6 :** Un bouton "Historique" dans le top bar de l'éditeur ouvre un drawer latéral droit listant les versions disponibles.
- **FR-7 :** Chaque entrée d'historique affiche : numéro de version, date relative, auteur, statut (pill), marqueur "courante" et/ou "publiée" et/ou "restaurée depuis vX".
- **FR-8 :** Cliquer sur une version ≠ courante affiche son contenu en lecture seule.
- **FR-9 :** Restaurer une version crée une nouvelle ligne `is_current = true`, `status = 'published'`, `restored_from_version = source.version`, et marque l'ancienne publiée comme `archived`.
- **FR-10 :** L'action `restoreBrandStructureVersion` exige une confirmation modale et tourne en transaction atomique (fonction SQL).
- **FR-11 :** Les pages client (`/[brand]/*`) affichent un bandeau dismissible "Votre stratégie a été mise à jour" quand `published_at > last_seen_published_at` (couvre la bascule en direct ET la visite suivant une publication).
- **FR-12 :** Les utilisateurs client n'ont accès qu'à la version `status = 'published'` (RLS inchangée).
- **FR-13 :** Toutes les actions de versioning et restauration enregistrent `created_by = auth.uid()` pour audit.

## 5. Non-Goals (Out of Scope)

- **Pas de diff visuel** entre versions (US-006 propose juste un aperçu lecture seule). Un diff côte-à-côte est explicitement reporté.
- **Pas de snapshots manuels** ("créer un point de restauration sans modifier") — seul l'auto-versioning à la sauvegarde existe.
- **Pas de branches** ou versions parallèles — un seul fil linéaire de versions par client.
- **Pas de notification email** ou push au client lors d'une mise à jour — seulement le bandeau in-app.
- **Pas de configuration par client** du nombre de versions conservées — 10 pour tout le monde.
- **Pas d'historique des `brand_structure_proposals`** — cette fonctionnalité concerne uniquement `brand_structures`.
- **Pas de versioning côté éditeur en temps réel** (genre Google Docs revision history minute par minute) — uniquement à chaque "Enregistrer" explicite.
- **Pas de rollback partiel** (section par section) — restauration globale uniquement.
- **Pas de libellé personnalisé** par version (pas de colonne `label`) — identification par numéro de version, date et auteur uniquement.
- **Pas de table d'audit séparée** (`brand_structure_audit`) — la trace tient dans les colonnes `created_by` + `restored_from_version` + `created_at` de `brand_structures`.

## 6. Design Considerations

- **Drawer Historique :** réutiliser le pattern des panneaux latéraux existants du design system (`design/screens/`) si présent ; sinon créer un drawer 420px de large, fond `C.panel`, qui slide depuis la droite avec overlay sombre semi-transparent.
- **Pills de statut :** mapper aux valeurs existantes de `PillKind` dans [lib/disto.ts](lib/disto.ts) :
  - `draft` → `kind="draft"`
  - `published` → `kind="validated"`
  - `modified` → `kind="modified"`
  - `archived` → `kind="archived"`
- **Composants à réutiliser :** `Btn`, `Card`, `Pill`, `Eyebrow`, `SectionHead` depuis `components/ui/`.
- **Bandeau client :** style cohérent avec les autres bandeaux du portail client (fond `C.panel` léger, texte `C.bone`, icône info, croix de dismiss à droite).
- **Format de date :** relatif en français ("il y a 3 jours", "il y a 2 heures"). Utiliser `Intl.RelativeTimeFormat` natif — pas de dépendance externe.

## 7. Technical Considerations

- **Atomicité de la restauration :** indispensable que la mise à jour de l'ancienne publiée vers `archived` et la création de la nouvelle publiée se fassent dans la même transaction. La fonction SQL `public.restore_brand_structure_version(uuid)` est la voie recommandée plutôt que plusieurs appels REST.
- **Trigger de purge :** `enforce_brand_structure_version_limit()` doit être adapté pour ne JAMAIS supprimer une version `is_current = true` ou `status = 'published'`. Idée : ordonner par `(is_current desc, status='published' desc, version desc)` et garder les 10 premiers. **La limite de 10 est codée en dur** dans la fonction — pas de variable d'environnement.
- **Backfill :** la migration doit marquer `is_current = true` pour la version la plus récente de chaque client existant. Utiliser une sous-requête `update ... from (select distinct on (client_id) ...)`.
- **Cache Next.js :** `revalidatePath` doit cibler `/clients/[id]/editor`, `/clients/[id]`, et `/[brand]` pour que la page client reflète immédiatement la nouvelle publication.
- **Concurrence :** si deux admins agence éditent en parallèle, la dernière sauvegarde gagne (acceptable au MVP). Pas de verrou optimiste pour l'instant.
- **Tests :** étendre [__tests__/actions/brand-structure.test.ts](__tests__/actions/brand-structure.test.ts) pour couvrir : création de nouvelle ligne à `save`, transition `published → archived` à `restore`, refus si version déjà courante, refus si client archivé.

## 8. Success Metrics

- L'agence peut restaurer une version précédente en **moins de 30 secondes** à partir de la page éditeur (ouverture drawer → sélection → aperçu → confirmation → publication).
- **Zéro régression** : le client n'expérimente jamais de page vide ou d'erreur 500 lors d'une bascule de version.
- À tout instant et pour tout client en production : exactement **une ligne** `is_current = true` et au plus **une ligne** `status = 'published'`.
- Aucun ticket support "j'ai perdu mon contenu après une mauvaise modification" sur les 90 jours suivant la mise en prod.

## 9. Open Questions

Aucune — les quatre points en suspens ont été tranchés :
- **Libellé personnalisé par version :** Non. Identification par numéro, date, auteur uniquement.
- **Configuration de la purge :** En dur (10 versions). Pas de variable d'environnement.
- **Audit des restaurations :** Trace en colonnes (`restored_from_version`, `created_by`, `created_at`). Pas de table `brand_structure_audit` séparée.
- **Bandeau client à la visite suivante :** Oui — il doit s'afficher quand l'utilisateur revient après une publication faite en son absence (logique localStorage `last_seen_published_at` documentée dans US-009).
