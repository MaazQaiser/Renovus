# Design System

**Status:** Source of truth for all visual decisions
**Last updated:** 2026-08-30

> No component may introduce a colour, size, radius, shadow, or spacing value
> that is not defined here. If a new value is genuinely needed, add it to this
> file first, then use the token.

---

## 1. Brand foundation

Design direction is derived from the Renovus Capital brand
(<https://renovuscapital.com>). Tokens were taken from the live site on
2026-08-30 rather than invented. Confirmed computed values: body text
`#2F3843`, page wash `#E9F1F7`, typeface Open Sans. Headings in the product use
Fira Sans so the internal tool has a distinct editorial register without
leaving the brand family.

| Source finding | Value | How we use it |
| --- | --- | --- |
| Primary brand slate-blue | `#6990AD` | Accent family, selection, iconography, decorative rules |
| Brand charcoal | `#2F3843` | Primary actions, headings, sidebar |
| Deep ink | `#20242A` | Highest-contrast text, hover state for primary actions |
| Mid slate | `#586778` | Secondary text |
| Pale blue tint | `#E9F1F7` | Secondary surfaces, selected rows |
| Pale blue border | `#CEDFEB` | Accent borders |
| Signal yellow | `#FFF200` | Reserved, used sparingly as an emphasis rule only |
| Heading typeface | Fira Sans | Display / H1–H3 |
| Body typeface | Open Sans | Body, labels, captions, UI text |

### Design intent

The product should feel **premium, institutional, trustworthy, minimal,
intelligent, executive-friendly, enterprise-grade**.

Explicitly avoided: generic SaaS gradients, purple/blue "AI" aesthetics, neon,
heavy corner rounding, layered drop shadows, gaming or consumer-app visual
language, and decoration that does not improve usability.

We translate the brand into an internal enterprise tool. We do **not** copy the
marketing site's layout, photography treatment, or hero patterns.

---

## 2. Colour tokens

All colours are declared once as CSS custom properties in
`src/app/globals.css` and exposed to Tailwind via `@theme`. Components use the
semantic token, never the raw hex.

### 2.1 Semantic tokens

| Token | Light value | Usage |
| --- | --- | --- |
| `background` | `#F4F6F8` | Application page background |
| `surface` | `#FFFFFF` | Cards, panels, inputs, sheets |
| `surface-secondary` | `#E9F1F7` | Selected rows, subtle fills, inset panels |
| `surface-tertiary` | `#F7F9FB` | Table header rows, muted zones |
| `surface-inverse` | `#20242A` | Sidebar, inverse panels, tooltips |
| `border` | `#DDE3E9` | Default 1px border |
| `border-strong` | `#C0CAD4` | Emphasised dividers, input hover |
| `border-subtle` | `#EBEFF3` | Low-emphasis separators inside cards |
| `border-inverse` | `#39414C` | Dividers on inverse surfaces |
| `text-primary` | `#20242A` | Headings and primary body copy |
| `text-secondary` | `#586778` | Supporting copy, descriptions |
| `text-tertiary` | `#68737F` | Metadata, captions, placeholders |
| `text-inverse` | `#FFFFFF` | Text on inverse / accent surfaces |
| `text-disabled` | `#9AA4AE` | Disabled control labels |
| `accent` | `#3D6A8A` | Links, focus, selection, active nav, accent buttons |
| `accent-hover` | `#2F5570` | Accent hover |
| `accent-active` | `#24425A` | Accent pressed |
| `accent-muted` | `#6990AD` | Literal brand blue — icons, borders, decoration only |
| `accent-subtle` | `#E9F1F7` | Accent background wash |
| `accent-border` | `#CEDFEB` | Accent-tinted borders |
| `primary` | `#2F3843` | Primary button fill, sidebar base |
| `primary-hover` | `#20242A` | Primary button hover |
| `primary-active` | `#14171B` | Primary button pressed |
| `success` | `#1F7A5C` | Positive status text/icon |
| `success-subtle` | `#E7F3EE` | Positive background |
| `success-border` | `#BCDDD0` | Positive border |
| `warning` | `#9A6410` | Caution status text/icon |
| `warning-subtle` | `#FBF1E1` | Caution background |
| `warning-border` | `#E7D3AC` | Caution border |
| `error` | `#B3352A` | Destructive/error text/icon |
| `error-subtle` | `#FBEDEB` | Error background |
| `error-border` | `#EFC7C2` | Error border |
| `info` | `#1F6FAC` | Informational text/icon |
| `info-subtle` | `#E8F1F8` | Informational background |
| `info-border` | `#C2D9EA` | Informational border |
| `highlight` | `#FFF200` | Brand signal yellow. Emphasis rules only, never as a fill behind text |
| `focus-ring` | `#3D6A8A` | Focus outline colour |
| `overlay` | `rgba(20, 23, 27, 0.48)` | Modal / drawer scrim |

### 2.2 Contrast rationale

The literal brand blue `#6990AD` is **3.4:1** on white — below WCAG AA for text
and below 4.5:1 for white text on top of it. It is therefore reserved for
non-text roles (`accent-muted`). The interactive `accent` is a deepened
brand-derived blue `#3D6A8A` at **5.8:1** on white and **5.8:1** for white text
on it, so it is safe in both directions.

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `text-primary` on `surface` | 15.9:1 | AAA |
| `text-secondary` on `surface` | 5.8:1 | AA |
| `text-tertiary` on `surface` | 4.9:1 | AA |
| `text-inverse` on `primary` | 11.9:1 | AAA |
| `text-inverse` on `accent` | 5.8:1 | AA |
| `accent` on `surface` | 5.8:1 | AA |
| `error` on `error-subtle` | 6.0:1 | AA |

### 2.3 Priority / score colour mapping

Used by `PriorityBadge` and `OpportunityScore` so both agents read identically.

| Level | Token family |
| --- | --- |
| High / Critical | `error` |
| Medium | `warning` |
| Low | `info` |
| Complete / Suitable | `success` |
| Neutral / Not assessed | `border-strong` + `text-tertiary` |

### 2.4 Dark mode

Not in MVP scope. Tokens are structured so a dark theme can be added later by
overriding the custom properties under a `[data-theme="dark"]` selector. No
component may hardcode a light-mode-only value.

---

## 3. Typography

### 3.1 Families

| Role | Family | CSS variable |
| --- | --- | --- |
| Display & headings | Fira Sans | `--font-display` |
| Body & UI | Open Sans | `--font-sans` |
| Numeric / code | ui-monospace stack | `--font-mono` |

Both webfonts are loaded through `next/font/google` with `display: swap` and
subset `latin`, so there is no layout shift and no external render-blocking
request.

### 3.2 Scale

| Token | Family | Size | Line height | Weight | Letter spacing | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| `display` | Display | 40px | 44px | 600 | -0.02em | Login/marketing-weight headline, one per screen at most |
| `h1` | Display | 30px | 36px | 600 | -0.015em | Page title |
| `h2` | Display | 24px | 30px | 600 | -0.01em | Section title |
| `h3` | Display | 18px | 24px | 600 | -0.005em | Card title, subsection |
| `body` | Sans | 15px | 24px | 400 | 0 | Default paragraph and control text |
| `body-sm` | Sans | 13px | 20px | 400 | 0 | Dense UI, helper text |
| `label` | Sans | 13px | 16px | 600 | 0.005em | Form labels, table headers |
| `caption` | Sans | 12px | 16px | 400 | 0.01em | Metadata, timestamps |
| `overline` | Sans | 11px | 16px | 600 | 0.08em, uppercase | Eyebrow labels above titles |

Responsive: `display` steps down to 32/38 below `md`; `h1` steps down to 24/30
below `md`. No other size changes by breakpoint.

### 3.3 Rules

- One `h1` per page, rendered by `PageHeader`.
- Heading levels never skip (`h1` → `h2` → `h3`).
- Visual size and semantic level are decoupled: use the `Text`/`Heading`
  primitives' `as` prop when the correct semantic tag differs from the style.
- Body copy max measure is `65ch` for readability.

---

## 4. Spacing

4px base unit. Tailwind's default numeric scale is used, restricted to this set:

| Token | px | Typical use |
| --- | --- | --- |
| `1` | 4 | Icon-to-label gap, badge padding |
| `2` | 8 | Tight stack, chip padding |
| `3` | 12 | Control inner padding (vertical) |
| `4` | 16 | Default element gap, control inner padding (horizontal) |
| `5` | 20 | Card inner padding (compact) |
| `6` | 24 | Card inner padding (default), grid gutter |
| `8` | 32 | Group spacing inside a section |
| `10` | 40 | Section spacing |
| `12` | 48 | Large section spacing |
| `16` | 64 | Page top/bottom rhythm on large screens |
| `20` | 80 | Hero / empty-state vertical padding |

Values outside this set (e.g. `p-[13px]`, `gap-7`) are not permitted. Arbitrary
values are allowed only for layout primitives documented in section 8.

---

## 5. Radius

Deliberately tight. Enterprise, not consumer.

| Token | px | Usage |
| --- | --- | --- |
| `none` | 0 | Full-bleed dividers, table cells |
| `sm` | 2 | Badges, chips, checkboxes, small inputs |
| `md` | 4 | **Default.** Buttons, inputs, selects, textareas |
| `lg` | 6 | Cards, panels, dropzones |
| `xl` | 8 | Modals, drawers, large surfaces |
| `full` | 9999 | Avatars, status dots, pills only |

Nothing above `xl` except `full`. No `rounded-2xl`/`rounded-3xl`.

---

## 6. Elevation

Three levels only. Shadows are tinted with the ink colour, never pure black.

| Token | Value | Usage |
| --- | --- | --- |
| `shadow-sm` | `0 1px 2px 0 rgb(32 36 42 / 0.06)` | Resting cards that need separation from a tinted background |
| `shadow-md` | `0 2px 8px -1px rgb(32 36 42 / 0.08), 0 1px 3px -1px rgb(32 36 42 / 0.06)` | Hovered cards, dropdowns, popovers |
| `shadow-lg` | `0 12px 32px -8px rgb(32 36 42 / 0.16), 0 4px 8px -4px rgb(32 36 42 / 0.08)` | Modals, drawers only |

Default card treatment is **border, not shadow**. Shadow is added on hover for
interactive cards to signal affordance. Do not stack shadows.

---

## 7. Borders & focus

| Token | Value |
| --- | --- |
| Default width | `1px` |
| Emphasis width | `2px` (selected state, active tab underline) |
| Default colour | `border` |
| Hover colour | `border-strong` |
| Selected colour | `accent` |
| Error colour | `error` |

### Focus

A single, consistent focus treatment across every interactive element:

```css
outline: 2px solid var(--color-focus-ring);
outline-offset: 2px;
```

Applied via `focus-visible` only, so mouse users do not see rings. Focus is
never removed without an equivalent replacement. On inverse surfaces the ring
switches to `accent-border` for contrast.

---

## 8. Layout

| Token | Value | Notes |
| --- | --- | --- |
| Page max width | `1440px` | Outer bound of the app shell |
| Content max width | `1200px` | Default `PageContainer` measure |
| Narrow content width | `720px` | Forms, questionnaires, detail reading views |
| Prose measure | `65ch` | Long-form body copy |
| Sidebar width (expanded) | `264px` | Desktop |
| Sidebar width (collapsed) | `72px` | Icon-only rail, `lg` and up |
| Topbar height | `64px` | Fixed |
| Page padding | `24px` mobile / `32px` tablet / `40px` desktop | Horizontal and top |
| Card padding | `24px` default, `20px` compact | |
| Card grid gap | `16px` | |
| Section spacing | `40px` | Between `ContentSection`s |
| Auth panel width | `440px` | Login / forgot password card |

### Breakpoints

Tailwind defaults, used consistently:

| Name | Min width | Primary meaning here |
| --- | --- | --- |
| `sm` | 640px | Large phone |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small laptop — sidebar appears |
| `xl` | 1280px | Desktop — full sidebar, multi-column results |
| `2xl` | 1536px | Large desktop — content capped, gutters grow |

Desktop is the primary experience. Tablet and mobile are genuinely reflowed, not
scaled down. See `SCREENS.md` for per-screen responsive behaviour.

---

## 9. Motion

Restrained. Motion communicates state change; it does not entertain.

| Token | Duration | Easing | Usage |
| --- | --- | --- | --- |
| `fast` | 120ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover, focus, colour change |
| `base` | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Dropdowns, accordions, toasts |
| `slow` | 320ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Modals, drawers, page-level transitions |

Only `opacity`, `transform`, `color`, `background-color`, `border-color`, and
`box-shadow` are animated. All motion is disabled under
`prefers-reduced-motion: reduce`, which is enforced globally in `globals.css`.

---

## 10. Iconography

- Library: **lucide-react**.
- Default size `16px` inline with text, `20px` for control icons, `24px` for
  section/agent icons, `32px` for empty-state and agent-hub icons.
- Stroke width `1.75` (default `2` reads too heavy against Open Sans at small
  sizes; `1.5` reads too light on tinted backgrounds).
- Icons inherit `currentColor`. No multi-colour icons.
- Decorative icons get `aria-hidden="true"`; meaningful icons get an accessible
  label.

---

## 11. Density & control sizing

| Control size | Height | Padding X | Text | Usage |
| --- | --- | --- | --- | --- |
| `sm` | 32px | 12px | `body-sm` | Toolbars, table row actions, filters |
| `md` | 40px | 16px | `body-sm` | **Default.** Most buttons and inputs |
| `lg` | 48px | 20px | `body` | Primary page CTA, auth form |

Icon-only buttons are square at the same heights (32/40/48). Minimum touch
target on mobile is 44×44, achieved by using `md` or larger.

---

## 12. Token implementation

- CSS custom properties are declared on `:root` in `src/app/globals.css`.
- Tailwind v4 `@theme inline` maps them to utility classes
  (`bg-surface`, `text-secondary`, `border-border`, `rounded-lg`, …).
- Component variants are composed with `class-variance-authority`; conditional
  classes are merged with `tailwind-merge` via the `cn()` helper in
  `src/lib/cn.ts`.
- Any component needing a value not expressible as a token is a signal that this
  document is incomplete — update it here first.
