# QA

**Status:** Checklist run after every major screen
**Last updated:** 2026-08-30

A screen is not done until this list has been walked for that screen.

---

## 1. Visual

- [ ] Spacing uses only the scale in `DESIGN_SYSTEM.md` §4
- [ ] Typography uses only the type tokens; one `h1` per page
- [ ] Colours are semantic tokens — no raw hex in components
- [ ] Alignment is consistent (form labels, card grids, header actions)
- [ ] Radius / shadows match the controlled system
- [ ] Component variants match `COMPONENTS.md` (no one-off buttons)
- [ ] Desktop, tablet (`md`/`lg`), and mobile (`< md`) all checked

## 2. Functional

- [ ] Navigation reaches the documented next/previous screens
- [ ] Forms submit only when valid
- [ ] Validation copy matches `CONTENT.md`
- [ ] Save / resume works where specified
- [ ] Upload, processing, and results behave as specified (when those screens exist)
- [ ] Logout clears the session and returns to `/login`

## 3. UX states

Every interactive screen must show the relevant subset of:

| State | Check |
| --- | --- |
| Loading | Skeleton or spinner; no layout jump |
| Empty | `EmptyState` with a next action |
| Error | `Alert` / `ErrorState`; recoverable |
| Success | Confirmation without trapping the user |
| Disabled | Reason is obvious or tooltip-explained |
| Hover | Affordant, not decorative |
| Focus | Visible `focus-visible` ring; keyboard complete |
| Validation | Inline, on submit/next — not on first paint |

## 4. Technical

- [ ] No console errors or warnings on the happy path
- [ ] `npx tsc --noEmit` is clean
- [ ] `npm run lint` is clean
- [ ] No broken routes from this screen’s links
- [ ] No missing assets
- [ ] Session read happens after mount (no hydration mismatch)

## 5. Accessibility

- [ ] Semantic landmarks (`header`, `nav`, `main`)
- [ ] Keyboard: tab order, Enter to submit, Escape closes overlays
- [ ] Inputs have labels via `FormField`
- [ ] Buttons have accessible names
- [ ] Contrast meets the pairs in `DESIGN_SYSTEM.md` §2.2
- [ ] `prefers-reduced-motion` disables motion

---

## Screen log

| Screen | Date | Result | Notes |
| --- | --- | --- | --- |
| Login | 2026-08-30 | Passed | Empty fields, invalid email, deactivated account, happy path, logout, unauthenticated `/agents` redirect, mobile stacked layout |
| Agent Hub | 2026-08-30 | Passed | Login → hub; keyboard launch to `/agents/assessment`; Offshoring launches conversation; logout then `/agents` blocked; desktop 2-col; tablet 2-col + drawer; mobile 1-col |
| Assessment Overview | 2026-08-30 | Passed | Hub launch; Start → company stub; Back to agents; breadcrumb; default (no resume); injected draft resume + start over; desktop / tablet / mobile; no console or TS errors |
| Assessment Company Selection | 2026-08-30 | Passed | Overview → company; search by name/industry; empty search; clear restore; single select; Continue disabled/enabled; persist + department stub; Back; keyboard radios; desktop 3-col / tablet 2-col / mobile 1-col |
| Assessment Questionnaire | 2026-08-30 | Superseded | Replaced by conversational Assessment Agent |
| Assessment Conversation | 2026-08-30 | Passed | Hub → chat; company; R1–R6; routing paths; quick pick / text / speech mock / confidence; resume; Analyze → processing stub |
| Offshoring Conversation | 2026-08-30 | Passed | Hub → chat; company; skip payroll (Tier C); Let me pick clarification; R1–R3; mock preview/heatmap; value-creation skip; resume; Analyze → processing; Assessment unchanged |

---

## Assessment Agent Overview cases

| Case | Expected |
| --- | --- |
| Page load (authenticated) | `/agents/assessment` renders in `AppShell` with breadcrumb **AI Agents / Assessment Agent**. One `h1`: Identify opportunities for AI. |
| Page load (unauthenticated) | Redirect to `/login`. |
| Agent identity | `AgentIcon` matches the Hub Assessment card (clipboard-list, accent tint). Status **Available**. |
| Start assessment | Navigates to `/agents/assessment/company`. Does not open a questionnaire. |
| Back to agents | Navigates to `/agents`. |
| Breadcrumb | First item links to `/agents`. Current page is not a link. |
| Default resume | No **Assessment in progress** block unless `localStorage` contains an active Assessment run. |
| In-progress | When a real draft exists: company name, department name (if set), progress label, last updated, **Continue assessment**, **Start over**. |
| Start over | Confirm discards the draft and hides the resume card. Cancel keeps it. |
| Copy | No unlock/transform/empower language. No invented ROI, scores, or fake results. |
| Responsive | Desktop: hero + 2-col steps/outcomes from `lg`. Tablet: stacked sections, drawer sidebar. Mobile: stacked CTAs with 48px primary. |
| Loading / error | Missing `agent.overview` → `EmptyState`. No artificial loading delay. |
| Technical | `npx tsc --noEmit` clean; lint clean; no console errors; no mock data inside components. |

---

## Assessment — Portfolio Company Selection cases

