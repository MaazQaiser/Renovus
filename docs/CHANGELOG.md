# Changelog

Meaningful product, design, and implementation changes. Newest first.

---

## [2026-08-30]

### Changed

* Aligned Offshoring chat with the Renovus Workforce Sourcing Assessment
  playbook (`docs/offshoring/`): company → payroll → discovery rounds 1–3
  (3×3) → mock first-pass preview → optional value-creation → analyze.
* Replaced invented offshoring Q&A with the discovery bank from
  `references/discovery-questions.md`. Sector-seeded function lists stand in
  for payroll parse in this increment.

### Reason

* Offshoring questions must match the deal-team sourcing skill, not a generic
  process questionnaire.

### Impact

* Discovery conversation is the primary UX. Real scoring scripts and the
  tabbed HTML dashboard remain out of scope; Analyze still opens the stub.

---

## [2026-08-30]

### Changed

* Built the Offshoring Agent as a **conversational chat** at `/agents/offshoring`,
  matching the Assessment experience: company → payroll sheet → questions.
* In-chat company selection, payroll `FileUpload` (drag-and-drop, validation,
  simulated progress), offshoring Q&A, save/resume, and **Analyze offshoring
  potential** → processing stub.
* Reused Assessment chat primitives (`CompanySelectionPrompt`, `QuestionPrompt`,
  composer, review). File UI is generic under `src/components/files/`.

### Reason

* Client demo needs the same continuous enterprise conversation for offshoring,
  with the payroll sheet as the document step.

### Impact

* Offshoring conversation is the primary UX. Analysis and report screens are
  not built. Separate company / documents / questionnaire routes are not used.

---

## [2026-08-30]

### Changed

* Replaced the Assessment wizard with a **conversational Sales Baseline**
  experience at `/agents/assessment`.
* Questions sourced from `Sales_Baseline_Information_Request.xlsx` into
  `src/data/salesAssessmentQuestions.ts` (routing R1–R6, funnel 27,
  relationship 9) with mock routing to Funnel / Relationship / Both.
* In-chat company selection, quick picks, free text, mock speech, confidence,
  clarifications, progress, save/resume, and **Analyze assessment** →
  processing stub.
* Removed `/agents/assessment/company`, `/department`, and `/questionnaire`.

### Reason

* Client demo needs one continuous enterprise assessment conversation, not a
  multi-page form wizard.

### Impact

* Assessment conversation is the primary UX. Analysis and report screens are
  not built. Question admin panel is out of scope for this increment.

---

## [2026-08-30]

### Changed

* Built the Assessment questionnaire at `/agents/assessment/questionnaire`: a
  generic, data-driven engine (`Questionnaire` → `QuestionRenderer`) with
  questions in `src/data/assessmentQuestions.ts` (Sales, 4 sections, 11
  questions, all six types).
* Department **Continue** writes Sales onto the active run and opens the
  questionnaire. Answers, position, company, and department persist on the
  `AgentRun`. **Submit assessment** goes to `/agents/assessment/processing`
  (stub only).

### Reason

* The Assessment Agent needs a reusable questionnaire so later departments and
  the Offshoring Agent can share the same renderer instead of hardcoded
  screens.

### Impact

* Questionnaire is complete. Department UI, processing, results, and
  opportunity details are not built.
  *(Superseded by conversational Assessment Agent.)*

---

## [2026-08-30]

### Changed

* Built Assessment portfolio company selection at `/agents/assessment/company`:
  searchable `CompanySelector`, reusable `AgentProgress`, and single-select
  `CompanyCard`s from `src/data/companies.ts`.
* **Continue** stores the selected `companyId` on the active Assessment run and
  navigates to `/agents/assessment/department` (route stub). **Back** returns
  to the Assessment Overview.

### Reason

* The assessment needs a company as context before department or questions, and
  the same selection pattern will be reused by Offshoring.

### Impact

* Company selection is complete. Department selection, questionnaire,
  processing, and results are not built.

---

## [2026-08-30]

### Changed

* Built the Assessment Agent Overview at `/agents/assessment`: hero, about,
  reusable `AgentStepList` and `OutcomeList`, and a resume card that appears
  only when a real draft exists in `localStorage`.
* **Start assessment** navigates to `/agents/assessment/company` (route stub).
  **Back to agents** returns to the Hub.

### Reason

* Users need a clear introduction before entering the assessment so they know
  what they will do and what the assessment produces — without implying
  analysis has already run.

### Impact

* Assessment overview is complete. Company selection, department, questionnaire,
  processing, and results are not built. Offshoring overview is not built.

---

## [2026-08-30]

### Changed

* Built the Agent Hub at `/agents`: data-driven `AgentGrid` / `AgentCard` /
  `AgentStatus` from `src/data/agents.ts` (Assessment and Offshoring only).
* Moved desktop account controls into the sidebar footer. Prepared
  `/agents/assessment` and `/agents/offshoring` as route stubs so launch
  navigation works.

### Reason

* Users need a central place to find and launch agents without hardcoding
  cards into the page.

### Impact

* Adding an agent later is a configuration change. Assessment and Offshoring
  workflows are not built.

---

## [2026-08-30]

### Changed

* Enabled Next.js `typedRoutes` and recorded App Router 16 conventions (async `params`, `useSearchParams` Suspense) in `COMPONENTS.md`.

### Reason

* Next.js 16 removes sync request props and typed `href`s catch broken routes before later agent screens are built.

### Impact

* New pages must await `params` / `searchParams` (or use `useParams`). `useSearchParams` must sit in a Suspense boundary.

---

## [2026-08-30]

### Changed

- Created the `/docs` source-of-truth set: `PRD.md`, `DESIGN_SYSTEM.md`,
  `COMPONENTS.md`, `SCREENS.md`, `FLOWS.md`, `CONTENT.md`, `DATA_MODEL.md`,
  `QA.md`, `CHANGELOG.md`.
- Locked semantic colour, type, spacing, radius, elevation, and layout tokens
  from the live Renovus Capital brand (not invented, not copied as a marketing
  layout).
- Established the reusable component architecture and AppShell architecture.
- Implemented the Login screen with mock authentication, validation, and
  session persistence. Other product screens are not built.

### Reason

- Kickoff required documentation and design system before product screens, then
  Login only, so later agents can be added by configuration rather than by
  redesign.

### Impact

- All future screens must read these docs first and stay synchronized.
- Login is the only completed product screen. `/agents` is a protected shell
  placeholder so the post-login redirect has a destination.
