# PRD: Replace Supabase Email with Resend

## Introduction

Replace all Supabase-native email sending with Resend. Currently, Supabase handles invitation and password reset emails using its built-in SMTP. The goal is to bypass Supabase email entirely — use `admin.auth.admin.generateLink()` to get the secure token/link, then send fully branded HTML emails via Resend directly from server actions.

## Goals

- All transactional auth emails (invite, password reset, magic link, email confirmation) sent via Resend
- Branded HTML templates matching the Disto design system (dark background, `C.red` CTA, `C.bone` text)
- Sender: `noreply@disto.app`
- Supabase never sends email on its own (bypassed by design via `generateLink`)
- Local dev: log `action_link` to console instead of calling Resend when `NODE_ENV === 'development'`

## User Stories

### US-001: Install Resend and create email infrastructure
**Description:** As a developer, I need the Resend client and a unified `sendEmail()` helper so all email sending goes through one surface.

**Acceptance Criteria:**
- [ ] `resend` npm package installed
- [ ] `RESEND_API_KEY` added to `.env.local`
- [ ] `lib/email/resend.ts` exports a singleton `resend` client and `FROM = 'Disto <noreply@disto.app>'`
- [ ] `lib/email/send.ts` exports `sendEmail({ to, subject, html })` that calls Resend and returns `{ error: string | null }`
- [ ] In `NODE_ENV === 'development'`, `sendEmail` logs the `action_link` to console and skips the Resend API call
- [ ] Typecheck passes

### US-002: Create branded HTML email templates
**Description:** As a user, I want to receive well-designed emails from Disto that match the brand.

**Acceptance Criteria:**
- [ ] `lib/email/templates/invite.ts` exports `inviteEmailHtml({ actionLink, email })` and `inviteSubject`
- [ ] `lib/email/templates/reset-password.ts` exports `resetPasswordEmailHtml({ actionLink, email })` and `resetPasswordSubject`
- [ ] `lib/email/templates/magic-link.ts` exports `magicLinkEmailHtml({ actionLink, email })` and `magicLinkSubject`
- [ ] `lib/email/templates/email-confirmation.ts` exports `emailConfirmationHtml({ actionLink, email })` and `emailConfirmationSubject`
- [ ] All templates: dark background (`C.panel`/`C.black`), `DISTO.` wordmark in `C.red`, body text in `C.bone`, CTA button in `C.red`, footer in `C.fg3`
- [ ] All styles inline (no Tailwind, no external CSS)
- [ ] Typecheck passes

### US-003: Replace invite-user action
**Description:** As an agency admin, I want invitations sent via Resend so they arrive with branded emails.

**Acceptance Criteria:**
- [ ] `app/actions/invite-user.ts` calls `admin.auth.admin.generateLink({ type: 'invite', email, options: { redirectTo } })` instead of `inviteUserByEmail()`
- [ ] On success, calls `sendEmail` with the invite template
- [ ] `data.user.id` from `generateLink` is still used for `profiles` and `client_users` upserts (no change to that logic)
- [ ] "Already registered" error handling preserved
- [ ] Rollback (delete user on downstream failure) preserved
- [ ] Typecheck passes

### US-004: Replace resend-invite action
**Description:** As an agency admin, I want re-sent invitations and password reset nudges sent via Resend.

**Acceptance Criteria:**
- [ ] `app/actions/resend-invite.ts` uses `generateLink({ type: 'invite' })` for unconfirmed users
- [ ] Falls back to `generateLink({ type: 'recovery' })` when user is already confirmed (same logic as current `resetPasswordForEmail` fallback)
- [ ] Sends the correct template for each case (invite vs. reset-password)
- [ ] Existing rate-limit error handling removed or simplified (admin `generateLink` has no client-side rate limits)
- [ ] Typecheck passes

### US-005: Replace bulk invite in clients action
**Description:** As an agency admin creating a new client, I want invitation emails sent via Resend.

**Acceptance Criteria:**
- [ ] `app/actions/clients.ts` invite loop uses `generateLink({ type: 'invite' })` + `sendEmail`
- [ ] Guard condition `if (linkError || !linkData?.user) continue` replaces previous `inviteUserByEmail` guard
- [ ] Typecheck passes

