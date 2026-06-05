# PRD: Delete Brand

## Introduction

Agency admins need the ability to permanently delete a brand (client) from the system. This is a hard delete that cascades to all related data: brand structures, client users, ingestion jobs, and proposals. Because this action is irreversible, it requires a typed-name confirmation before proceeding. The delete action is accessible from the brand list row menu.

## Goals

- Allow agency admins to permanently remove a brand and all its associated data
- Prevent accidental deletion via a typed-name confirmation gate
- Keep the brands list clean by removing the brand row immediately after deletion
- Surface clear errors if deletion fails

## User Stories

### US-001: Add "Delete" option to brand list row menu
**Description:** As an agency admin, I want a delete option in the brand row actions so I can initiate deletion from the list.

**Acceptance Criteria:**
- [ ] The row action menu in `ClientsTable.tsx` includes a "Supprimer" option
- [ ] "Supprimer" is visually distinct (red text) from the archive/unarchive options
- [ ] Clicking "Supprimer" opens the typed-confirmation modal (US-002)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-002: Typed-name confirmation modal
**Description:** As an agency admin, I want to confirm deletion by typing the brand name so I can't accidentally wipe a client.

**Acceptance Criteria:**
- [ ] Modal title: "Supprimer [brand_name] ?"
- [ ] Body text warns that all data (structures, users, imports) will be permanently deleted
- [ ] Text input labeled "Saisissez le nom de la marque pour confirmer"
- [ ] Confirm button is disabled until the input value matches `brand_name` exactly (case-sensitive)
- [ ] Cancel button closes modal with no action
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: `deleteClient` server action
**Description:** As a developer, I need a server action that hard-deletes a client row so the cascade removes all related data.

**Acceptance Criteria:**
- [ ] `deleteClient(clientId: string)` added to `app/actions/clients.ts`
- [ ] Executes `DELETE FROM clients WHERE id = $1` (FK cascades handle related tables)
- [ ] Returns `{ error: string | null }`
- [ ] Only callable by users with `role = 'agency_admin'` (checked server-side)
- [ ] Typecheck passes

### US-004: Remove brand row and show feedback after deletion
**Description:** As an agency admin, I want the brand to disappear from the list immediately after deletion so I have clear confirmation the action succeeded.

**Acceptance Criteria:**
- [ ] On success: modal closes, deleted brand row is removed from the displayed list (optimistic or re-fetch)
- [ ] On error: modal stays open, error message shown inside the modal
- [ ] Success toast or inline banner: "La marque [brand_name] a été supprimée"
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Delete option appears in the existing row action menu in `ClientsTable.tsx` for every brand regardless of status (draft, active, archived)
- FR-2: A confirmation modal requires the user to type the exact `brand_name` before the confirm button becomes enabled
- FR-3: The `deleteClient` server action performs a hard `DELETE` on the `clients` table row; FK `ON DELETE CASCADE` on `brand_structures`, `client_users`, `ingestion_jobs`, and `brand_structure_proposals` handles related data cleanup
- FR-4: Server action verifies the caller is an `agency_admin` before executing the delete
- FR-5: On success the deleted row is removed from the UI and a success message is shown
- FR-6: On failure an error message is displayed inside the modal; no data is changed

## Non-Goals

- No soft-delete / recycle bin — this is permanent
- No deletion from the brand detail page (Settings or Danger Zone) — list only
- No bulk delete of multiple brands at once
- No email notification to brand users upon deletion
- No export/backup prompt before deletion

## Design Considerations

- Reuse the existing confirmation modal pattern already in `ClientsTable.tsx` (`confirm` state + modal overlay)
- Red-colored confirm button (`C.red` background) to reinforce destructive nature
- Disabled confirm button style: muted/greyed out until name matches
- Follow the existing i18n pattern — add keys to `messages/en.json` and `messages/fr.json`

## Technical Considerations

- The `clients` table already has `ON DELETE CASCADE` on all child tables — no manual cleanup queries needed
- `deleteClient` goes in `app/actions/clients.ts` alongside the existing `archiveClient` / `activateClient` actions
- Role check: read `profiles.role` for the current session user and reject if not `agency_admin`
- The modal input comparison must be exact string match (no trim, no toLowerCase) to preserve the confirmation intent

## Success Metrics

- An agency admin can delete a brand in under 30 seconds from the list page
- Zero accidental deletions due to the typed-name gate
- No orphaned rows in `brand_structures`, `client_users`, `ingestion_jobs`, or `brand_structure_proposals` after deletion

## Open Questions

- Should deletion be blocked if the brand has active client users (i.e., warn that N users will lose access)? Currently not in scope but worth considering. 
Answer:No
- Should agency admins be able to delete brands that are currently `active` (vs only `draft`/`archived`)? Current spec: yes, all statuses.
Answer:All statuses.
