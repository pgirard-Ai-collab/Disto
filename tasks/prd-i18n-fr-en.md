# PRD: Version anglaise (FR/EN) avec next-intl

## 1. Introduction / Overview

Disto est actuellement 100 % francophone. Toutes les chaînes UI sont écrites en dur dans les composants et les pages. `next-intl@4.9.1` est installé mais jamais configuré. Cette feature ajoute le support anglais (EN) en complément du français (FR), avec un sélecteur permettant à l'utilisateur de basculer librement entre les deux langues. La préférence est conservée dans `localStorage` et la langue initiale est détectée via `navigator.language`.

Objectif : permettre aux utilisateurs anglophones (équipes clientes internationales, partenaires) d'utiliser le portail Disto sans barrière linguistique, sans modifier la structure des URLs ni la stratégie de routing existante.

## 2. Goals

- Activer next-intl 4.x dans Disto avec FR et EN comme locales supportées
- Toggle FR/EN accessible depuis le UserMenu (post-connexion) et depuis les pages d'authentification (pré-connexion)
- Préférence de langue persistée dans `localStorage` sous la clé `disto:lang`
- Détection automatique de la langue initiale via `navigator.language` (fallback FR)
- Aucune modification des URLs existantes (pas de préfixe `/fr/` ou `/en/`)
- Couverture complète de l'UI statique : sidebar, topbar, usermenu, toutes les pages (auth + admin + client portal), labels de statut, messages d'erreur, états vides
- Bascule instantanée sans rechargement de page

## 3. User Stories

### US-001: Installer et configurer next-intl en mode "no routing"
**Description:** En tant que développeur, je veux configurer next-intl sans routing URL pour que la langue soit purement une préférence client persistée localement.

**Acceptance Criteria:**
- [ ] `next.config.ts` enveloppé avec `createNextIntlPlugin('./i18n/request.ts')`
- [ ] Fichier `i18n/request.ts` créé, retourne `{ locale: 'fr', messages: frJson }` par défaut
- [ ] Aucun fichier `middleware.ts` créé
- [ ] Aucun segment `[locale]` ajouté dans `app/`
- [ ] `npm run typecheck` passe
- [ ] `npm run lint` passe

### US-002: Créer les catalogues de traduction FR et EN
**Description:** En tant que développeur, je veux deux fichiers JSON de traduction avec une structure de namespaces cohérente.

**Acceptance Criteria:**
- [ ] Fichier `messages/fr.json` créé contenant **toutes** les chaînes françaises actuelles
- [ ] Fichier `messages/en.json` créé avec exactement les mêmes clés (structure miroir)
- [ ] Namespaces utilisés : `common`, `status`, `auth.login`, `auth.forgot`, `auth.setPassword`, `auth.updatePassword`, `sidebar`, `topbar`, `userMenu`, `language`, `admin.clients`, `admin.clientDetail`, `admin.editor`, `admin.access`, `admin.import`, `admin.systemPrompt`, `client.dashboard`, `client.strategie`, `client.chat`, `client.export`, `client.updateBanner`, `errors`
- [ ] Vérification que chaque clé de `fr.json` existe dans `en.json` (et vice-versa)

### US-003: Créer le I18nProvider client avec persistance localStorage
**Description:** En tant que développeur, je veux un provider client qui détecte la langue, la persiste, et expose un hook de bascule.

**Acceptance Criteria:**
- [ ] Composant `components/i18n/I18nProvider.tsx` créé (`'use client'`)
- [ ] Au premier mount : lecture de `localStorage.getItem('disto:lang')`, fallback sur `navigator.language` (FR si commence par `fr`, sinon EN), fallback final FR
- [ ] Try-catch autour de l'accès à `localStorage` (même pattern que `UpdateBanner.tsx`)
- [ ] Le provider enveloppe `NextIntlClientProvider` avec `locale` et `messages` dynamiques
- [ ] `en.json` chargé en lazy-import (pour ne pas alourdir le bundle initial des utilisateurs FR)
- [ ] Met à jour `document.documentElement.lang` à chaque changement
- [ ] Hook `useLocalePreference()` exposant `{ locale: 'fr'|'en', setLocale: (l) => void }` via React Context
- [ ] `npm run typecheck` passe

