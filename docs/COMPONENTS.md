# Component System

**Status:** Source of truth for component APIs and reuse rules
**Last updated:** 2026-08-30

---

## 1. The component rule

> **If the same UI pattern appears twice, make it reusable.**
> **If a component is likely to be reused by another agent, make it generic.**

Agent-prefixed variants of a shared pattern are prohibited.

```text
✗ AssessmentQuestionCard   ✗ OffshoringQuestionCard
✓ QuestionCard             — configured by props and question data
```

Before building anything new:

1. Check this file for an existing component.
2. Check `DESIGN_SYSTEM.md` for an existing token.
3. Only then add something new — and document it here in the same change.

---

## 2. Conventions

| Concern | Convention |
| --- | --- |
| Location | `src/components/<category>/<ComponentName>.tsx` |
| Export | Named export, one primary component per file |
| Barrel | Each category has an `index.ts` re-exporting its public surface |
| Props type | `export interface <ComponentName>Props` |
| Styling | Tailwind token utilities only, composed with `cn()` |
| Variants | `class-variance-authority` (`cva`) for anything with 2+ visual variants |
| Class override | Every component accepts `className`, merged last via `cn()` |
| DOM passthrough | Primitives extend the matching `React.ComponentProps<'element'>` |
| Refs | React 19 — `ref` is a normal prop, no `forwardRef` |
| Client boundary | `"use client"` only where interactivity or hooks are required |
| Icons | Passed as `LucideIcon` component references, never as rendered JSX |
| Booleans | Prefer explicit unions (`status="error"`) over boolean soup (`isError`) |
| Next.js 16 | `PageProps<'/route'>` / `LayoutProps<'/route'>` — `params` and `searchParams` are Promises (`await` or `use()`). Client dynamic routes may use `useParams()` instead. Wrap any `useSearchParams` usage in `<Suspense>`. Route-group folders are omitted from the typed path. `typedRoutes` is on — `href` must be a known route. |

### `cn()`

`src/lib/cn.ts` — `clsx` for conditionals, `tailwind-merge` to resolve conflicts
so a caller's `className` always wins.

---

## 3. Categories

```text
src/components/
  primitives/   Button, IconButton, ButtonGroup, Badge, Card, Divider,
                Heading, Text, Spinner, Tooltip, VisuallyHidden
  layout/       AppShell, AuthLayout, Sidebar, Topbar, PageHeader, PageContainer,
                ContentSection
  navigation/   NavItem, Breadcrumb, BackButton, UserMenu
  forms/        FormField, Input, PasswordInput, Textarea, Select, MultiSelect,
                Checkbox, Radio, RadioGroup, FormSection, SearchInput
  feedback/     Alert, Toast/ToastProvider, EmptyState, ErrorState, LoadingState,
                Skeleton, ProcessingState
  overlay/      Modal, ConfirmationDialog, Drawer
  agents/       AgentCard, AgentGrid, AgentIcon, AgentStatus, AgentHeader,
                AgentOverview, AgentStepList, AgentProgress, OutcomeList,
                OutcomeCard, InProgressRunCard, InProgressPanel,
                AgentStepIndicator
  companies/    CompanyAvatar, CompanyCard, CompanyGrid, CompanySelector
  questions/    Questionnaire, QuestionnaireSection, QuestionRenderer
                (QuestionCard alias), QuestionOption, SingleChoice,
                MultipleChoice, TextInput, TextareaInput, Scale, YesNo,
                QuestionError, QuestionNavigation, QuestionProgress
  assessment/   ProgressBar, StepNavigation, AssessmentSummary
  files/        FileUpload, FileDropzone, FileItem, UploadProgress
  results/      ResultCard, OpportunityCard, OpportunityScore, PriorityBadge,
                ResultSummary, DetailPanel
  brand/        Logo, Wordmark
```

Build status legend: **Built** = implemented and in use. **Specified** = API
agreed here, implemented when its first consuming screen is built.

---

## 4. Primitives

### `Button` — Built

