# Screens

**Status:** Source of truth for every screen
**Last updated:** 2026-08-30

> Document a screen here **before** implementing it. After implementation, keep
> this file in sync. Implementation status: `Specified` | `In progress` | `Built`.

---

## Shared conventions

| Concern | Rule |
| --- | --- |
| Auth | `/login` and `/forgot-password` use `AuthLayout`. All other routes use `AppShell` and require a session. |
| Heading | Exactly one `h1`, rendered by `PageHeader` (app) or the auth form heading. |
| Primary CTA | One obvious primary action per screen. |
| Width | Auth forms: `auth` (440px). Questionnaires / reading: `narrow` (720px). Hub / results: `default` (1200px). |
| Desktop | Primary experience. Sidebar visible from `lg`. |
| Tablet | Sidebar becomes a drawer. Cards drop to 2 then 1 column. |
| Mobile | Single column. Step indicator collapses. Sticky bottom actions on questionnaires. |

---

## 1. Login — Built

| Field | Value |
| --- | --- |
| Route | `/login` |
| Purpose | Authenticate before accessing any agent. |
| User | Operating partner, portfolio executive, platform admin. |
| Entry point | Direct URL; unauthenticated redirect from any protected route; logout. |
| Main content | Brand panel (desktop) + sign-in form: email, password, form-level alert. |
| Components | `AuthLayout`, `Logo`, `Heading`, `Text`, `FormField`, `Input`, `PasswordInput`, `Button`, `Alert` |
| Primary CTA | **Sign in** |
| Secondary actions | **Forgot password** → `/forgot-password` |
| States | Default; field validation; credentials error; deactivated account; 5-failure warning; submitting (`loading` on CTA); already-authenticated redirect. |
| Navigation | Success → `/agents`. Forgot password → `/forgot-password`. |
| Responsive | Split layout at `lg` (inverse brand panel + form). Below `lg`, stacked: logo, then form on `background`. Form is full-width up to 440px. |
| Data required | `src/data/users.ts` mock credentials. Session written via `storage.ts`. |
| Next screen | Agent Hub (`/agents`) |

Demo credentials are shown on the form so the prototype is usable without this file.

---

## 2. Forgot Password — Specified (route exists as a thin destination)

| Field | Value |
| --- | --- |
| Route | `/forgot-password` |
| Purpose | Request a password reset without disclosing whether an account exists. |
| User | Anyone who can reach `/login`. |
| Entry point | Login secondary action. |
| Main content | Email field. Generic success state after submit. |
| Components | `AuthLayout`, `Logo`, `Heading`, `Text`, `FormField`, `Input`, `Button`, `Alert`, `BackButton` |
| Primary CTA | **Send reset instructions** |
| Secondary actions | **Back to sign in** → `/login` |
| States | Default; empty/invalid email; submitting; generic success (always, if email is well-formed). |
| Navigation | Back / success link → `/login`. |
| Responsive | Same as Login. |
| Data required | None. No email is sent. |
| Next screen | Login |

A minimal implementation exists so Login’s secondary action does not 404. Full visual/QA pass waits for the next auth-screen instruction.

---

## 3. Agent Hub — Built

| Field | Value |
| --- | --- |
| Route | `/agents` |
| Purpose | Central listing of available agents. Find the right agent and launch it. |
| User | Authenticated user. |
| Entry point | Successful login; sidebar “AI Agents”; agent exit. |
| Layout | `AuthenticatedShell` → `AppShell` (sidebar + topbar) + `PageContainer` + header + `AgentGrid`. |
| Main content | Eyebrow **AI Agents**, heading **AI Agents**, short description, then a data-driven grid of `AgentCard`s from `src/data/agents.ts`. No agent names in page JSX. |
| Components | `AppShell`, `Sidebar`, `Topbar`, `PageHeader`, `PageContainer`, `AgentGrid`, `AgentCard`, `AgentIcon`, `AgentStatus`, `EmptyState`, `Skeleton`, `UserMenu` |
| Agent cards | Icon, name, description, **Available** status, **Launch agent** CTA. Whole card is one link when launchable. |
| Primary CTA | **Launch agent** on each available card. |
| Secondary actions | Logout (sidebar on desktop; topbar + drawer on smaller screens). |
| States | Ready (two cards); loading skeleton (`AgentGrid loading`); empty (`EmptyState` if `agents` is empty). No artificial delay. |
| Navigation | Assessment → `/agents/assessment` (overview). Offshoring → `/agents/offshoring` (route stub). |
| Responsive | 2 columns from `md`. 1 column below `md`. Sidebar drawer below `lg`. No horizontal scroll. |
| Data required | `src/data/agents.ts` |
| Next screen | Assessment Agent Overview (`/agents/assessment`). |