### US-004: Wrapper le layout root avec I18nProvider et script anti-flash
**Description:** En tant que développeur, je veux que toute l'app soit enveloppée dans le provider, et qu'un script inline mette à jour `<html lang>` avant l'hydratation pour éviter un flash.

**Acceptance Criteria:**
- [ ] `app/layout.tsx` reste un Server Component
- [ ] `<html lang="fr">` conservé comme valeur SSR par défaut, avec `suppressHydrationWarning`
- [ ] Un `<script>` inline dans `<head>` lit `localStorage.getItem('disto:lang')` et set `document.documentElement.lang` avant React mount
- [ ] `{children}` enveloppé dans `<I18nProvider>`
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill : `<html lang>` reflète la préférence stockée dès la première frame

### US-005: Convertir STATUS_LABEL en clés i18n
**Description:** En tant que développeur, je veux que `STATUS_LABEL` (dict statique français) soit remplacé par des clés de traduction `status.*`.

**Acceptance Criteria:**
- [ ] `STATUS_LABEL` supprimé de `lib/disto.ts`
- [ ] `STATUS_KEYS` exporté comme `as const` array depuis `lib/disto.ts`
- [ ] Tous les callers de `STATUS_LABEL` migrés vers `t(\`status.\${kind}\`)` (composants client) ou via les thin wrappers (RSC)
- [ ] Clés `status.active`, `status.invited`, `status.disabled`, `status.draft`, `status.archived`, `status.auto`, `status.validated`, `status.modified`, `status.default` présentes dans `fr.json` et `en.json`
- [ ] `npm run typecheck` passe

### US-006: Traduire UserMenu et y ajouter le toggle FR/EN
**Description:** En tant qu'utilisateur connecté, je veux pouvoir changer la langue depuis le menu de mon profil.

**Acceptance Criteria:**
- [ ] `components/layout/UserMenu.tsx` utilise `useTranslations` pour tous les libellés visibles (rôle, nom de fallback, aria-labels, bouton de déconnexion)
- [ ] Nouveau composant `components/i18n/LanguageToggleMenu.tsx` créé (`'use client'`)
- [ ] Le toggle affiche deux options "Français" / "English" avec une indication claire de la langue active
- [ ] Inséré dans le dropdown UserMenu **au-dessus** de la rangée "Déconnexion"
- [ ] Style cohérent avec les autres rangées du menu (tokens C.*, inline styles)
- [ ] Cliquer sur une option change immédiatement la langue de toute l'UI sans recharger
- [ ] La sélection est écrite dans `localStorage` sous `disto:lang`
- [ ] Verify in browser using dev-browser skill : ouvrir menu → toggle → toutes les chaînes basculent

### US-007: Traduire Sidebar
**Description:** En tant qu'utilisateur, je veux que tous les libellés de la sidebar (navigation, sections, footer) soient traduits.

**Acceptance Criteria:**
- [ ] `components/layout/Sidebar.tsx` utilise `useTranslations('sidebar')`
- [ ] Tous les items de `agencyItems` et `clientItems` traduits : Console agence, Portail marque, Clients, Import Disto, Éditeur de structure, Accès, System Prompt, Tableau de bord, Stratégie, Interroger la marque, Export
- [ ] Eyebrows "Agence" et "Marque" traduits
- [ ] Footer "v 1.4.0 · Signal clair" traduit (texte signal)
- [ ] aria-label "Menu" traduit
- [ ] `npm run typecheck` passe
- [ ] Verify in browser using dev-browser skill

### US-008: Traduire TopBar via wrapper I18nTopBar
**Description:** En tant que développeur, je veux que les pages RSC puissent passer des **clés** de breadcrumb à TopBar plutôt que des strings, sans casser les pages existantes.

**Acceptance Criteria:**
- [ ] Nouveau composant `components/i18n/I18nTopBar.tsx` (`'use client'`) qui accepte `crumbKeys: string[]`, résout via `useTranslations`, et délègue à `TopBar`
- [ ] `TopBar` lui-même reste inchangé (accepte toujours `crumbs: string[]`)
- [ ] Toutes les pages RSC qui utilisent `TopBar` directement migrent vers `I18nTopBar` avec `crumbKeys`
- [ ] `npm run typecheck` passe