The single button implementation. There is no second button component.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'link'` | `'primary'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 32 / 40 / 48px |
| `loading` | `boolean` | `false` | Shows `Spinner`, sets `aria-busy`, blocks clicks |
| `disabled` | `boolean` | `false` | |
| `leadingIcon` | `LucideIcon` | — | |
| `trailingIcon` | `LucideIcon` | — | |
| `fullWidth` | `boolean` | `false` | |
| `as` | `'button' \| 'a'` | `'button'` | `a` renders via `Link` when `href` is set |

Rules: exactly one `primary` button per screen region. Loading preserves the
button's width so layout does not jump. Disabled buttons keep a
tooltip-explainable reason where the reason is not obvious.

| Variant | Resting | Hover | Use |
| --- | --- | --- | --- |
| `primary` | `bg-primary` / `text-inverse` | `bg-primary-hover` | The one main action |
| `secondary` | `bg-surface` / `border` / `text-primary` | `bg-surface-tertiary`, `border-strong` | Secondary actions |
| `ghost` | transparent / `text-secondary` | `bg-surface-secondary` | Tertiary, toolbars |
| `danger` | `bg-error` / `text-inverse` | darkened | Destructive confirm only |
| `link` | transparent / `text-accent`, underline on hover | `text-accent-hover` | Inline navigation |

### `IconButton` — Built

Square button, icon only. Same variants/sizes as `Button`. **`label` is
required** and becomes `aria-label` plus the tooltip text.

### `ButtonGroup` — Built

Horizontal group with consistent gap and responsive stacking.
Props: `align` (`start | end | between`), `stackOn` (`sm | md | none`),
`reverseOnStack` (keeps the primary action first on mobile).

### `Badge` — Built

Props: `tone` (`neutral | accent | success | warning | error | info`),
`variant` (`subtle | solid | outline`), `size` (`sm | md`), `icon`, `dot`.

`PriorityBadge` and `AgentStatus` are thin wrappers that map domain values onto
`Badge` tones. They add no new styling.

### `Card` — Built

Props: `as`, `padding` (`none | compact | default`), `interactive`, `selected`,
`tone` (`default | subtle | inverse`), `href`/`onClick`.

`interactive` adds hover border + `shadow-md`, a focus ring, and correct
semantics (renders as a link or a button, never a `div` with a click handler).
`selected` applies the `accent` 2px border used by every selection surface in the
product.

### `Heading` / `Text` — Built

Decouple semantics from style.
`Heading`: `level` (1–4, the rendered tag), `size` (`display | h1 | h2 | h3`),
`tone`. `Text`: `size` (`body | body-sm | label | caption | overline`), `tone`
(`primary | secondary | tertiary | inverse | accent | success | warning |
error`), `weight`, `as`, `clamp`.

### `Spinner`, `Divider`, `Tooltip`, `VisuallyHidden` — Built

`Spinner`: `size` (`sm | md | lg`), `tone`. `role="status"` with a label.
`Divider`: `orientation`, `tone`, optional `label`.
`Tooltip`: keyboard-accessible, `side`, delay, escape to dismiss.

---

## 5. Layout — Built

### `AppShell`

Composes `Sidebar` + `Topbar` + main region. Owns the responsive sidebar state
(drawer under `lg`, rail/expanded at `lg`+) and the skip-to-content link.
Props: `children`, `sidebar` (override for agent-scoped navigation).

### `AuthLayout` — Built

Unauthenticated chrome for Login and Forgot password. Desktop (`lg+`): inverse
brand panel + form column. Below `lg`: stacked logo and form on `background`.
Props: `children`, `title` (document), optional `footer`.

### `Sidebar`

Renders navigation from configuration, not hardcoded JSX. Inverse surface
(`surface-inverse`). Props: `items` (`NavItemConfig[]`), `collapsed`,
`onCollapsedChange`, `footer`.

### `Topbar`

Fixed 64px. Contains mobile menu toggle and `Breadcrumb` (desktop). `UserMenu`
appears here only below `lg`; desktop account controls live in the sidebar
footer.

### `PageHeader`

The only place an `h1` is rendered. Props: `eyebrow`, `title`, `description`,
`breadcrumb`, `backHref`, `actions`, `meta`.