### US-006: Convert forgot-password page to server action
**Description:** As a user, I want to request a password reset without Supabase sending the email directly from the browser.

**Acceptance Criteria:**
- [ ] New `app/actions/forgot-password.ts` server action created
- [ ] Calls `admin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })`
- [ ] Always returns `{ success: true }` (anti-enumeration — same as current behaviour)
- [ ] Sends reset-password template via `sendEmail` on success
- [ ] `app/(auth)/forgot-password/page.tsx` calls the new server action instead of `supabase.auth.resetPasswordForEmail()`
- [ ] Browser `createClient()` import removed from the page
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: `resend` package added as a dependency
- FR-2: `lib/email/resend.ts` — singleton Resend client; `FROM` constant `'Disto <noreply@disto.app>'`
- FR-3: `lib/email/send.ts` — `sendEmail()` is the only surface that imports the Resend client; all actions go through it
- FR-4: Four template files under `lib/email/templates/` — one per email type, each a plain TS function returning an HTML string
- FR-5: Template design: dark bg, `DISTO.` red wordmark, `C.bone` body text, `C.red` CTA button (no border-radius), `C.fg3` footer
- FR-6: `generateLink()` replaces `inviteUserByEmail()` and `resetPasswordForEmail()` everywhere
- FR-7: `forgotPassword` server action created; browser client no longer used on the forgot-password page
- FR-8: In development (`NODE_ENV === 'development'`), `sendEmail` prints the `action_link` to the server console and returns `{ error: null }` without calling Resend

## Non-Goals

- No React Email / `@react-email` packages — templates are plain HTML string functions
- No changes to `/set-password` or `/update-password` pages — they handle the post-link flow and are unrelated
- No `supabase/config.toml` changes required — `generateLink` never triggers Supabase email sending
- No Supabase dashboard SMTP configuration — Option A bypasses SMTP entirely
- No changes to the Supabase Auth token lifetime, OTP length, or redirect URL logic

## Design Considerations

Template visual structure (consistent across all four):
1. Outer wrapper: `background: C.black`, max-width 560px centered
2. Header: `DISTO.` in `C.red`, weight 700, size 24px + eyebrow label in `C.fg3`
3. Body: heading in `C.bone`, supporting text in `C.fg3`
4. CTA button: `background: C.red`, `color: #fff`, `padding: 14px 28px`, no border-radius
5. Footer: `color: C.fg3`, `font-size: 11px`, "© betula / Disto"
6. Font stack: `'Archivo', 'Helvetica Neue', Arial, sans-serif`

## Technical Considerations

- `generateLink({ type: 'invite' })` creates the user if they don't exist — `data.user.id` is available for downstream upserts, identical to the current `inviteUserByEmail` flow
- `generateLink({ type: 'invite' })` errors when the user already exists/confirmed — use this as the fallback trigger in `resend-invite.ts`
- `generateLink({ type: 'recovery' })` errors if the email doesn't exist in `auth.users` — `forgotPassword` action swallows this silently (anti-enumeration)
- The `action_link` returned points to the local Supabase auth server in dev (`http://127.0.0.1:54321/auth/v1/verify?...`) and to production Supabase in prod — no changes needed on the receiving side

## Success Metrics

- Zero emails sent through Supabase SMTP in production
- All four email types render correctly in major clients (Gmail, Apple Mail)
- Invite flow end-to-end: agency admin invites user → user receives branded email → clicks link → lands on `/set-password`
- Forgot-password flow end-to-end: user submits email → receives branded reset email → clicks link → lands on `/update-password`

## Open Questions

- Should `sendEmail` failure on invite be fatal (delete the created user) or soft (user exists, admin can resend)? Current code treats `inviteUserByEmail` failure as non-fatal — recommend keeping that behaviour.
- Resend sandbox mode for staging environment? Recommend using Resend's built-in test mode (`RESEND_API_KEY=re_test_...`) on staging rather than a `NODE_ENV` check.