### US-009: Traduire pages auth + ajouter LanguageToggleAuth
**Description:** En tant qu'utilisateur non connecté, je veux pouvoir choisir ma langue dès l'écran de connexion.

**Acceptance Criteria:**
- [ ] Pages traduites : `app/(auth)/login/page.tsx`, `forgot-password/page.tsx`, `set-password/page.tsx`, `update-password/page.tsx`
- [ ] Tous les libellés, placeholders, boutons, et messages d'erreur passent par `useTranslations('auth.*')`
- [ ] `components/layout/AuthBrandPanel.tsx` traduit (eyebrow, heroLine1, heroLine2, tagline)
- [ ] Nouveau composant `components/i18n/LanguageToggleAuth.tsx` (`'use client'`) — petit toggle FR/EN positionné en haut à droite
- [ ] `LanguageToggleAuth` ajouté sur les 4 pages auth
- [ ] Le toggle modifie immédiatement les chaînes visibles et persiste dans `localStorage`
- [ ] Verify in browser using dev-browser skill : login en FR → toggle EN → tout bascule → refresh → reste en EN

### US-010: Traduire portail admin (pages clients)
**Description:** En tant qu'admin d'agence, je veux que toutes les pages de gestion clients soient traduites.

**Acceptance Criteria:**
- [ ] `app/(admin)/clients/page.tsx` traduit via `I18nTopBar` + composants enfants
- [ ] `ClientsTable.tsx` traduit : en-têtes de colonnes, états vides, libellés de statut (`status.*`), boutons d'action
- [ ] `NewClientModal.tsx` traduit : labels de formulaire, boutons, messages d'erreur
- [ ] Pages détails clients traduites : `[id]/page.tsx`, `access/page.tsx`, `editor/page.tsx`, `import/page.tsx`, `system-prompt/page.tsx`
- [ ] Composants client associés traduits : `EditorPanel.tsx`, `VersionHistoryDrawer.tsx`, `InviteForm.tsx`, `DisableUserBtn.tsx`, `ImportPanel.tsx`
- [ ] Wrapper `I18nSectionHead` créé pour passer des clés aux SectionHead depuis RSC
- [ ] `npm run typecheck` + `npm run lint` passent
- [ ] Verify in browser using dev-browser skill : naviguer chaque page en FR puis EN

### US-011: Traduire portail client (brand portal)
**Description:** En tant qu'utilisateur client (marque), je veux que toutes mes pages soient traduites.

**Acceptance Criteria:**
- [ ] `app/(client)/[brand]/page.tsx` (dashboard) traduit
- [ ] `app/(client)/[brand]/chat/page.tsx` + `ChatInterface` traduits
- [ ] `app/(client)/[brand]/strategie/page.tsx` + `StrategieExplorer` traduits
- [ ] `app/(client)/[brand]/export/page.tsx` + `ExportPanel` traduits
- [ ] `UpdateBanner.tsx` traduit (message et bouton fermer)
- [ ] Les sections d'identité de marque (Identité, Mission, Archétype, Ton) traduites comme labels (les **contenus** des sections restent dans la langue des données, c'est-à-dire FR pour les mocks)
- [ ] `npm run typecheck` + `npm run lint` passent
- [ ] Verify in browser using dev-browser skill : ouvrir un brand portal en FR puis EN

### US-012: Traduire page racine et fallback
**Description:** En tant que développeur, je veux qu'aucune chaîne hardcodée française ne subsiste dans les pages restantes.

**Acceptance Criteria:**
- [ ] `app/page.tsx` (redirection) sans chaînes UI ou traduite si nécessaire
- [ ] `not-found.tsx`, `error.tsx` (si existants) traduits
- [ ] Audit final : grep des chaînes accentuées (`é`, `è`, `à`, `ç`, etc.) dans `app/` et `components/` ne retourne que des clés JSON, commentaires, ou contenus mockés intentionnellement non traduits
- [ ] `npm run typecheck` + `npm run lint` passent

## 4. Functional Requirements