### `PageContainer`

Applies max width and page padding. Props: `width`
(`default 1200 | narrow 720 | full`), `padded`.

### `ContentSection`

A titled block within a page. Props: `title`, `description`, `actions`,
`headingLevel`, `divided`, `children`. Provides the 40px section rhythm so pages
never hand-roll vertical spacing.

---

## 6. Navigation — Built

- **`NavItem`** — `href`, `label`, `icon`, `active`, `badge`, `collapsed`,
  `disabled`. Marks the current item with `aria-current="page"`.
- **`Breadcrumb`** — `items: { label, href? }[]`, `maxItems` (collapses the
  middle with an ellipsis). Rendered as `nav > ol`.
- **`BackButton`** — `href` or `onClick`, `label` (default "Back").
- **`UserMenu`** — `placement` (`topbar \| sidebar`), `collapsed`. Avatar,
  name, email, logout. Opens `ConfirmationDialog` for logout.

---

## 7. Forms — Built

### `FormField`

The wrapper that owns label, description, error, and required marker for **every**
control. Controls never render their own `<label>`.

| Prop | Type | Notes |
| --- | --- | --- |
| `label` | `string` | |
| `htmlFor` | `string` | Wired to the control `id` |
| `description` | `ReactNode` | Rendered above the control |
| `error` | `string` | Sets error styling and `aria-describedby` |
| `hint` | `ReactNode` | Below the control, hidden while an error shows |
| `required` | `boolean` | Renders the required marker |
| `optionalLabel` | `boolean` | Marks optional instead, for mostly-optional forms |

Accessibility contract: `FormField` generates the ids and passes
`aria-describedby` / `aria-invalid` down through a context, so a control only
needs `id`.

### Controls

| Component | Notes |
| --- | --- |
| `Input` | `size`, `leadingIcon`, `trailingIcon`, `invalid`, `type` |
| `PasswordInput` | `Input` + visibility toggle (`IconButton`, `aria-pressed`), optional `strength` meter |
| `Textarea` | `rows`, `maxLength` with live counter, `autoResize` |
| `Select` | Native `<select>` with a custom chevron — reliable keyboard/mobile behaviour |
| `MultiSelect` | Listbox with checkboxes, chips for selection, typeahead filter |
| `Checkbox` / `Radio` | Custom visual on a real input, 20px hit box inside a 44px target |
| `RadioGroup` | `role="radiogroup"`, arrow-key roving focus |
| `SearchInput` | **Built.** `Input` + search icon + clear button. Label via `FormField`. Filters immediately through controlled `value` / `onChange`. Optional `onDebouncedChange`. |
| `FormSection` | Titled group of fields, `columns` (1 or 2) |

All controls: 40px default height, `md` radius, `border` resting,
`border-strong` hover, `accent` + focus ring on focus, `error` when invalid.

---

## 8. Feedback — Built

| Component | API |
| --- | --- |
| `Alert` | `tone`, `title`, `children`, `icon`, `onDismiss`, `action`. `role="alert"` for error/warning |
| `ToastProvider` / `useToast` | `toast({ tone, title, description, duration })`. Bottom-right desktop, top mobile. `aria-live="polite"`, auto-dismiss pausable on hover/focus |
| `EmptyState` | `icon`, `title`, `description`, `action`, `secondaryAction`, `size` |
| `ErrorState` | `title`, `description`, `onRetry`, `detail` (collapsible) |
| `LoadingState` | `label`, `size`, `variant` (`spinner \| skeleton`) |
| `Skeleton` | `variant` (`text \| circle \| rect`), `width`, `height`, `lines` |
| `ProcessingState` | **Specified.** `stages: { id, label }[]`, `activeStageIndex`, `onCancel`. The shared mock-AI screen for both agents |

Every list/collection surface must specify its empty, loading, and error state
before it is considered done.

---

## 9. Overlay — Built

- **`Modal`** — `open`, `onOpenChange`, `title`, `description`, `size`
  (`sm | md | lg`), `footer`, `dismissible`. Focus trap, restore focus on close,
  `Escape` to close, scrim click to close when dismissible, body scroll lock,
  `role="dialog"` + `aria-modal`. Full-screen sheet below `sm`.
