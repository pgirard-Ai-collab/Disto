# PRD: Authentification

## Introduction

Système d'authentification sécurisé à niveaux multiples contrôlant l'accès aux deux portails de l'application Disto. Le POC implémente une authentification par email/mot de passe couplée à un flux d'invitation par lien, avec gestion des rôles stockée en base de données. Après connexion, chaque utilisateur est redirigé vers le portail correspondant à son rôle.

## Goals

- Permettre à un administrateur agence de se connecter et d'accéder au Portail Disto (admin)
- Permettre à un client de se connecter et d'accéder uniquement à l'espace de sa marque
- Gérer trois rôles : `agency_admin`, `client_admin`, `client_reader`
- Envoyer des invitations par email via Supabase Auth (invite user API)
- Permettre la réinitialisation de mot de passe par email
- Permettre à un admin agence de désactiver un compte client via Supabase Auth (ban)

## User Stories

### US-AUTH-01 : Connexion administrateur agence
**Description :** En tant qu'administrateur de l'agence, je veux me connecter avec mon email et mon mot de passe pour accéder au Portail Disto.

**Acceptance Criteria :**
- [ ] La page `/login` affiche un formulaire email + mot de passe
- [ ] Après connexion réussie, l'utilisateur avec le rôle `agency_admin` est redirigé vers `/clients`
- [ ] Un message d'erreur clair s'affiche si les identifiants sont invalides
- [ ] Un message d'erreur clair s'affiche si le compte est désactivé (banni)
- [ ] Typecheck/lint passe
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-AUTH-02 : Connexion client via lien d'invitation
**Description :** En tant que client, je veux cliquer sur un lien d'invitation reçu par email pour définir mon mot de passe et accéder à l'espace de ma marque.

**Acceptance Criteria :**
- [ ] Le lien d'invitation Supabase redirige vers une page `/set-password` (ou équivalent Supabase)
- [ ] L'utilisateur peut définir son mot de passe depuis cette page
- [ ] Après définition du mot de passe, l'utilisateur est redirigé vers `/{brand}` (son portail client)
- [ ] Si le lien est expiré ou déjà utilisé, un message d'erreur explicite s'affiche
- [ ] Typecheck/lint passe
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-AUTH-03 : Connexion client avec identifiants existants
**Description :** En tant que client ayant déjà défini son mot de passe, je veux me connecter avec mon email et mon mot de passe pour accéder à l'espace de ma marque.

**Acceptance Criteria :**
- [ ] Après connexion réussie, un utilisateur avec le rôle `client_admin` ou `client_reader` est redirigé vers `/{brand}` correspondant à son profil
- [ ] Le `brand` slug est lu depuis la table `profiles` en base de données
- [ ] Un message d'erreur clair s'affiche si les identifiants sont invalides
- [ ] Typecheck/lint passe
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-AUTH-04 : Création d'un compte client et envoi d'invitation
**Description :** En tant qu'administrateur agence, je veux créer un compte client depuis le Portail Disto et lui envoyer un email d'invitation pour qu'il puisse accéder à son espace.

**Acceptance Criteria :**
- [ ] Le Portail Disto expose un formulaire de création de compte client (email, rôle, brand associée)
- [ ] La soumission appelle l'API Supabase `inviteUserByEmail` (côté serveur via route ou server action)
- [ ] Un enregistrement est créé dans la table `profiles` avec le rôle et le brand slug
- [ ] L'utilisateur invité reçoit un email contenant le lien d'invitation Supabase
- [ ] Un message de confirmation s'affiche dans l'UI après l'envoi
- [ ] Typecheck/lint passe
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-AUTH-05 : Désactivation d'un compte client
**Description :** En tant qu'administrateur agence, je veux désactiver l'accès d'un client pour mettre fin à son accès immédiatement.

**Acceptance Criteria :**
- [ ] Le Portail Disto affiche un bouton/action "Désactiver" sur la fiche d'un utilisateur client
- [ ] La désactivation appelle l'API Supabase Admin `banUser` (côté serveur)
- [ ] L'utilisateur banni ne peut plus se connecter (message d'erreur approprié à la tentative de login)
- [ ] L'UI indique clairement le statut désactivé sur la fiche utilisateur
- [ ] L'action est irréversible dans le POC (pas de réactivation requise)
- [ ] Typecheck/lint passe
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-AUTH-06 : Réinitialisation de mot de passe
**Description :** En tant qu'utilisateur, je veux pouvoir réinitialiser mon mot de passe par email si je l'ai oublié.

**Acceptance Criteria :**
- [ ] Un lien "Mot de passe oublié ?" est visible sur la page `/login`
- [ ] L'utilisateur saisit son email et reçoit un email de réinitialisation Supabase
- [ ] Le lien de réinitialisation redirige vers une page permettant de définir un nouveau mot de passe
- [ ] Après réinitialisation réussie, l'utilisateur est redirigé vers `/login`
- [ ] Typecheck/lint passe
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-AUTH-07 : Affichage du profil connecté et déconnexion
**Description :** En tant qu'utilisateur connecté, je veux voir mon nom dans la barre de navigation et pouvoir me déconnecter en cliquant sur mon avatar.

