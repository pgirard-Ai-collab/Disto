# PRD: Multi-Brand User Access

## Introduction

Currently, a client user (email) is locked to exactly one brand via a scalar `brand_slug` field in the `profiles` table. This feature allows a single email/login to be associated with multiple brands, letting brand contacts who work across several clients use one account. After login, a brand-picker screen lets them choose which brand to enter, and an in-app switcher lets them jump between brands without logging out.

---

## Goals

- Allow a user to be associated with 1-N brands in the database
- Show a brand-picker screen after login when a user has more than one brand
- Single-brand users continue to land directly on their portal (no regression)
- Add an in-app brand-switcher in the client Sidebar so the user can switch without logging out
- Enforce access control: users can only access brands they are explicitly linked to

---

## User Stories

### US-001: DB — support multiple brands per user

**Description:** As a developer, I need a database model that links one user to many brands so multiple-brand access can be enforced securely.

**Acceptance Criteria:**
- [ ] The scalar `profiles.brand_slug` is no longer the source of truth for access (column can stay for now but should not be used for access checks)
- [ ] `client_users` table (already a junction: `user_id × client_id`) becomes the canonical source — confirm a user has access by querying it instead of `profiles.brand_slug`
- [ ] `requireBrandAccess()` in `lib/client-access.ts` updated: checks `client_users` join with `clients.slug` instead of comparing `profiles.brand_slug`
- [ ] RLS policy on `clients` updated: a client user can read a `clients` row if a matching `client_users` row exists for their `user_id` (not just matching `brand_slug`)
- [ ] Existing single-brand users are unaffected (they still have one row in `client_users`)
- [ ] Typecheck passes

### US-002: Login — brand-picker routing for multi-brand users

**Description:** As a brand contact with multiple brands, I want to see a brand selection screen after logging in so I can choose which portal to enter.

**Acceptance Criteria:**
- [ ] After successful login, the app queries `client_users JOIN clients` to get the list of active brands for the logged-in user
- [ ] If the user has exactly 1 active brand → redirect directly to `/{brand_slug}` (no change for single-brand users)
- [ ] If the user has 2+ active brands → redirect to `/select-brand` instead of directly to a portal
- [ ] If the user has 0 active brands → show existing "no portal access" error
- [ ] Same logic applies in the set-password flow (`app/(auth)/set-password/page.tsx`)
- [ ] Typecheck passes

### US-003: Brand-picker screen (`/select-brand`)

**Description:** As a brand contact with multiple brands, I want a clean screen listing my accessible brands so I can pick one to enter.

**Acceptance Criteria:**
- [ ] New route `app/(auth)/select-brand/page.tsx` exists
- [ ] Page is accessible only to authenticated users; unauthenticated users are redirected to `/login`
- [ ] Page displays a card/list of all the user's active brands (brand name + org name), fetched from `client_users JOIN clients`
- [ ] Clicking a brand navigates to `/{brand_slug}`
- [ ] Page uses the existing design system (`C.*` tokens, `Btn`, `Card` components); no hardcoded hex values
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: In-app brand-switcher in the client Sidebar

**Description:** As a brand contact with multiple brands, I want to switch between my brands from inside the portal without logging out.

**Acceptance Criteria:**
- [ ] The "tenant block" in `components/layout/Sidebar.tsx` (currently a static display) becomes a dropdown/button when the user has 2+ active brands
- [ ] Clicking it reveals the list of the user's brands; clicking one navigates to `/{brand_slug}`
- [ ] When the user has only 1 brand, the tenant block remains static (no dropdown affordance)
- [ ] The brand list is fetched client-side (browser Supabase client) and cached; no full page reload is required to switch
- [ ] Active brand is visually distinguished in the list
- [ ] Follows inline-style + `C.*` conventions; no Tailwind utilities on component internals
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Invite flow — allow inviting an existing user to a second brand

**Description:** As an agency admin, I want to invite an email that is already registered to a new brand so that user gains access without creating a duplicate account.

**Acceptance Criteria:**
- [ ] `app/actions/invite-user.ts`: before calling `supabase.auth.admin.inviteUserByEmail`, check if a user with that email already exists in `auth.users`
- [ ] If the user exists: skip auth invite; insert a new `client_users` row linking the existing `user_id` to the new `client_id` with `status = 'active'` (no invite email needed — user already has credentials)
- [ ] If the user does not exist: existing invite flow unchanged (create auth user, insert `client_users` row with `status = 'invited'`, send email)
- [ ] The invite action also updates `profiles.brand_slug` to any one of the user's brands (or `null`) — this field is now unused for access but must remain non-null per existing check constraint; update or drop that constraint if needed
- [ ] Typecheck passes

---

## Functional Requirements

- **FR-1:** `requireBrandAccess(brandSlug)` must verify access via `client_users JOIN clients ON slug` rather than `profiles.brand_slug`
- **FR-2:** The post-login routing reads the count of active brands from `client_users`; routes to `/select-brand` when count > 1
- **FR-3:** `/select-brand` page renders all active brands for the logged-in user and navigates on click
- **FR-4:** The Sidebar tenant block renders as a static display for single-brand users and as an interactive dropdown for multi-brand users
- **FR-5:** The invite action detects existing users by email and creates only the `client_users` row (skips auth invite) for repeat emails

---

## Non-Goals

- No admin UI for batch-assigning brands to users (brands are added one at a time via the existing invite flow)
- No "default brand" or "remember last brand" logic — brand picker always appears on login for multi-brand users
- No changes to agency admin routing or agency sidebar
- No changes to brand creation, deletion, or archiving flows
- No email notification when an existing user is added to a new brand (can be a follow-up)

---

## Design Considerations

- `/select-brand` page should follow the unauthenticated layout (no Sidebar/TopBar); center the brand cards on screen using the existing `C.*` palette
- Sidebar tenant block dropdown should reuse styling from existing dropdown patterns in the codebase; keep the same fixed 256px sidebar width
- Brand cards on the picker and in the Sidebar list must show `brand_name` (and optionally `org_name` as a subtitle)

---

## Technical Considerations

- **`client_users` is already the right join table** — it has `unique(client_id, user_id)`, the correct `status` enum, and foreign keys to both `clients` and `auth.users`. No new table is needed.
- **RLS:** the current `clients` RLS policy uses `profiles.brand_slug` for client user reads — this must be updated to check for a `client_users` row instead. Agency admins are unaffected.
- **`profiles.brand_slug` constraint:** migration needed to either drop the `NOT NULL`-equivalent check constraint or relax it; the column can be set to the first brand assigned or left nullable going forward.
- **Browser-side brand list:** fetch once on Sidebar mount; no server component required. Use the existing `lib/supabase/browser.ts` client.
- **`activate_my_client_access` RPC:** currently flips the single `client_users` row to `active` — verify it still works when a user has multiple rows (it should if it updates by `user_id` and the current invite's `client_id`).

---

## Success Metrics

- An existing single-brand user's login flow is unchanged (no extra screen)
- A user linked to 2 brands sees the brand-picker on login and can navigate to either brand
- The brand-switcher in the Sidebar lets a multi-brand user change portals in ≤ 2 clicks
- Agency admin can invite an already-registered email to a second brand without an error

---

## Decisions

- `/select-brand` is only triggered post-login; bypassed entirely for single-brand users. No in-portal "switch" link needed — the Sidebar dropdown (US-004) covers in-session switching.
- Disabled brands (`client_users.status = 'disabled'`) are hidden on both the brand-picker and the Sidebar switcher list.
- `profiles.brand_slug` column is kept (not dropped); it remains nullable/unused for access checks but stays in the schema for backward compatibility.