- **FR-1**: Le système doit supporter exactement deux locales : `fr` (par défaut) et `en`.
- **FR-2**: Au premier chargement, si `localStorage.getItem('disto:lang')` existe et vaut `fr` ou `en`, l'utiliser comme locale active.
- **FR-3**: Si aucune préférence n'est stockée, lire `navigator.language` : si la valeur commence par `fr`, utiliser `fr` ; sinon utiliser `en`.
- **FR-4**: Toute sélection via un toggle doit (a) écrire la nouvelle valeur dans `localStorage` sous `disto:lang`, (b) re-rendre l'app dans la nouvelle langue sans recharger la page, (c) mettre à jour `document.documentElement.lang`.
- **FR-5**: Si l'accès à `localStorage` échoue (mode privé, exception), capturer l'erreur silencieusement et continuer avec la langue détectée — pas de crash.
- **FR-6**: Le toggle dans le UserMenu doit afficher les deux options "Français" et "English" avec une indication visuelle claire de la langue actuelle (ex: pastille, couleur, gras).
- **FR-7**: Le toggle sur les pages auth doit être visible en permanence (sans interaction préalable) et positionné en haut à droite.
- **FR-8**: Aucune URL ne doit être modifiée par un changement de langue — toutes les routes restent identiques.
- **FR-9**: Tous les libellés de statut (anciennement `STATUS_LABEL` dans `lib/disto.ts`) doivent passer par des clés `status.*`.
- **FR-10**: Le bundle JavaScript initial chargé pour un utilisateur FR ne doit pas contenir le catalogue EN (lazy-loaded à la bascule).
- **FR-11**: La page doit rester SEO-correcte avec `<html lang>` reflétant la langue active dès la première frame (via script inline anti-flash).
- **FR-12**: Le serveur rend toujours en FR par défaut (pas de logique server-side pour détecter la langue) — la bascule est purement client.

## 5. Non-Goals (Out of Scope)

- Pas de routing URL par locale (`/fr/...`, `/en/...`) — la langue est purement une préférence client
- Pas de middleware Next.js pour la gestion de la locale
- Pas de cookie de locale (que `localStorage` uniquement)
- Pas de traduction des **données mockées** (noms de marques, contenus de stratégie, descriptions) — ces données restent en français
- Pas de support pour d'autres locales (es, pt, etc.) — uniquement FR + EN
- Pas de détection serveur via `Accept-Language` header
- Pas de gestion de RTL (les deux langues sont LTR)
- Pas de pluralisation complexe ou ICU MessageFormat avancé pour cette V1 (interpolations simples uniquement)
- Pas de traduction des emails transactionnels ou des notifications externes
- Pas de traduction des messages d'erreur Supabase bruts (ils sont mappés vers des messages génériques traduits)
- Pas de réinitialisation de la préférence à la déconnexion (le choix persiste entre sessions)

## 6. Design Considerations

### Placement UI
- **UserMenu (post-login)** : le toggle s'insère dans le dropdown existant, au-dessus de la rangée "Déconnexion". Style cohérent avec les autres rangées (inline styles, tokens `C.*`).
- **Pages auth (pré-login)** : petit toggle pill flottant en position absolue (haut-droite, ~16-24px de marge). Visuellement discret mais accessible. Aucune sidebar/topbar sur ces pages.

### Composants réutilisables
- `Btn` (`components/ui/Btn.tsx`) avec `variant="ghost"` ou `"ghostDim"` pour les boutons FR/EN
- `Pill` ou simple texte avec `C.red` comme accent pour indiquer la langue active
- Pattern try-catch de `UpdateBanner.tsx` pour l'accès `localStorage`
- Système de tokens `C.*` de `lib/disto.ts` exclusivement (pas de hex en dur)

### Cohérence visuelle
- Le toggle ne doit jamais bouger ou changer de taille entre les deux états
- L'animation de bascule doit être instantanée (pas de transition longue)
- Les chaînes traduites doivent tenir dans le même espace UI que les originales (vérifier les labels longs comme "Éditeur de structure" → "Structure editor")

## 7. Technical Considerations

### Architecture next-intl "no routing"
- next-intl 4.x supporte l'usage sans routing URL via `NextIntlClientProvider` + un `getRequestConfig` minimal qui retourne toujours la même locale par défaut (`fr`)
- Le serveur rend en FR, le client swap après hydratation — un bref flash visuel des chaînes (<1 frame sur app hydratée) est acceptable pour cette V1
- Le `<html lang>` est mis à jour par un script inline dans `<head>` AVANT React mount pour SEO et accessibilité