**Acceptance Criteria :**
- [x] Le `TopBar` de toutes les pages admin affiche le nom réel de l'utilisateur connecté (lu depuis `supabase.auth.getUser()`)
- [x] Les initiales sont affichées dans un avatar carré à droite du nom
- [x] Un clic sur l'avatar ouvre un menu dropdown avec le nom complet, le rôle, et un bouton "Se déconnecter"
- [x] Le bouton "Se déconnecter" appelle une server action `logout()` qui invalide la session et redirige vers `/login`
- [x] Le menu se ferme au clic en dehors
- [x] Typecheck/lint passe
- [ ] Vérifier dans le navigateur avec le skill dev-browser

## Functional Requirements

- **FR-1 :** La page `/login` doit être accessible sans authentification et rediriger les utilisateurs déjà connectés vers leur portail respectif.
- **FR-2 :** Après une connexion réussie, le système lit le rôle de l'utilisateur dans la table `profiles` et redirige : `agency_admin` → `/clients`, `client_admin`/`client_reader` → `/{brand}`.
- **FR-3 :** La table `profiles` doit contenir au minimum : `id` (FK vers `auth.users`), `role` (`agency_admin` | `client_admin` | `client_reader`), `brand_slug` (nullable pour `agency_admin`).
- **FR-4 :** La création d'un compte client doit utiliser `supabase.auth.admin.inviteUserByEmail()` depuis un contexte serveur (server action ou route handler) pour ne pas exposer la clé service côté client.
- **FR-5 :** La désactivation d'un compte doit utiliser `supabase.auth.admin.updateUserById()` avec `{ ban_duration: 'none' }` remplacé par une durée permanente, ou `banUser` selon la version SDK disponible — à vérifier dans `node_modules/@supabase/auth-js`.
- **FR-6 :** Les routes du Portail Disto (`/clients`, `/clients/[id]/*`) doivent être protégées : toute tentative d'accès sans session `agency_admin` redirige vers `/login`.
- **FR-7 :** Les routes du Portail Client (`/[brand]`, `/[brand]/*`) doivent être protégées : toute tentative d'accès sans session `client_admin`/`client_reader` redirige vers `/login`. Un client ne peut accéder qu'à son propre `brand_slug`.
- **FR-8 :** La réinitialisation de mot de passe utilise `supabase.auth.resetPasswordForEmail()` avec une `redirectTo` pointant vers la page de mise à jour du mot de passe.

## Non-Goals

- Pas d'authentification SSO (Google, GitHub, etc.) dans le POC
- Pas d'authentification à deux facteurs (2FA)
- Pas de réactivation d'un compte désactivé depuis l'UI (POC uniquement)
- Pas de gestion des sessions multiples ou de révocation de token
- Pas d'audit log des connexions
- Pas de création de compte en libre-service (sign-up public désactivé)

## Design Considerations

- La page `/login` est partagée entre tous les types d'utilisateurs — un seul formulaire, la redirection se fait selon le rôle après connexion
- Réutiliser les composants existants `Btn`, `Card` depuis `components/ui/`
- Les couleurs et typographie suivent les tokens définis dans `lib/disto.ts`
- Le formulaire d'invitation client peut être une modale ou une page dédiée dans le Portail Disto

## Technical Considerations

- **Supabase SSR :** Utiliser `@supabase/ssr` avec le browser client pour les composants client, et le server client pour les server actions/route handlers nécessitant la clé service (`SUPABASE_SERVICE_ROLE_KEY`)
- **Clé service :** Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client — toutes les opérations admin (invite, ban) doivent passer par un server action ou route handler
- **Middleware :** Implémenter un middleware Next.js (`middleware.ts`) pour protéger les routes et rafraîchir les sessions Supabase — voir `node_modules/next/dist/docs/` pour les conventions actuelles
- **Table `profiles` :** Créer via migration SQL Supabase ; activer RLS avec des policies appropriées (l'utilisateur ne peut lire que son propre profil, `agency_admin` peut lire tous les profils)
- **Lire les docs Next.js** dans `node_modules/next/dist/docs/` avant d'écrire le middleware ou les server actions

## Success Metrics

- Un `agency_admin` peut se connecter et accéder au Portail Disto en moins de 3 secondes
- Un client reçoit son email d'invitation dans les 60 secondes après création par l'admin
- Un compte désactivé ne peut plus se connecter immédiatement après la désactivation
- Aucune route protégée n'est accessible sans session valide

## Open Questions

- Quelle est la durée de validité souhaitée pour le lien d'invitation Supabase (défaut : 24h) ?
Answer: 24h
- Faut-il un écran de confirmation avant de désactiver un compte (modale de confirmation) ?
Answer: Oui
- Le `brand_slug` est-il identique au sous-chemin URL `/{brand}` ou faut-il une table de mapping séparée ?
Answer: utilise la meilleur pratique
- Faut-il logger les actions admin (invitation, désactivation) dans une table d'audit pour le POC ?
Answer: Oui