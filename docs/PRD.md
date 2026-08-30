# Renovers AI Agent Platform — PRD

**Version:** V1.0
**Phase:** MVP
**Status:** Source of truth for all product requirements
**Last updated:** 2026-08-30

> This document is authoritative. No screen, component, or interaction may be
> built that is not traceable to a requirement in this file. If a requirement
> needs to change, change it here **first**, record it in `CHANGELOG.md`, and
> only then change the implementation.

---

## 1. Product Overview

Renovers needs a centralized AI agent platform where users can access and run
different specialized agents for portfolio companies.

The platform launches with two agents:

- **Assessment Agent** — identifies AI opportunities through a structured
  questionnaire.
- **Offshoring Agent** — identifies processes that may be suitable for
  offshoring using company information, documents, and questionnaire responses.

The platform must be designed so additional agents can be added later **without
changing the core product structure**.

### 1.1 Users

| User | Description | Primary need |
| --- | --- | --- |
| Operating Partner | Renovus operating team member working with portfolio companies | Run assessments across companies and surface opportunities |
| Portfolio Company Executive | Executive at a portfolio company | Complete assessments for their department |
| Platform Admin | Renovus internal | Access all agents and all companies |

For the MVP the application does not differentiate permissions by role. Role is
displayed in the UI (Topbar / user menu) but does not gate functionality.

### 1.2 Non-goals for MVP

- No real backend, database, or server-side persistence.
- No real authentication or authorization provider.
- No real AI/LLM API calls. AI analysis is simulated.
- No multi-tenant administration, billing, or user management screens.
- No agent history/reporting dashboards beyond what is listed in section 12.

---

## 2. Product Structure

```text
Renovers
│
├── Login
│
└── Agent Hub
     │
     ├── Assessment Agent
     │    └── Questionnaire
     │         └── AI Analysis
     │              └── AI Opportunities
     │
     └── Offshoring Agent
          └── Company Information
               ├── Documents
               └── Questionnaire
                    └── AI Analysis
                         └── Offshoring Opportunities
```

---

## 3. Authentication

Users must authenticate before accessing the platform.

### 3.1 Requirements

- Login screen
- Email field
- Password field
- Sign in action
- Forgot password
- Authentication / error states
- Logout

After successful login, users land on the **Agent Hub**.

### 3.2 MVP behaviour (frontend-only)

Authentication is mocked. Credentials are validated against a local mock user
list (`src/data/users.ts`). Session is stored in `localStorage` and hydrated by a
client-side session provider.

| Rule | Behaviour |
| --- | --- |
| Empty email | Inline field error: "Enter your work email address." |
| Malformed email | Inline field error: "Enter a valid email address." |
| Empty password | Inline field error: "Enter your password." |
| Unknown email or wrong password | Form-level error alert: "The email or password you entered is incorrect." |
| Valid credentials | Redirect to `/agents` |
| Deactivated mock user | Form-level error alert: "This account has been deactivated. Contact your Renovus administrator." |
| 5 consecutive failures | Form-level warning alert advising password reset. Form is **not** hard-locked (MVP). |

Password is never persisted. Only a redacted session record is stored.

### 3.3 Route protection

All routes other than `/login` and `/forgot-password` require a session.
Unauthenticated access redirects to `/login`. Authenticated users visiting
`/login` are redirected to `/agents`.

### 3.4 Forgot password

Single-field email form. On submit, always shows a **generic success state**
("If an account exists for that address, we've sent reset instructions.") so the
UI does not disclose whether an account exists. No email is actually sent.

### 3.5 Logout

Available from the Topbar user menu. Opens a confirmation dialog. On confirm,
clears the session and any in-progress agent run drafts flagged as
session-scoped, then redirects to `/login`.

---

## 4. Agent Hub

The Agent Hub is the centralized home for all Renovers agents. It provides a
clear listing of available agents.

### 4.1 Agent Card

Each agent displays:

- Agent name
- Short description
- Purpose
- Status / availability
- CTA to launch agent

### 4.2 Initial agents

**Assessment Agent**
> Identify AI opportunities across portfolio companies through structured
> assessments.

**Offshoring Agent**
> Identify business processes that may be suitable for offshoring.

### 4.3 Agent status values

| Status | Meaning | CTA behaviour |
| --- | --- | --- |
| `available` | Agent is ready to run | "Launch agent" — enabled |
| `beta` | Usable, flagged as early access | "Launch agent" — enabled, badge shown |
| `coming-soon` | Configured but not yet built | CTA disabled, "Coming soon" badge |
| `maintenance` | Temporarily unavailable | CTA disabled, "Unavailable" badge |

### 4.4 Future agents

The hub must support adding agents such as Finance, Operations, Marketing, HR,
and Due Diligence **without redesigning the Agent Hub**. Those agents are not
listed in this increment. Adding one later is a configuration change in
`src/data/agents.ts`, not a Hub redesign.

### 4.5 Architectural requirement

> **The Agent Hub must be scalable.**

Adding a new agent should primarily require:

```text
New Agent → Agent Configuration → Agent-specific Input → Agent-specific AI Analysis → Agent Results
```

rather than building a completely new product. The Hub renders entirely from
`src/data/agents.ts`. No agent is referenced by name in Hub JSX.

---

## 5. Assessment Agent

A questionnaire-driven AI assessment experience. Its purpose is to understand how
a portfolio company operates and identify areas where AI can create value.

### 5.1 Flow

```text
Launch Assessment Agent
        ↓
Assessment Conversation (/agents/assessment)
        ↓
Company selection (in chat)
        ↓
Sales routing questions (R1–R6)
        ↓
Funnel / Relationship / Both path
        ↓
Assessment complete
        ↓
AI Analysis
        ↓
Report
```

### 5.2 Conversational assessment

Company selection, routing, and sales baseline questions happen inside one
chat experience at `/agents/assessment`. There are no separate company,
department, or questionnaire routes.

Questions are sourced from `docs/Sales_Baseline_Information_Request.xlsx`
and authored in `src/data/salesAssessmentQuestions.ts`.

Routing (R1–R6) determines Funnel-led, Relationship-led, or Both using the
workbook rules. The user never sees technical routing language.

### 5.3 Department

This prototype is Sales-only. Department is fixed to Sales inside the session.

---

## 6. Assessment Conversation

The conversation is the primary input for the Assessment Agent.

### 6.1 Requirements

- Questions grouped into sections
- Multiple question types
- Required / optional questions
- Progress indicator
- Save progress
- Previous / Next navigation
- Submit assessment
- Validation

### 6.2 Supported question types

`single-choice`, `multiple-choice`, `text`, `textarea`, `scale`, `yes-no`.

### 6.3 Configurability

Questions must not be hardcoded into individual screens. The questionnaire is
structured data (`src/data/assessmentQuestions.ts`) and is rendered by generic
components. Changing or expanding the questionnaire must not require rebuilding
the agent experience.

### 6.4 Validation rules

- Required questions must be answered before advancing past their section.
- Validation runs on "Next" and on "Submit", not on first render.
- Invalid questions are marked inline; the first invalid question is focused and
  scrolled into view.
- A section-level summary states how many required questions remain.

### 6.5 Save / resume

- Answers are written to `localStorage` on change (debounced) and on navigation.
- An explicit "Save progress" action gives the user visible confirmation.
- Returning to the agent with a saved draft offers **Resume** or **Start over**.
- Drafts are keyed by `agentId + companyId + departmentId`.

---

## 7. Assessment AI Analysis

Once the questionnaire is submitted, the AI analyzes the responses.

The analysis identifies:

- Current processes
- Pain points
- Manual activities
- Repetitive tasks
- AI opportunities
- Potential automation opportunities

### 7.1 Processing state

A dedicated processing screen shows staged progress with named analysis steps.
Simulated duration is 6–9 seconds. The user may not navigate forward until it
completes; cancelling returns to the questionnaire with answers intact.

### 7.2 Output

A structured list of identified AI opportunities.

**Example**

> **AI Opportunity:** Automated Lead Research
> **Problem:** Sales representatives manually research prospects.
> **Potential Solution:** AI-powered lead research and enrichment.
> **Priority:** High
> **Potential Impact:** High

---

## 8. Offshoring Agent

Purpose: identify **which business processes could potentially be offshored**.

### 8.1 Flow

```text
Launch Offshoring Agent
        ↓
Offshoring Conversation (/agents/offshoring)
        ↓
Company selection (in chat)
        ↓
Upload company payroll sheet (in chat)
        ↓
Discovery round 1 — scope, sector, headcount (3 questions)
        ↓
Discovery round 2 — rates, transition, constraints (3 questions)
        ↓
Mock first-pass preview (numbers + heatmap)
        ↓
Discovery round 3 — sanity, scenario, audience (3 questions)
        ↓
Value-creation question (optional)
        ↓
AI Analysis
        ↓
Offshoring Opportunities
```

Company selection, payroll upload, and discovery happen inside one chat
experience at `/agents/offshoring`. Discovery questions follow the Renovus
Workforce Sourcing Assessment playbook (`docs/offshoring/`). There are no
separate company, documents, or questionnaire routes.

### 8.2 Inputs

- Portfolio company
- Company payroll sheet (spreadsheet or accepted document), or continue without
- Discovery answers (3 rounds × 3 questions + optional value-creation)

### 8.3 Payroll upload requirements

- Drag-and-drop dropzone plus a keyboard-accessible file picker
- Multiple files
- Per-file simulated upload progress
- File removal
- Accepted types: PDF, DOC/DOCX, XLS/XLSX, CSV, PPT/PPTX, TXT
- Max file size: 25 MB per file; max 10 files
- Rejected files show an inline reason and do not enter the list
- The conversation asks for the payroll sheet first; the user may continue
  without a file if they do not have one
- File bytes stay in memory; only metadata is persisted for resume

---

## 9. Offshoring Analysis

The AI analyzes the provided information to identify processes that could
potentially be outsourced/offshored.