### Composants Server Components (RSC)
- Les pages async qui utilisent `await params` ne peuvent pas appeler `useTranslations`
- Solution : deux thin wrappers `'use client'` (`I18nTopBar`, `I18nSectionHead`) qui acceptent des **clés** au lieu de strings et résolvent côté client
- Tous les autres composants déjà `'use client'` (Sidebar, UserMenu, ClientsTable, panels, formulaires, modales) consomment directement `useTranslations`

### Fichiers nouveaux
- `messages/fr.json`, `messages/en.json`
- `i18n/request.ts`
- `components/i18n/I18nProvider.tsx`
- `components/i18n/useLocalePreference.ts`
- `components/i18n/LanguageToggleMenu.tsx`
- `components/i18n/LanguageToggleAuth.tsx`
- `components/i18n/I18nTopBar.tsx`
- `components/i18n/I18nSectionHead.tsx`

### Fichiers critiques modifiés
- [app/layout.tsx](app/layout.tsx) — wrap avec I18nProvider + script inline
- [next.config.ts](next.config.ts) — `createNextIntlPlugin('./i18n/request.ts')`
- [lib/disto.ts](lib/disto.ts) — supprimer `STATUS_LABEL`, garder `STATUS_KEYS`
- [components/layout/UserMenu.tsx](components/layout/UserMenu.tsx)
- [components/layout/Sidebar.tsx](components/layout/Sidebar.tsx)
- [components/layout/AuthBrandPanel.tsx](components/layout/AuthBrandPanel.tsx)
- Toutes les pages dans [app/(auth)/](app/(auth)/), [app/(admin)/](app/(admin)/), [app/(client)/](app/(client)/)

### Dépendances et build
- Aucune nouvelle dépendance npm — `next-intl@4.9.1` déjà présente
- `next.config.ts` doit être enveloppé avec `createNextIntlPlugin` (la signature change légèrement avec Next 16 — vérifier `node_modules/next-intl/dist/...`)
- Tailwind v4 / globals.css inchangés

### Performance
- `en.json` lazy-loaded via dynamic import (économise ~quelques Ko sur le bundle initial des utilisateurs FR, qui sont la majorité actuelle)
- Pas de re-render en cascade au toggle — React Context unique pour la locale

## 8. Success Metrics

- Couverture : 100 % des chaînes UI visibles avant cette feature sont maintenant traduites en EN (zéro string hardcodée française subsiste dans `app/` et `components/`, hormis dans les fichiers de messages JSON et les données mockées)
- Persistance : un utilisateur qui choisit EN, ferme l'onglet, revient le lendemain → reste en EN
- Détection : un utilisateur avec `navigator.language = 'en-US'` qui n'a jamais visité Disto voit l'UI en EN au premier chargement
- Performance : pas de régression mesurable sur le First Contentful Paint (le script anti-flash est ≤ 200 bytes inline)
- Robustesse : aucun crash en mode privé / `localStorage` désactivé
- Maintenabilité : ajouter une nouvelle chaîne dans le code = un seul endroit à modifier dans `fr.json` + `en.json`, jamais inline

## 9. Open Questions

- Faut-il ajouter un raccourci clavier pour basculer la langue (ex: `Alt+L`) ? Probablement non pour la V1.
- Le formatage des dates/nombres (heures de "Dernière mise à jour", etc.) doit-il aussi suivre la locale (`Intl.DateTimeFormat`) ou rester en format français ? Recommandation : suivre la locale pour la cohérence, mais à confirmer.
- Pour la traduction EN initiale, qui valide la qualité linguistique ? (Recommandation : faire passer le `en.json` à un relecteur humain anglophone après la première version).
- Faut-il un fallback affichage de la clé si une traduction manque (mode dev) ou un fallback vers FR ? Recommandation : fallback FR avec un warning console en dev.
- Les noms propres et termes métier ("Disto", "Signal clair", "betula", noms de marques mockées) restent-ils non traduits par défaut ? Recommandation : oui, ce sont des marques.