- **`ConfirmationDialog`** — wraps `Modal`. `tone` (`default | danger`),
  `confirmLabel`, `cancelLabel`, `onConfirm`, `loading`. Focus starts on the
  cancel action for `danger`.
- **`Drawer`** — `side` (`right | left`), `size`. Same a11y contract as `Modal`.
  Used for `DetailPanel` on desktop; becomes a full page on mobile.

---

## 10. Agents

| Component | Status | API |
| --- | --- | --- |
| `AgentCard` | **Built** | `name`, `description`, `status`, `icon` (name or Lucide), `href`. Does not know Assessment or Offshoring. Whole card is one link when launchable. |
| `AgentGrid` | **Built** | `agents`, `loading`. Maps config → `AgentCard`. Empty and skeleton states live here. 1 column / 2 columns from `md`. |
| `AgentIcon` | **Built** | `name` and/or `icon`, `size` (`sm \| md \| lg`). Tinted container + lucide glyph via `src/lib/icons.ts`. Shared identity for Hub cards and agent overviews. |
| `AgentStatus` | **Built** | `status` → `Badge`. Labels: Available, Beta, Coming soon, Maintenance. |
| `AgentHeader` | **Built** | Overview hero: `icon`, `eyebrow`, `title` (`h1`), `description`, `status`, `actions`. Same icon language as `AgentCard`. Used on agent overview screens, not as a second `PageHeader`. |
| `AgentOverview` | **Built** | Composes header, about, `AgentStepList`, `OutcomeList`, and `InProgressPanel` from `agent.overview`. Knows no Assessment-specific JSX. |
| `AgentStepList` | **Built** | `steps: { id, title, description }[]`. Numbered 01… process list. Reused by any agent overview — not named `AssessmentSteps`. |
| `OutcomeList` / `OutcomeCard` | **Built** | `items: { id, label }[]`. Compact outcome rows. No scores, percentages, or ROI. |
| `InProgressRunCard` | **Built** | Generic resume card: title, optional company/department, progress, last updated, continue href, optional start-over. |
| `InProgressPanel` | **Built** | Client island. Reads `listRuns()`, resolves company/department names, shows `InProgressRunCard` only when an active run exists. Owns start-over confirm. |
| `AgentProgress` | **Built** | `steps: { id, label }[]`, `currentStepId`, `completedStepIds`. Compact workflow indicator. Current step is emphasized; upcoming steps stay visible and inactive. Used by Assessment now; Offshoring will pass a different step list. Not named `AssessmentProgress`. |
| `RunContext` | **Built** | Read-only context banner: `eyebrow` (default **Assessing**), `title` (company), `meta` (department). Not editable. |
| `AgentStepIndicator` | Specified | Interactive stepper (`onStepSelect`) for later workflow screens if jump-to-step is required. `AgentProgress` is the display-only indicator. |

---

## 11. Portfolio companies — Built

| Component | API |
| --- | --- |
| `CompanyAvatar` | `company`, `size` (`sm \| md \| lg`). Initials on a deterministic tinted background. Logo not used in MVP. |
| `CompanyCard` | `company`, `selected`, `onSelect`. Renders as `role="radio"` with `aria-checked`. Selected state: accent border + wash, check indicator, and a visually hidden “Selected” label. Does not show financials. |
| `CompanyGrid` | `companies`, `selectedId`, `onSelect`, `loading`, `error`, empty copy. 1 / 2 (`md`) / 3 (`xl`) columns. Arrow-key roving focus inside `role="radiogroup"`. |
| `CompanySelector` | `companies`, `value`, `onChange`, `loading`, `error`. Owns `SearchInput` + filter + `CompanyGrid`. Reused by any agent that needs a company pick. |

### Selected state

Shared `Card` treatment: `border-accent`, `bg-accent-subtle`, inset accent ring (2px emphasis without layout shift), plus a non-color check indicator on `CompanyCard`. Hover does not replace the selected border.

---

## 12. Assessment chat — Built

