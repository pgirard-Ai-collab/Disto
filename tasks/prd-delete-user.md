# PRD: Delete User

## Introduction

Today an agency admin can only **disable** a client user (set `client_users.status = 'disabled'` and ban the auth account). There is no way to permanently remove a user. This feature adds a true **delete** action that removes the user's authentication account and all account-level records linked to it: the `auth.users` row, the `profiles` row, and every `client_users` brand link.

Deletion is permanent and destructive, so it coexists with — and does not replace — the existing disable action, and requires explicit confirmation.

For a user who has access to **multiple brands**, deleting from a single client's access page removes only that one brand link **unless it is the user's last brand**, in which case the whole account is deleted. This keeps multi-brand users intact while still allowing complete removal.

---

## Goals

- Let an agency admin permanently delete a user from a client's access page
- When the user belongs to multiple brands, delete only the brand link from that client; delete the full account only when it is their last brand
- Cleanly remove all account-level data: `auth.users`, `profiles`, all `client_users` rows for that user
- Require an explicit confirmation dialog before any deletion
- Keep the existing **disable** action available and unchanged
- Restrict the action to `agency_admin` only

---

## User Stories

### US-001: Server action — delete a user (last-brand-aware)

**Description:** As an agency admin, I need a server action that removes a user's brand link, and fully deletes the account when that was their last brand, so removals are permanent and safe.

**Acceptance Criteria:**
- [ ] New server action `app/actions/delete-user.ts` exporting `deleteUser(clientUserId: string, userId: string)`
- [ ] Returns a discriminated result type `{ success: true } | { success: false; error: string }`, mirroring `disable-user.ts`
- [ ] Rejects with `missingIds` error when `clientUserId` or `userId` is empty
- [ ] Authenticates the caller via `supabase.auth.getUser()`; returns `unauthenticated` error if no session
- [ ] Verifies caller's `profiles.role === 'agency_admin'`; returns `accessDenied` otherwise
- [ ] Uses the admin client (`createAdminClient`) for all mutations
- [ ] Counts the user's `client_users` rows. If the user has **more than one** brand link: delete only the row matching `clientUserId` (do NOT delete the auth account)
- [ ] If the user has **exactly one** brand link (this is their last brand): delete the auth account via `admin.auth.admin.deleteUser(userId)`, which cascade-deletes `profiles` and the remaining `client_users` row
- [ ] All error strings come from `serverActions.errors` translation namespace (add new keys as needed); no hardcoded UI strings
- [ ] `revalidatePath(\`/clients/${clientId}/access\`)` is called on success
- [ ] Typecheck passes

### US-002: Delete button + confirmation dialog in access page

**Description:** As an agency admin, I want a "Delete" action next to "Disable" on the access page, with a confirmation dialog, so I can permanently remove a user without doing so accidentally.

**Acceptance Criteria:**
- [ ] In `app/(admin)/clients/[id]/access/DisableUserBtn.tsx` (or a sibling component), add a **Delete** button rendered alongside the existing Disable/Resend buttons
- [ ] Clicking Delete opens a confirmation modal styled like the existing disable/resend modals (same `C.*` tokens, `C.red` accent, inline styles)
- [ ] The modal clearly states the deletion is permanent and names the user. Copy is generic — it does NOT call out whether this is the user's last brand (the last-brand → full-account deletion happens silently, per decision)
- [ ] Confirming calls `deleteUser(clientUserId, userId)`
- [ ] On success the row disappears from the list (or the page revalidates) without a hard reload
- [ ] On failure the existing error modal pattern displays `result.error`
- [ ] The Disable action and its modal remain present and functional, unchanged
- [ ] All visible strings use the `next-intl` translation namespace used by this component (add new keys to `messages/en.json` and `messages/fr.json`)
- [ ] No hardcoded hex values; follows inline-style + `C.*` conventions
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Verify cascading deletion behavior

**Description:** As a developer, I need to confirm that deleting the auth account leaves the database consistent so no orphaned or broken records remain.

