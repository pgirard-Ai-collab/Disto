# PRD : Portail Admin Agence — Disto

## Introduction

Le Portail Admin Agence est l'interface réservée à l'équipe de l'agence betula pour gérer ses clients, importer et structurer les livrables Disto (via LLM), éditer la stratégie de marque, et contrôler les accès des utilisateurs clients. C'est le cœur opérationnel de la plateforme : toute donnée publiée dans le Portail Client transite par ici.

---

## Objectifs

- Permettre à l'agence de créer et gérer ses clients depuis une interface centralisée
- Automatiser la structuration des livrables Disto PDF via Claude API
- Offrir un éditeur de structure de marque avec sauvegarde automatique et publication en un clic
- Contrôler finement les accès des utilisateurs clients par marque et par rôle

---

## Module 6.2.A — Gestion des clients

### US-DISTO-01 : Voir la liste des clients

**Description :** En tant qu'administrateur agence, je veux voir la liste de tous mes clients avec leur statut pour avoir une vue d'ensemble de mes mandats.

**Acceptance Criteria :**
- [ ] La page `/clients` affiche un tableau listant tous les clients (colonnes : Nom organisation, Nom marque, Statut, Dernière MAJ)
- [ ] Les statuts possibles sont : Brouillon, Actif, Archivé — affichés avec un `Pill` coloré
- [ ] Un filtre par statut permet d'afficher uniquement Brouillon / Actif / Archivé / Tous
- [ ] Les clients archivés apparaissent dans la liste (pas masqués par défaut), distingués visuellement
- [ ] Un bouton « + Nouveau client » est visible en haut à droite
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-DISTO-02 : Créer un nouveau client

**Description :** En tant qu'administrateur agence, je veux créer un nouveau client en renseignant les informations de base pour démarrer un mandat.

**Acceptance Criteria :**
- [ ] Un formulaire de création (modal ou page dédiée) expose les champs : Nom organisation (requis), Nom marque (requis), Slug URL (auto-généré depuis le nom de marque, éditable manuellement), Logo (optionnel, PNG/SVG max 2MB), Email(s) admin client (requis, min 1, possibilité d'en ajouter plusieurs)
- [ ] Le slug est auto-généré en minuscules sans espaces ni accents (ex. "Maison Lefèvre" → `maison-lefevre`) dès que le nom de marque est saisi
- [ ] Le slug peut être modifié manuellement avant soumission
- [ ] Le statut initial est automatiquement « Brouillon »
- [ ] La soumission crée l'enregistrement dans Supabase (table `clients`) et redirige vers la page du client
- [ ] Validation côté client : champs requis, format email, unicité du slug (vérification async)
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-DISTO-03 : Archiver un client

**Description :** En tant qu'administrateur agence, je veux archiver un client sans supprimer ses données pour maintenir l'historique des mandats.

**Acceptance Criteria :**
- [ ] Un bouton ou menu contextuel « Archiver » est accessible depuis la liste et la page du client
- [ ] Une confirmation est demandée avant archivage (dialog ou confirm inline)
- [ ] L'archivage met à jour le statut en `archived` dans Supabase — aucune donnée n'est supprimée
- [ ] Le client archivé reste visible dans la liste avec le filtre « Tous » ou « Archivé »
- [ ] Un client archivé ne peut pas être publié tant qu'il n'est pas réactivé
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Module 6.2.B — Import & ingestion du livrable Disto

### US-DISTO-04 : Importer un PDF Disto

**Description :** En tant qu'administrateur agence, je veux importer le PDF du livrable Disto d'un client pour déclencher la structuration automatique de la stratégie de marque.

**Acceptance Criteria :**
- [ ] Une zone d'upload (drag & drop + sélection fichier) est disponible sur la page du client
- [ ] Seuls les fichiers PDF sont acceptés (validation MIME + extension)
- [ ] La taille maximale est 50 MB — un message d'erreur clair s'affiche si dépassée
- [ ] Le fichier est uploadé dans Supabase Storage dans un bucket dédié (ex. `disto-deliverables/{client_slug}/`)
- [ ] Une fois uploadé, le pipeline d'ingestion se déclenche automatiquement (voir US-DISTO-05)
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-DISTO-05 : Suivre la progression de l'ingestion en temps réel

**Description :** En tant qu'administrateur agence, je veux voir la progression de l'ingestion en temps réel pour savoir où en est le traitement.

**Acceptance Criteria :**
- [ ] Au moins 5 étapes sont affichées visuellement : Upload → Validation → Extraction texte → Structuration LLM → Prêt pour révision
- [ ] Chaque étape affiche un état : En attente / En cours / Terminé / Erreur
- [ ] L'état est mis à jour en temps réel via Supabase Realtime (subscription sur la colonne `ingestion_status`)
- [ ] En cas d'erreur à une étape, un message explicite est affiché et l'utilisateur peut relancer
- [ ] La structure générée s'affiche automatiquement dans l'éditeur une fois l'étape « Structuration LLM » terminée
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-DISTO-06 : Re-importer un livrable pour une marque existante

**Description :** En tant qu'administrateur agence, je veux pouvoir re-importer un nouveau Disto pour une marque existante et choisir de remplacer ou de versionner la structure précédente.

**Acceptance Criteria :**
- [ ] Si une structure de marque existe déjà, un dialog propose deux options : « Remplacer la version actuelle » ou « Créer une nouvelle version »
- [ ] En mode « Versionnement », l'ancienne structure est conservée avec un timestamp et reste consultable
- [ ] En mode « Remplacement », l'ancienne structure est écrasée (mais le fichier PDF original reste dans Storage)
- [ ] La version active est toujours celle publiée dans le Portail Client
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Module 6.2.C — Éditeur de structure de marque

### US-DISTO-07 : Éditer les sections de la structure de marque

**Description :** En tant qu'administrateur agence, je veux éditer chaque section de la structure générée afin de corriger ou d'enrichir le contenu avant publication.

**Acceptance Criteria :**
- [ ] L'éditeur présente toutes les sections dans des panneaux distincts : `brand_identity`, `mission`, `brand_intention`, `archetype`, `value_proposition`, `positioning`, `tone_of_voice`, `personas`, `key_messages`, `manifesto`, `competitive_context`, `brand_values`, `do_dont`
- [ ] Chaque section dispose d'un éditeur markdown avec prévisualisation (react-md-editor ou équivalent léger)
- [ ] Les modifications sont sauvegardées automatiquement (autosave debounced 1,5s) dans Supabase
- [ ] Un indicateur visuel de statut est visible en permanence : `Brouillon` / `Publié` / `Modifié depuis publication`
- [ ] Le bouton « Sauvegarder » force une sauvegarde immédiate
- [ ] Le bouton « Publier » est distinct et déclenche la publication (voir US-DISTO-09)
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-DISTO-08 : Définir les mots-clés interdits et phrases types

**Description :** En tant qu'administrateur agence, je veux définir des mots-clés interdits (« don't say ») et des phrases types (« always say ») pour enrichir le system prompt généré.