### 9.1 Output

For each identified process:

- Process name
- Description
- Why it is suitable for offshoring
- Offshore suitability
- Complexity
- Potential impact
- Recommended next step

**Example**

> **Lead Research**
> **Suitability:** High
> **Reason:** Highly repetitive and process-driven activity.

---

## 10. Common Agent Framework

Both agents use a common underlying framework.

### 10.1 Shared capabilities

- Portfolio company selection
- Agent launch
- Input collection
- Save / resume
- AI processing
- Results
- History / status

Future agents reuse the same platform infrastructure. Concretely, the shared
framework is:

| Concern | Shared implementation |
| --- | --- |
| Agent configuration | `src/data/agents.ts` |
| Step progression | `AgentStepIndicator` driven by agent config `steps[]` |
| Company selection | `CompanySelector` |
| Questionnaire rendering | `QuestionCard` / `QuestionGroup` / `StepNavigation` |
| Draft persistence | `useAgentRun` + `localStorage` adapter |
| Processing | `ProcessingState` with configurable stage labels |
| Results | `OpportunityCard` / `ResultSummary` / `DetailPanel` |

### 10.2 Component genericity rule

If the same UI pattern appears twice, it becomes reusable. If a component is
likely to be reused by another agent, it is generic and configured by props.
Agent-prefixed component names (e.g. `AssessmentQuestionCard`) are prohibited.

---

## 11. Frontend-only functionality

The application must feel functional without a backend. Mock data plus React
state and `localStorage` provide behaviour. **No fake backend API routes may be
created to make the UI work.**

Required behaviours: login validation, navigation, agent selection, agent launch,
portfolio company selection, department selection, questionnaire progression,
required field validation, previous/next, save progress, resume assessment,
progress indicators, document upload UI, drag-and-drop, file removal,
loading/processing states, mock AI analysis, results generated from mock data,
opportunity selection, opportunity detail views, empty states, error states,
success states, logout.

---

## 12. MVP Screens

### Authentication
1. Login
2. Forgot Password

### Platform
3. Agent Hub

### Assessment Agent
4. Assessment Agent Overview
5. Portfolio Company Selection
6. Department Selection
7. Questionnaire
8. Analysis / Processing
9. Assessment Results
10. Opportunity Details

### Offshoring Agent
11. Offshoring Conversation (company → payroll → questions)
12. Analysis / Processing
13. Offshoring Results
14. Opportunity Details

Full screen specifications live in `SCREENS.md`.

---

## 13. MVP Priority

**P0 — Platform Foundation**
- Login
- Agent Hub
- Agent architecture
- Portfolio company selection

**P1 — Assessment Agent**
- Assessment setup
- Questionnaire
- AI analysis
- Opportunity results

**P2 — Offshoring Agent**
- Document upload
- Questionnaire
- AI analysis
- Offshoring results

**P3 — Scalability**
- Configurable questionnaires
- Configurable agents
- Add new departments / agents

### 13.1 Key UX decision (recorded)

Sales, Marketing, Finance, etc. are **not** separate agents on the Agent Hub.
Instead:

> **Assessment Agent → Select Department → Sales / Marketing / Finance / …**

This keeps the Agent Hub clean and makes the product scalable.

---

## 14. Build sequence

Screens are built one at a time and are not considered done until visually and
functionally complete, QA'd against `QA.md`, and documented in `SCREENS.md`.

| Phase | Contents |
| --- | --- |
| 1 — Foundation | App shell, design system, reusable components, Login |
| 2 — Agent Platform | Agent Hub, Agent card, Agent overview |
| 3 — Assessment | Company selection, Department selection, Questionnaire, Processing, Results, Opportunity details |
| 4 — Offshoring | Conversational offshoring (company, payroll, questions), Processing, Results, Opportunity details |

### Current build status

| Phase | Status |
| --- | --- |
| 1 — Foundation | Complete (docs, tokens, shell, Login) |
| 2 — Agent Platform | **Agent Hub and Assessment Overview complete.** Offshoring overview is not built. |
| 3 — Assessment | **Conversational Sales Assessment complete** at `/agents/assessment` (Excel-driven routing + funnel/relationship paths). Processing is a stub. Results are not built. |
| 4 — Offshoring | **Conversational Offshoring complete** at `/agents/offshoring` (company → payroll → questions). Processing is a stub. Results are not built. |

---

## 15. Open questions

Tracked here rather than guessed at in code.

| # | Question | Status |
| --- | --- | --- |
| 1 | Should assessment results be exportable (PDF/CSV)? Not in PRD; not built. | Open |
| 2 | Is there an agent run history screen in MVP? PRD §10 lists "history/status" as a shared capability but no screen is listed in §12. Treated as out of scope for MVP screens. | Open |
| 3 | Do non-Sales departments ship with authored questionnaires in MVP? PRD §5.3 says Sales is the initial department. Others are configured but gated. | Resolved — gated |
| 4 | Exact wording of the Renovus logo lockup for internal tools. Using a wordmark treatment derived from the public brand. | Open |