---

## 4. Assessment Agent (Conversational) — Built

| Field | Value |
| --- | --- |
| Route | `/agents/assessment` |
| Purpose | One continuous Sales Baseline conversation: company → routing (R1–R6) → funnel and/or relationship questions → completion. |
| User | Authenticated user from Agent Hub. |
| Entry point | Hub **Launch agent**. |
| Layout | `AppShell` + `PageContainer` (`narrow` 720). Breadcrumb: **AI Agents / Assessment Agent**. |
| Main content | `AssessmentChat`: transcript, in-chat company picks, quick picks, composer (text + mock speech), confidence when required, progress, review answers, start over. |
| Data | `src/data/salesAssessmentQuestions.ts` from `docs/Sales_Baseline_Information_Request.xlsx`. Companies from `companies.ts`. Session in `renovers:sales-assessment`. |
| Primary CTA | **Analyze assessment** on completion → `/agents/assessment/processing`. |
| Secondary | **Review answers**, **Start over**, free-text / speech on supported questions. |
| Progress | Routing `n of 6`; then `Funnel · n of 27` and/or `Relationship · n of 9`. |
| Resume | Refresh restores messages, answers, phase, and current question. |
| Next screen | Processing stub. |

Removed routes: `/company`, `/department`, `/questionnaire` (no longer used).

---

## 5. Assessment — Processing — Specified (route stub)

| Field | Value |
| --- | --- |
| Route | `/agents/assessment/processing` |
| Purpose | Placeholder after **Analyze assessment**. |
| Entry point | Conversation completion CTA. |
| Main content | Stub copy; back to conversation. |
| Primary CTA | None. |
| Secondary | **Back to assessment** → `/agents/assessment`. |
| Next screen | Results (not built). |

---

## 6. Assessment — Results — Specified

| Field | Value |
| --- | --- |
| Route | `/agents/assessment/results` |
| Purpose | Present identified AI opportunities. |
| Status | Not built. |

---

## 7. Assessment — Opportunity Details — Specified

| Field | Value |
| --- | --- |
| Route | `/agents/assessment/results/[opportunityId]` |
| Purpose | Full detail for one opportunity. |
| Status | Not built. |

---

## 8. (Removed) Wizard screens

Company selection, department selection, and questionnaire form routes were
replaced by the conversational Assessment Agent. Legacy wizard components under
`src/components/questions/` remain available for reuse but are not the primary UX.

---

## 9. Offshoring Agent (Conversational) — Built

| Field | Value |
| --- | --- |
| Route | `/agents/offshoring` |
| Purpose | One continuous conversation: company → payroll → discovery (3×3) → mock preview → value-creation → completion. |
| User | Authenticated user from Agent Hub. |
| Entry point | Hub **Launch agent**. |
| Layout | `AppShell` + narrow chat column (720). Breadcrumb: **AI Agents / Offshoring potential assessment**. |
| Main content | Chat transcript, company picks, payroll `FileUpload`, discovery prompts (quick picks + clarifications), mock heatmap preview, review answers, start over. |
| Data | Discovery bank in `src/data/offshoringQuestions.ts` from `docs/offshoring/references/discovery-questions.md`. Companies from `companies.ts`. Session in `renovers:offshoring`. |
| Primary CTA | **Analyze offshoring potential** on completion → `/agents/offshoring/processing`. |
| Secondary | **Review answers**, **Start over**, **Continue without a sheet**. |
| Resume | Refresh restores messages, answers, company, files, detected functions, tier, and current question. |
| Next screen | Processing stub. |

There is no separate overview, company, documents, or questionnaire route.
Scoring scripts and the tabbed HTML dashboard are out of scope for this increment.

---

## 10. Offshoring — Processing — Specified (route stub)

| Field | Value |
| --- | --- |
| Route | `/agents/offshoring/processing` |
| Purpose | Placeholder after **Analyze offshoring potential**. |
| Entry point | Conversation completion CTA. |
| Main content | Stub copy; back to conversation. |
| Primary CTA | None. |
| Secondary | **Back to offshoring** → `/agents/offshoring`. |
| Next screen | Results (not built). |

---

## 11. Offshoring — Results — Specified

| Field | Value |
| --- | --- |
| Route | `/agents/offshoring/results` |
| Purpose | Present identified offshore-suitable processes. |
| Status | Not built. |

---

## 12. Offshoring — Opportunity Details — Specified

| Field | Value |
| --- | --- |
| Route | `/agents/offshoring/results/[opportunityId]` |
| Purpose | Full detail for one process opportunity. |
| Status | Not built. |

---

## Root redirect

| Route | Behaviour |
| --- | --- |
| `/` | Authenticated → `/agents`. Unauthenticated → `/login`. |
