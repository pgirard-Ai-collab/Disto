# CLAUDE.md

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint (flat config)
npm run typecheck  # tsc --noEmit
```

No test runner is configured.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 · Supabase (JS v2 + SSR) · next-intl 4.x

## Route groups

| Group | Audience | Root path |
|---|---|---|
| `app/(auth)/` | Login | `/login` |
| `app/(admin)/` | Agency console | `/clients`, `/clients/[id]/*` |
| `app/(client)/` | Brand portal | `/[brand]`, `/[brand]/*` |

`app/page.tsx` immediately redirects to `/login`. No `middleware.ts` exists — route protection is client-side only.

## Data & auth

**No API routes.** Pages call Supabase directly via `@supabase/ssr` browser client. Currently all pages render **mock/static data** — no live Supabase queries are wired yet.

When adding Supabase queries, use async Server Components and `await params` for dynamic segments:

```tsx
export default async function MyPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  // ... supabase query
}
```

Local Supabase runs on port 54321 (API) and 54322 (Postgres 17). Config at `supabase/config.toml`.

## Design system

Two canonical sources — never use hardcoded hex values or ad-hoc inline styles outside of them.

### `lib/disto.ts`
- `C` — color token object (single source of truth for all colors). Use `C.bone`, `C.red`, `C.panel`, etc.
- `PillKind` — union type for status values: `draft | active | archived | auto | validated | modified | invited | disabled | default`
- `PILL_MAP` — maps each `PillKind` to `{ bg, fg, dot }` style values
- `STATUS_LABEL` — French display strings for pill kinds

### `app/globals.css`
Tailwind v4 theme variables + all layout utilities. Key classes:

**Layout:**
- `.portal-layout` — flex row, full viewport height (use on every authenticated page root)
- `.portal-main` — flex-1 column, constrained overflow
- `.portal-scroll` — scrollable content area (wrap page body in this)
- `.panel-split` — two-panel horizontal layout (collapses to column on mobile)
- `.inner-nav` — left inner nav panel
- `.panel-right-fixed` — right fixed panel

**Sidebar:**
- `.sidebar` — 256px fixed-width column, slides in on mobile
- `.sidebar.open` — mobile open state (toggled by Sidebar component internally)
- `.sidebar-overlay` — dim overlay behind open sidebar on mobile
- `.mobile-nav` — sticky top bar with hamburger (hidden on desktop)

**Responsive grids:**
- `.grid-4` → 2-col at 1024px → 1-col at 600px
- `.grid-3` → 2-col at 900px → 1-col at 600px
- `.grid-2` → 1-col at 640px
- `.grid-pipeline` — 4-col import steps → 2-col at 640px

**Typography:**
- `.hero-xl` — clamp(40px, 8vw, 96px), weight 700, tracking -0.03em
- `.hero-lg` — clamp(32px, 6vw, 72px)
- `.hero-md` — clamp(28px, 4vw, 56px)
- `.section-title` — clamp(28px, 4vw, 44px)

**Utilities:**
- `.table-scroll` — horizontal overflow wrapper for tables
- `.section-head-row` — flex space-between row, stacks on ≤640px
- `.hide-mobile` — hidden at ≤640px
- `.hide-tablet` — hidden at ≤1024px
- `.pad-mobile` — padding override at ≤640px

**Breakpoints:** `≤640px` mobile · `≤768px` sidebar collapses · `≤1024px` tablet

## Components

### `components/ui/`

**`Btn`** — `variant: 'primary' | 'secondary' | 'ghost' | 'ghostDim'`; `size: 'sm' | 'md'`; `onDark` boolean flips color scheme for dark backgrounds; optional `icon` slot.

**`Card`** — wrapper with optional `onDark` and `padding` props.

**`Pill`** — `kind: PillKind`; optional `dot` boolean. Always import `PillKind` from `@/lib/disto`.

**`Eyebrow`** — uppercase label. Props: `color`, optional `as` (HTML tag), `style`. Used throughout for section labels and metadata.

**`SectionHead`** — section header with optional `num`, `eyebrow`, `title`, `subtitle`, and `right` slot. Renders with `.section-head-row`.

### `components/layout/`

**`Sidebar`** — `'use client'`. Props: `variant: 'agency' | 'client'`, `brand?: string`, `clientId?: string`. Uses `usePathname()` for active-link detection. Handles mobile toggle (open/close, overlay, Escape key) internally.

**`TopBar`** — `theme: 'light' | 'dark'`, `crumbs: string[]`, `right` slot. Uses `.topbar-crumbs`; hides non-final breadcrumbs at ≤640px.

## Styling conventions

All component styles are **inline styles using `C.*` tokens** — not Tailwind utility classes. CSS classes from `globals.css` handle layout structure and responsive behavior only. Never use raw hex strings or arbitrary Tailwind values in component files.

Standard authenticated page template:

```tsx
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function MyPage() {
  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" />
      <div className="portal-main">
        <TopBar theme="light" crumbs={['betula', 'Console', 'Section']} right={null} />
        <div className="portal-scroll" style={{ padding: '36px 40px' }}>
          {/* content */}
        </div>
      </div>
    </div>
  );
}
```

For dark (client portal) pages use `background: C.black, color: C.bone` and `theme="dark"`.

## Tailwind v4

Import with `@import "tailwindcss"` — **no `tailwind.config.js`**. Theme customization goes in `app/globals.css` inside `@theme`. Plugin is `@tailwindcss/postcss` (configured in `postcss.config.mjs`).

## `design/` folder

Reference/prototype only. Contains JSX screens (`design/screens/*.jsx`), design tokens (`design/styles/tokens.css`), and a component canvas (`design/design-canvas.jsx`). **Not imported by the app.** Use as visual reference when implementing a screen — not as source of truth for props or behavior.

## Localization

next-intl 4.x is installed but **not yet used** — all UI strings are hardcoded in French. Do not add `t()` calls or translation keys until i18n is explicitly wired up.