Enterprise conversational UI under `src/components/assessment/chat/`.

| Component | Notes |
| --- | --- |
| `AssessmentChat` | Full-height shell: scrolling transcript + docked bottom response area |
| `ChatHeader` | Legacy; assessment title/badges/actions now live in Topbar |
| `ChatMessage` / `AgentMessage` / `UserMessage` | Agent: flat text; user: strong accent pill |
| `CompanySelectionPrompt` | Letter-keyed company picks + add new company |
| `QuestionPrompt` | Bottom-dock controls: A/B/C/D chips, confidence, free-text. Accepts any `PromptQuestion` |
| `QuickPick` / `QuickPickGroup` | Lettered options (A, B, C…) plus optional free-text |
| `ChatComposer` | Fixed-height bar: input + mic + send (mic left of send) |
| `SpeechInput` | Idle → listening → transcribing → editable transcript |
| `ConfidenceSelector` | Compact A/E/G/N/X chips; defaults to Estimate; shown after an answer |
| `AssessmentProgress` | Available helper; progress label removed from chat chrome |
| `TypingIndicator` | Brief pause between agent turns |
| `ReviewAnswersPanel` | Right `Drawer` to jump/edit prior answers. Generic: `answers` + `getQuestion` |

Legacy form questionnaire components in `src/components/questions/` remain but
are not the Assessment primary UX.

### Still specified (later)

| Component | API |
| --- | --- |
| `ProgressBar` | `value`, `max`, `label` |
| `AssessmentSummary` | Read-only review before submit |

---

## 13. Files — Built

Used first by the Offshoring conversation payroll step. Generic — no agent name.

| Component | Notes |
| --- | --- |
| `FileDropzone` | `onFilesAdded`, `accept`, `maxSize`, `maxFiles`, `disabled`, `label`, `activeLabel`. Drag state, click-to-browse, keyboard-activatable, hidden `<input type="file">` |
| `FileItem` | `file: UploadedFile`, `onRemove`. Type icon, name, size, status |
| `UploadProgress` | `progress`, `status` — simulated per-file progress bar |
| `FileUpload` | Composition of the three; owns list state, validation, simulated upload. `files`, `onChange`, `rejections` |

Rejection copy lives in `CONTENT.md`. Limits in `src/types/file.ts`.

---

## 14. Results — Specified (Phases 3 & 4)

Both agents share these. Differences are expressed as data, not components.

| Component | API |
| --- | --- |
| `ResultSummary` | `metrics: { label, value, tone?, hint? }[]`. The stat band above any result list |
| `ResultCard` | Generic result container: `title`, `description`, `meta`, `badges`, `href` |
| `OpportunityCard` | `opportunity: Opportunity`, `href`. Title, problem/description, badges, score |
| `OpportunityScore` | `value` 0–100, `label`, `size`, `variant` (`bar \| ring \| inline`) |
| `PriorityBadge` | `level: PriorityLevel` → `Badge` with the mapping in `DESIGN_SYSTEM.md` §2.3 |
| `DetailPanel` | `title`, `sections: { title, content }[]`, `actions`. Drawer on desktop, page on mobile |

The Offshoring agent's "suitability / complexity / impact" and the Assessment
agent's "priority / impact" both map onto `PriorityBadge` + `OpportunityScore`.
No agent-specific result components.

---

## 15. Brand — Built

- **`Logo`** — `variant` (`mark | wordmark | lockup`), `tone` (`default |
  inverse`), `size`. Inline SVG, `currentColor`, no image request.

---

## 16. Anti-patterns

| Don't | Do |
| --- | --- |
| `<div onClick>` | `Card interactive`, `Button`, or a real `<a>` |
| Raw hex or `text-[#20242A]` | Semantic token utility |
| `AssessmentX` / `OffshoringX` twins | One generic component + props |
| Question rendering in a page component | `QuestionCard` driven by data |
| Mock data inside a page | `src/data/*` |
| A page component over ~150 lines | Extract into `_components/` beside the route |
| New `<label>` inside a control | `FormField` |
| `useEffect` for derived state | Compute during render |