| Case | Expected |
| --- | --- |
| Page load | `/agents/assessment/company` in `AppShell`. Breadcrumb **AI Agents / Assessment Agent / Company**. Progress shows Company current. One `h1`: Select a portfolio company. |
| Continue disabled | No selection → Continue disabled with reason “Select a portfolio company to continue”. |
| Select company | One card selected: accent border/wash, check indicator, `aria-checked="true"`. Continue enables. Selecting another card deselects the first. |
| Search by name | “Northbridge” leaves Northbridge Learning visible. |
| Search by industry | “Healthcare” leaves Helix and Summit Care. |
| Empty search | “zzz” → **No companies found** + supporting copy. Not a blank page. |
| Clear search | Clear control restores all eight companies. |
| Continue | Persists `companyId` on the Assessment run and navigates to `/agents/assessment/department`. |
| Back | Returns to `/agents/assessment` without clearing the session. Returning to company restores the stored selection. |
| Keyboard | Radiogroup is tabbable. Arrow keys move selection and focus. |
| Responsive | Desktop `xl`: 3 columns. Tablet `md`: 2 columns. Mobile: 1 column, full-width search, stacked CTAs. |
| Technical | No `any`. Companies only in `src/data/companies.ts`. No TS / lint / console errors. |

---

## Assessment — Questionnaire cases

| Case | Expected |
| --- | --- |
| Route | `/agents/assessment/questionnaire` in `AppShell`. Breadcrumb **AI Agents / Assessment Agent / Assessment**. One `h1`: Assessment. |
| Context | **Assessing** + selected company name + Sales. Not editable. |
| Progress | `AgentProgress`: Company and Department completed, Assessment current, Results upcoming. Questionnaire shows **Section n of 4** and **Question n of 11**. |
| Missing context | No company/department → EmptyState **Assessment context missing**. |
| Multiple choice | Options toggle independently. Selected state is visible. Entire row is the target. |
| Single choice | Only one option selected. Selecting another replaces the first. |
| Text | Single-line input; optional last question can be skipped. |
| Textarea | Multi-line input; required description cannot be empty whitespace. |
| Scale | Values 1–5 with Rarely / Constantly labels. One value selected. |
| Yes / No | Yes and No are mutually exclusive. **No** is a valid answer. |
| Required validation | Continue with no answer → inline error; focus on the first control. No `alert()`. |
| Continue | Valid answer advances to the next question. Answer is kept. |
| Back | Returns to the previous question with the prior answer intact. Q1 Back → department stub. |
| Persistence | Refresh restores answers and the last question. Sidebar navigation away and back keeps answers. |
| Resume | Unfinished Sales assessment for the selected company reopens at `currentQuestionId`. |
| Submit | Last CTA is **Submit assessment**. All required valid → `/agents/assessment/processing` stub. Results are not shown. |
| Processing stub | Heading **Analyzing responses**. Back returns to the questionnaire with answers intact. |
| Responsive | Desktop: narrow centered column. Tablet: readable width. Mobile: stacked options, sticky actions, 48px-class targets. |
| Keyboard | Options, scale, yes/no, text, and CTAs are reachable. Focus ring visible. Errors announced (`role="alert"`). |
| Technical | No `any`. Questions only in `src/data/assessmentQuestions.ts`. No questions hardcoded in JSX. `npx tsc --noEmit` clean. Lint clean. No console errors. |

---

## Assessment Conversation cases

| Case | Expected |
| --- | --- |
| Entry | Hub Launch → `/agents/assessment` opens chat with intro + company prompt. |
| Company | Selecting a company adds a user message and continues to R1. No route change. |
| Routing | R1–R6 from the Excel workbook. Progress shows Routing · n of 6. |
| Path | After R6, natural path intro; Funnel / Relationship / Both per workbook rules. |
| Quick pick | Single-choice submits immediately (unless confidence required). |
| Multiple choice | Toggle options + Continue. |
| Free text / speech | Composer accepts typed or mock-transcribed answers; user edits before send. |
| Confidence | Shown only when `asksConfidence` is true. |
| Clarification | Deterministic follow-up for referral-style answers. |
| Review | Review answers opens prior Q&A; Edit jumps without restarting. |
| Resume | Refresh restores transcript and position. |
| Complete | Analyze assessment → `/agents/assessment/processing` stub. |
| Technical | No `any`. Questions in `salesAssessmentQuestions.ts`. tsc + lint clean. |

---

## Offshoring Conversation cases

| Case | Expected |
| --- | --- |
| Entry | Hub Launch → `/agents/offshoring` opens chat with intro + company prompt. |
| Company | Selecting a company adds a user message and asks for the payroll sheet. No route change. |
| Payroll | Dropzone accepts PDF / Word / Excel / CSV / PowerPoint / TXT up to 25 MB. Progress simulates, then **Continue**. |
| Reject | Wrong type, oversized, or 11th file shows inline copy from CONTENT.md and is not attached. |
| Skip | **Continue without a sheet** sets Tier C and starts Round 1. |
| Round 1 | Scope (with sector-seeded functions), sector/hold stage, headcount (Tier A/B or C). |
| Round 2 | Offshore cost %, transition assumptions, hard constraints (multi-select). |
| Preview | After Round 2, mock headline numbers + function heatmap appear before Round 3. |
| Round 3 | Heatmap sanity, headline scenario, model/audience. |
| Value-creation | Optional EBITDA/revenue/multiple; skip allowed. |
| Follow-ups | “Let me pick” and constraint follow-ups collect clarification before advancing. |
| Review | Review answers opens prior Q&A; Edit jumps without restarting. |
| Resume | Refresh restores transcript, company, files, detected functions, tier, and position. |
| Complete | Analyze offshoring potential → `/agents/offshoring/processing` stub. |
| Technical | No `any`. Discovery from playbook. tsc + lint clean. |