**Acceptance Criteria :**
- [ ] Une section dédiée « Voix de marque » dans l'éditeur expose deux champs : « Toujours dire » (always say) et « Ne jamais dire » (don't say)
- [ ] Chaque champ accepte une liste de termes ou phrases (un par ligne ou tag input)
- [ ] Ces données sont sauvegardées dans Supabase et intégrées dans le system prompt du Portail Client
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-DISTO-09 : Publier la structure validée dans le Portail Client

**Description :** En tant qu'administrateur agence, je veux publier la structure validée dans le Portail Client d'un seul clic.

**Acceptance Criteria :**
- [ ] Le bouton « Publier » est toujours visible dans l'éditeur
- [ ] Un clic déclenche une confirmation (dialog) puis met à jour le champ `published_at` et `status = 'active'` dans Supabase
- [ ] Après publication, l'indicateur de statut passe à `Publié`
- [ ] Si des modifications non sauvegardées existent, une alerte prévient avant publication
- [ ] Le Portail Client reflète immédiatement les nouvelles données publiées
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Module 6.2.D — Gestion des accès clients

### US-DISTO-10 : Inviter des utilisateurs clients par email

**Description :** En tant qu'administrateur agence, je veux inviter un ou plusieurs utilisateurs clients par email en leur attribuant un rôle pour contrôler leur niveau d'accès.

**Acceptance Criteria :**
- [ ] Un formulaire d'invitation est accessible depuis la page de chaque client (section « Accès »)
- [ ] Les champs requis sont : Email (requis), Rôle (Admin Client ou Lecteur)
- [ ] L'invitation est envoyée via `supabase.auth.admin.inviteUserByEmail()` avec `redirectTo` pointant vers le Portail Client de la marque concernée (ex. `/[brand]`)
- [ ] L'utilisateur invité apparaît immédiatement dans la liste avec le statut `Invité`
- [ ] Plusieurs invitations peuvent être envoyées successivement sans recharger la page
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-DISTO-11 : Gérer la liste des utilisateurs par marque

**Description :** En tant qu'administrateur agence, je veux voir la liste des utilisateurs actifs pour chaque marque et révoquer un accès si nécessaire.

**Acceptance Criteria :**
- [ ] La page du client affiche un tableau des utilisateurs : Email, Rôle, Statut (Invité / Actif / Désactivé), Date d'invitation
- [ ] Un bouton « Révoquer » est disponible par ligne — une confirmation est demandée
- [ ] La révocation désactive l'utilisateur dans Supabase Auth (`auth.admin.updateUserById` avec `ban_duration: 'none'` ou suppression selon politique)
- [ ] Le statut se met à jour à `Désactivé` immédiatement dans l'UI
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Functional Requirements