**Acceptance Criteria:**
- [ ] Confirm `profiles` row is removed (FK `on delete cascade` from `auth.users`)
- [ ] Confirm all `client_users` rows for the user are removed (FK `on delete cascade`)
- [ ] Confirm `brand_structure_proposals.proposed_by` and brand-structure-version `created_by` are set to `null` (FK `on delete set null`) — authored data survives, authorship is nulled, no error is thrown
- [ ] No new migration is required if existing FK rules already produce this behavior; document this in the action's code comment
- [ ] Manually verify by deleting a test user and checking the affected tables
- [ ] Typecheck passes

---

## Functional Requirements

- **FR-1:** `deleteUser(clientUserId, userId)` must be callable only by an authenticated `agency_admin`.
- **FR-2:** When the target user has more than one `client_users` row, the action deletes only the `client_users` row identified by `clientUserId` and leaves the auth account intact.
- **FR-3:** When the target user has exactly one `client_users` row, the action deletes the `auth.users` account, relying on FK cascade to remove `profiles` and `client_users`.
- **FR-4:** The access page must present a Delete action with a confirmation dialog separate from the existing Disable action.
- **FR-5:** The confirmation copy is generic and must NOT vary based on the user's brand count — when the deleted link is the last brand, the full account is deleted silently.
- **FR-6:** On success the access page list must reflect the removal without a full page reload.

---

## Non-Goals

- No deletion of brand-level content created by the user (proposals, brand-structure versions remain; their authorship is nulled, not deleted).
- No bulk/multi-user deletion — one user at a time.
- No "soft delete" / restore flow — disable already covers reversible removal.
- No self-service deletion by client users; agency admins only.
- No deletion of `auth.users` from any UI other than the access page.
- No email notification to the deleted user.
- No changes to the existing disable, invite, or resend-invite flows.

---

## Design Considerations

- Reuse the modal markup, spacing, and button styling already in `DisableUserBtn.tsx`. The Delete confirm modal should use the `C.red` accent and the same fixed-overlay pattern.
- Place the Delete button so it reads as more destructive than Disable (e.g. below/after it), but keep the existing button layout (`flex column, align flex-end, gap 6`).
- For a `disabled` user (where the Disable button is replaced by a "disabled" tag), still surface the Delete action so disabled users can ultimately be removed.

---

## Technical Considerations

- **FK cascade is the deletion engine.** `profiles.id` and `client_users.user_id` both reference `auth.users (id) on delete cascade`. Deleting the auth user is sufficient to clear those rows — no manual per-table cleanup needed.
- **`on delete set null` references** (`brand_structure_proposals.proposed_by`, brand-structure-version `created_by`) intentionally preserve authored content while nulling the author. This is acceptable per Non-Goals.
- **Admin client required:** `admin.auth.admin.deleteUser()` needs the service-role client (`createAdminClient`), as in `disable-user.ts`.
- **Brand-count check:** query `client_users` filtered by `user_id` to count brand links before deciding between single-row delete and full-account delete. Beware RLS — use the admin client for this count.
- **Translation keys:** add new keys under `serverActions.errors` (action) and the access-page admin namespace (UI) in both `messages/en.json` and `messages/fr.json`.
- **No new migration anticipated.** Verify existing FK rules; only add a migration if a constraint blocks the cascade.

---

## Success Metrics

- An agency admin can permanently delete a single-brand user in ≤ 2 clicks after opening the dialog, and the user can no longer log in.
- Deleting a multi-brand user from one client's access page removes only that brand; the user retains access to their other brands.
- After deletion, the `auth.users`, `profiles`, and `client_users` rows for a last-brand user are gone, with no orphaned rows or FK errors.
- The existing disable flow continues to work unchanged.

---

## Resolved Decisions

- **Last-brand deletion is silent.** When the deleted brand link is the user's last brand, the full account is deleted with no special warning — the confirmation dialog uses generic copy regardless of brand count.
- **No audit log.** Full-account deletions are not recorded in an audit log; out of scope.
