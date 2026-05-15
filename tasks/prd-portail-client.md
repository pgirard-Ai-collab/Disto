# PRD : Portail Client — Gardien de la Marque (6.3)

## Introduction

Le Portail Client est l'interface personnalisée pour chaque client de l'agence betula. Accessible depuis un URL brandé (`/[brand]`), il permet au client d'explorer sa stratégie de marque, d'interroger un assistant IA contextuel, d'exporter le system prompt de sa marque et de proposer des mises à jour de contenu. L'interface est brandée à l'identité visuelle de la marque du client (couleurs, logo). Toute la donnée provient des structures créées et validées dans le Portail Admin Agence.

---

## Objectifs

- Offrir au client une vitrine interactive de sa stratégie de marque, sans PDF
- Permettre au client d'interroger sa marque via un assistant IA contextuel
- Générer et exporter le system prompt en 4 formats prêts à l'emploi

---

## Module 6.3.A — Tableau de bord de la marque

### US-CLIENT-01 : Voir le tableau de bord de la marque

**Description :** En tant que client, je veux voir un tableau de bord centralisé affichant les éléments clés de ma stratégie de marque (mission, ton, archétype, manifeste) pour avoir une vue d'ensemble rapide.

**Acceptance Criteria :**
- [ ] La page `/[brand]` affiche le nom de la marque et son slogan/tagline en en-tête
- [ ] 4 cartes sont affichées : Mission, Archétype, Ton & Personnalité, Manifeste
- [ ] Chaque carte affiche un résumé tronqué (max 3 lignes / ~150 caractères) avec ellipsis si dépassement
- [ ] Un bouton « Interroger la marque » redirige vers `/[brand]/chat`
- [ ] Un bouton « Exporter le prompt » redirige vers `/[brand]/export`
- [ ] L'interface est responsive (mobile : cartes en colonne unique)
- [ ] Les données proviennent de la table `brand_structures` via Supabase
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Module 6.3.B — Explorateur de stratégie

### US-CLIENT-02 : Explorer les sections de la stratégie

**Description :** En tant que client, je veux explorer toutes les sections de ma stratégie de marque dans une interface structurée et lisible, sans avoir à ouvrir le PDF original.

**Acceptance Criteria :**
- [ ] La page `/[brand]/strategie` affiche une navigation latérale (`.inner-nav`) listant les 11 sections :
  - Mission & Vision
  - Intention de marque
  - Archétype
  - Proposition de valeur
  - Positionnement
  - Ton & Personnalité
  - Cibles & Personas
  - Messages clés
  - Manifeste
  - Contexte concurrentiel
  - Valeurs & Principes
- [ ] Cliquer sur une section dans le nav affiche son contenu dans le panneau droit
- [ ] Chaque section affiche la date de dernière modification (`updated_at`)
- [ ] La section active est mise en évidence dans le nav
- [ ] La mise en page utilise `.panel-split` (nav gauche + contenu droit)
- [ ] Sur mobile, le nav se replie et le contenu occupe tout l'écran
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-CLIENT-03 : Rechercher dans la stratégie

**Description :** En tant que client, je veux pouvoir chercher un terme ou concept dans ma stratégie de marque pour trouver rapidement l'information pertinente.

**Acceptance Criteria :**
- [ ] Un champ de recherche est visible en haut de la page `/[brand]/strategie`
- [ ] La recherche filtre les sections dont le contenu contient le terme saisi (case-insensitive, côté client)
- [ ] Les sections sans correspondance sont masquées dans le nav
- [ ] Les occurrences du terme sont surlignées dans le contenu affiché
- [ ] Si aucune section ne correspond, un message « Aucun résultat pour "terme" » est affiché
- [ ] Vider le champ restaure toutes les sections
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Module 6.3.C — Assistant IA intégré (Chat)

### US-CLIENT-04 : Poser des questions sur la marque

**Description :** En tant que client, je veux poser des questions en langage naturel sur ma marque à un assistant IA qui connaît ma stratégie, pour obtenir des réponses contextualisées sans quitter le portail.

**Acceptance Criteria :**
- [ ] La page `/[brand]/chat` affiche une interface de chat (messages utilisateur + réponses IA)
- [ ] Un champ de saisie texte + bouton « Envoyer » permet de soumettre une question
- [ ] La soumission via la touche Entrée est supportée (Maj+Entrée pour saut de ligne)
- [ ] L'appel API passe par une Route Handler Next.js (`/api/chat`) — jamais la clé API côté client
- [ ] Le system prompt injecté contient la structure de marque complète récupérée depuis `brand_structures`
- [ ] Le modèle utilisé est `claude-sonnet-4-6` via l'API Anthropic
- [ ] La longueur de réponse maximale est de 800 tokens
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-CLIENT-05 : Réponses cohérentes avec la marque

**Description :** En tant que client, je veux que l'assistant IA réponde toujours dans le ton et avec les valeurs de ma marque, en s'appuyant exclusivement sur la structure définie.

**Acceptance Criteria :**
- [ ] Le system prompt injecté inclut : mission, archétype, ton, valeurs, manifeste, contexte concurrentiel, et consignes do/don't
- [ ] Si la question dépasse le périmètre de la marque, l'assistant répond poliment qu'il ne peut répondre qu'en lien avec la marque
- [ ] La langue de réponse correspond à la langue de la question (détection automatique) avec le français comme défaut

### US-CLIENT-06 : Copier une réponse en un clic

**Description :** En tant que client, je veux pouvoir copier en un clic la réponse de l'assistant IA pour l'utiliser dans mes communications.

**Acceptance Criteria :**
- [ ] Chaque bulle de réponse IA affiche un bouton « Copier »
- [ ] Cliquer sur « Copier » copie le texte brut de la réponse dans le presse-papier
- [ ] Un feedback visuel (ex. icône changée, texte « Copié ! ») confirme l'action pendant 2 secondes
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-CLIENT-07 : Voir les sources citées