- **FR-1 :** La table `clients` doit contenir : `id`, `org_name`, `brand_name`, `slug` (unique), `logo_url`, `status` (`draft | active | archived`), `created_at`, `updated_at`
- **FR-2 :** La table `brand_structures` doit contenir une colonne JSONB `sections` avec les 13 sections de marque, plus `status` (`draft | published | modified`), `published_at`, `version`, `client_id` (FK)
- **FR-3 :** La table `client_users` doit contenir : `id`, `client_id` (FK), `user_id` (FK vers `auth.users`), `role` (`admin | reader`), `status` (`invited | active | disabled`), `invited_at`
- **FR-4 :** Les fichiers PDF uploadés sont stockés dans Supabase Storage avec des URL signées (accès non public)
- **FR-5 :** Le pipeline d'ingestion appelle Claude API (claude-sonnet-4-6 ou supérieur) avec le texte extrait du PDF et un prompt système structurant la réponse en JSON conforme aux 13 sections
- **FR-6 :** L'état d'avancement de l'ingestion est persisté dans une table `ingestion_jobs` dédiée (colonnes : `id`, `client_id`, `status`, `steps` JSONB, `error`, `created_at`). Le pipeline tourne dans une Supabase Edge Function déclenchée par le Route Handler Next.js.
- **FR-7 :** L'autosave de l'éditeur utilise un debounce de 1500ms et appelle Supabase uniquement si le contenu a réellement changé
- **FR-8 :** Les Row Level Security (RLS) Supabase doivent être configurés : seuls les admins agence peuvent écrire ; les utilisateurs clients ne lisent que leur propre marque publiée

---

## Non-Goals (Hors périmètre)

- Portail Client (Brand Portal) — couvert séparément
- Notifications par email autres que l'invitation initiale (pas d'alertes de publication, pas de rappels)
- Gestion des rôles côté agence (tous les membres agence ont les mêmes droits pour l'instant)
- Versionnement de l'historique d'édition section par section (seules les versions d'ingestion complètes sont versionnées)
- Intégration avec des outils tiers (Notion, Google Drive, etc.)
- Application mobile

---

## Design Considerations

- Utiliser le template de page authentifiée de CLAUDE.md : `portal-layout` + `Sidebar variant="agency"` + `TopBar theme="light"`
- Les statuts clients utilisent le composant `Pill` avec les `PillKind` existants : `draft`, `active`, `archived`
- Les couleurs et tokens doivent venir exclusivement de `C.*` dans `lib/disto.ts` — aucun hex inline
- L'éditeur de structure est une page splitée (`.panel-split`) : nav des sections à gauche (`.inner-nav`), éditeur à droite
- Le pipeline d'ingestion peut s'inspirer de la maquette `.grid-pipeline` (4 étapes) de `globals.css`
- Les maquettes logiques du document source servent de référence visuelle

---

## Technical Considerations

- **Claude API :** Utiliser `claude-sonnet-4-6`. Activer le prompt caching sur le system prompt d'extraction (le prompt ne change pas entre les appels). Streamer la réponse pour mettre à jour `ingestion_status` au fil de l'exécution.
- **Extraction PDF :** `pdf-parse` extrait le texte. Si < 500 caractères extraits (PDF scanné), basculer sur l'API Files d'Anthropic pour envoyer le PDF en vision à Claude. Tout le traitement se fait dans la Supabase Edge Function — jamais côté client.
- **Supabase Realtime :** Souscrire à la table `ingestion_jobs` pour mettre à jour le stepper sans polling.
- **next-intl :** Non utilisé pour l'instant — toutes les chaînes restent en français hardcodé.
- **RLS :** À configurer dès la création des tables. Ne pas contourner avec `service_role` côté client.
- **Autosave :** Implémenter avec `useRef` + `setTimeout` pour éviter les re-renders inutiles.

---

## Success Metrics

- Un nouveau client peut être créé et son PDF importé en moins de 3 minutes
- La structuration LLM d'un PDF de 50 pages s'exécute en moins de 60 secondes
- Zéro donnée client accessible à un autre client (RLS validé)
- L'administrateur peut publier une structure dans le Portail Client en moins de 2 clics depuis l'éditeur

---

## Decisions

- **Versionnement :** Conserver les **3 dernières versions** par client. Un trigger Supabase supprime automatiquement la plus ancienne lors de la création d'une 4e version.
- **Extraction PDF scanné :** `pdf-parse` extrait le texte d'abord. Si le résultat est trop court (< 500 caractères), on bascule sur l'**API Files d'Anthropic** pour envoyer le PDF directement à Claude vision — meilleure qualité qu'un OCR local, sans dépendance supplémentaire.
- **Rôles agence :** Pas de rôle Super Admin — tous les membres agence ont les mêmes droits.
- **Pipeline d'ingestion :** **Supabase Edge Function** pour éviter le timeout Vercel 60s. Le Route Handler Next.js gère uniquement le déclenchement (`POST`) et le frontend lit le statut via Supabase Realtime.
- **Révocation :** La révocation marque le statut `disabled` en DB immédiatement, mais la session reste active jusqu'à l'**expiration naturelle du JWT**. Pas de liste noire de tokens nécessaire.