**Description :** En tant que client, je veux voir les sources de la stratégie sur lesquelles l'assistant IA s'est basé pour répondre.

**Acceptance Criteria :**
- [ ] Chaque réponse IA affiche en dessous une ligne « Basé sur : [Section A], [Section B] »
- [ ] Les sources sont extraites de la réponse du LLM (le system prompt demande au modèle de les lister)
- [ ] Les noms de sections correspondent aux 11 sections de la structure de marque
- [ ] Un indicateur de chargement (spinner ou skeleton) est affiché pendant la génération de la réponse
- [ ] La réponse s'affiche en moins de 5 secondes pour une question simple
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Module 6.3.D — Générateur & Export de System Prompt

### US-CLIENT-08 : Voir le system prompt généré

**Description :** En tant que client, je veux voir le system prompt de ma marque généré automatiquement à partir de la structure pour comprendre comment il encode ma stratégie.

**Acceptance Criteria :**
- [ ] La page `/[brand]/export` affiche un aperçu complet du system prompt en lecture seule
- [ ] Le prompt est généré côté serveur à partir du contenu de `brand_structures`
- [ ] La structure du prompt inclut : identité, mission, archétype, ton, proposition de valeur, règles do/don't, contexte concurrentiel, manifeste
- [ ] La date de génération (basée sur le `updated_at` le plus récent de la structure) est affichée
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-CLIENT-09 : Exporter en 4 formats

**Description :** En tant que client, je veux exporter le system prompt en un clic dans 4 formats distincts, prêts à l'emploi pour les principales plateformes LLM.

**Acceptance Criteria :**
- [ ] 4 boutons d'export sont disponibles :
  - `chatgpt_custom_gpt` — format instructions Custom GPT OpenAI (`.txt`)
  - `claude_project` — format instructions Project Claude (`.md`)
  - `gemini_gem` — format instructions Gem Gemini (`.txt`)
  - `universal_txt` — prompt brut texte plein (`.txt`)
- [ ] Chaque export déclenche un téléchargement immédiat du fichier correspondant
- [ ] Le nom de fichier inclut le slug de la marque et le format (ex. `sartiga-claude-project.md`)
- [ ] L'export est généré côté serveur via une Route Handler (`/api/export?brand=[slug]&format=[format]`)
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

### US-CLIENT-10 : Instructions d'utilisation par plateforme

**Description :** En tant que client, je veux recevoir des instructions claires sur comment utiliser le prompt exporté dans ChatGPT, Claude ou Gemini, directement dans l'interface d'export.

**Acceptance Criteria :**
- [ ] Chaque format d'export est accompagné d'un bloc d'instructions (accordéon ou section dépliable)
- [ ] Les instructions couvrent : où coller le prompt, comment créer le GPT/Project/Gem, comment le partager
- [ ] Les instructions sont en français
- [ ] Les instructions sont statiques (pas de données dynamiques)
- [ ] Typecheck/lint passent
- [ ] Vérifier dans le navigateur avec le skill dev-browser

---

## Exigences fonctionnelles

- FR-1 : Toutes les pages du portail client sont sous le groupe de route `app/(client)/[brand]/`
- FR-2 : La sidebar client utilise `<Sidebar variant="client" brand={brand} />`
- FR-3 : Les pages dark utilisent `background: C.black, color: C.bone` et `theme="dark"` sur le TopBar
- FR-4 : La clé API Anthropic n'est jamais exposée côté client — toutes les requêtes LLM passent par des Route Handlers Next.js
- FR-5 : L'accès au portail est conditionné à une session Supabase valide avec le bon `brand` associé au compte
- FR-6 : Le chat ne persiste pas l'historique en base de données pour le POC — l'historique est en mémoire React (state)
- FR-7 : La table `brand_structure_proposals` stocke : `id`, `brand_id`, `section_key`, `content_before`, `content_proposed`, `status`, `agency_comment`, `created_at`, `resolved_at`

---

## Hors périmètre (Non-Goals)

- Pas de personnalisation visuelle de l'interface par le client — thème dark fixe, géré par l'agence (pas de couleurs par marque)
- Pas de persistance de l'historique du chat en base de données (POC : mémoire session uniquement)
- Pas de notification en temps réel (pas de WebSocket)
- Pas de gestion multi-langue de l'interface (tout en français pour le POC)
- Pas d'upload de fichiers dans le chat
- Pas de génération de visuels ou images via le chat
- Pas de rate limiting sur le chat pour le POC

---

## Considérations techniques

- **Routes :** `app/(client)/[brand]/`, `app/(client)/[brand]/strategie/`, `app/(client)/[brand]/chat/`, `app/(client)/[brand]/export/`
- **Route Handlers :** `app/api/chat/route.ts` (POST), `app/api/export/route.ts` (GET)
- **Modèle LLM :** `claude-sonnet-4-6` via `@anthropic-ai/sdk` — jamais côté client
- **Auth :** Vérifier via Supabase SSR que l'utilisateur connecté a accès au `brand` demandé
- **Tables Supabase impliquées :** `clients`, `brand_structures`, `client_users`, `brand_structure_proposals` (nouvelle)
- **Prompt caching :** Activer le cache Anthropic sur le system prompt (statique par marque) pour réduire les coûts et la latence

---

## Métriques de succès

- Le chat répond en moins de 5 secondes pour une question simple
- L'export d'un format se télécharge en moins de 2 secondes
- Aucun appel à l'API Anthropic ne s'effectue côté client (clé API sécurisée)

---

## Questions ouvertes

Aucune — toutes les questions ont été résolues.

