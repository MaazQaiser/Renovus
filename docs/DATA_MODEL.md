# Data Model

**Status:** Source of truth for types and the mock data layer
**Last updated:** 2026-08-30

There is no backend. Every type below is a **frontend domain type** implemented
in `src/types/` and populated from `src/data/`. Persistence is `localStorage`
only, behind a single adapter.

---

## 1. Layer rules

- All mock data lives in `src/data/`. **No mock data inside page or component
  files.** A component receives data through props or a context.
- Types live in `src/types/` and are imported by both data and components.
- In-app `href`s use `AppHref` (`src/lib/routes.ts`) so Next.js `typedRoutes` can reject unknown paths. Agent `route` strings stay plain until those pages exist.
- No `any`. No non-null assertions on data lookups — lookups return
  `T | undefined` and callers handle the miss (that is what drives the empty and
  error states).
- Ids are stable, human-readable slugs (`"assessment"`, `"acme-learning"`), not
  UUIDs, so routes and localStorage keys stay legible.

```text
src/
  types/
    agent.ts        company.ts     question.ts
    result.ts       session.ts     file.ts       common.ts
    run.ts
  data/
    agents.ts               companies.ts
    departments.ts          users.ts
    assessmentQuestions.ts  offshoringQuestions.ts
    assessmentResults.ts    offshoringResults.ts
  lib/
    storage.ts      cn.ts     validation.ts     format.ts     runs.ts
```

---

## 2. Common

```ts
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type ComplexityLevel = 'high' | 'medium' | 'low';
export type SuitabilityLevel = 'high' | 'medium' | 'low' | 'not-suitable';
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
```

---

## 3. Agent

Drives the Agent Hub and every agent's step progression. Adding an agent means
adding one entry here.

```ts
export type AgentId = 'assessment' | 'offshoring' | (string & {});

export type AgentStatus = 'available' | 'beta' | 'coming-soon' | 'maintenance';

export interface AgentStep {
  id: string;            // 'company' | 'department' | 'questionnaire' | ...
  label: string;         // 'Select company'
  shortLabel: string;    // 'Company'  (mobile / narrow indicator)
  route: string;         // '/agents/assessment/company'
  optional?: boolean;
}

export interface AgentProgressStep {
  id: string;            // 'company'
  label: string;         // 'Company'
}

export interface AgentProcessStep {
  id: string;
  title: string;         // 'Select portfolio company'
  description: string;   // 'Choose the company being assessed.'
}

export interface AgentOutcome {
  id: string;
  label: string;         // 'Current processes'
}

export interface AgentOverview {
  heading: string;
  description: string;
  aboutTitle: string;
  about: string;
  inProgressTitle: string;
  processTitle: string;
  processSteps: AgentProcessStep[];
  outcomesTitle: string;
  outcomes: AgentOutcome[];
  startLabel: string;
  continueLabel: string;
  backLabel: string;
}

export interface Agent {
  id: AgentId;
  name: string;
  tagline: string;       // one line, Agent Hub card
  description: string;   // PRD purpose statement
  purpose: string;       // longer copy, agent overview screen
  status: AgentStatus;
  icon: LucideIconName;  // resolved through an allow-listed icon map
  accent: Tone;
  route: string;         // '/agents/assessment'
  steps: AgentStep[];
  capabilities: string[];   // bullets on the overview screen
  estimatedMinutes: number;
  requiresDocuments: boolean;
  requiresDepartment: boolean;
  overview?: AgentOverview; // present when the overview screen is built
  progressSteps?: AgentProgressStep[]; // user-facing workflow indicator
}
```

`icon` is a **name**, not an imported component, so agent configuration stays
serialisable. `src/lib/icons.ts` maps names to `lucide-react` components and
falls back to a default rather than crashing on an unknown name.

`overview` is optional so an agent can appear on the Hub before its overview
screen is authored. Assessment and Offshoring both launch straight into chat
in this increment. Outcome labels stay within PRD §7 — no scores, ROI, or savings.

### MVP agents

| id | status | steps | department | documents |
| --- | --- | --- | --- | --- |
| `assessment` | `available` | company → department → questionnaire → processing → results | yes | no |
| `offshoring` | `available` | conversation (company → payroll → questions) → processing → results | no | yes |

Only these two agents are configured in this increment. Future agents are added
here — not by changing Hub JSX. `route` for a launchable agent must be a real
App Router path (`AppHref`).

---

## 4. Portfolio company

```ts
export type Sector =
  | 'Education'
  | 'Healthcare Services'
  | 'Technology Services'
  | 'Professional Services';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  sector: Sector;            // shown as industry
  description: string;
  headquarters: string;
  employeeCount: number;
  revenueRange: string;      // stored, not shown on selection cards
  investmentYear: number;
  initials?: string;
  logoUrl?: string;          // absent in MVP → CompanyAvatar renders initials
  lastAssessedAt?: string;
}

export interface SelectedCompany {
  id: string;
  name: string;
  shortName: string;
  sector: Sector;
  description: string;
}
```

`SelectedCompany` is the subset a workflow step needs. Persistence stores
`companyId` on `AgentRun`; UI resolves the rest from `companies.ts`.

Sectors mirror the four Renovus focus areas. Names in `companies.ts` are
**fictional placeholders**, not real portfolio companies — see `CONTENT.md`.
Eight demo companies are authored. Selection cards show name, sector, and a
short description only — no financial metrics.

`filterCompanies(list, query)` matches name, short name, sector, description,
and headquarters.

---

## 5. Department

```ts
export interface Department {
  id: string;              // 'sales'
  name: string;            // 'Sales'
  description: string;
  icon: LucideIconName;
  available: boolean;      // false → selectable UI shows "Coming soon", disabled
  questionnaireId?: string;
}
```

MVP: `sales` is `available: true`. `marketing`, `finance`, `hr`, `operations`
are present with `available: false`.

---

## 6. Questionnaire

The questionnaire is data. Screens render it generically.

```ts
export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'text'
  | 'textarea'
  | 'scale'
  | 'yes-no';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface QuestionCondition {
  questionId: string;
  equals?: AnswerValue;
  includes?: string;
}

interface QuestionBase {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  helpText?: string;
  required: boolean;
  showWhen?: QuestionCondition;   // simple conditional display
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single-choice';
  options: QuestionOption[];
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice';
  options: QuestionOption[];
  minSelections?: number;
  maxSelections?: number;
}

export interface TextQuestion extends QuestionBase {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
}

export interface TextareaQuestion extends QuestionBase {
  type: 'textarea';
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

export interface ScaleQuestion extends QuestionBase {
  type: 'scale';
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  step?: number;
}

export interface YesNoQuestion extends QuestionBase {
  type: 'yes-no';
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextQuestion
  | TextareaQuestion
  | ScaleQuestion
  | YesNoQuestion;

export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Questionnaire {
  id: string;
  agentId: AgentId;
  departmentId?: string;
  title: string;
  description: string;
  sections: QuestionSection[];
}
```

The discriminated union on `type` is what makes `QuestionRenderer` exhaustive:
adding a type produces a compile error in the switch until it is handled.

`src/data/assessmentQuestions.ts` is the only Assessment question catalog.
Sales (`assessment-sales`) is authored: 4 sections, 11 questions, all six
types. Other departments have no questionnaire until they are authored.
Helpers: `getQuestionnaire(id)`, `getQuestionnaireForDepartment(agentId,
departmentId)`.

`src/lib/questionnaire.ts` flattens sections, checks whether an answer is
present (`false` is valid for yes/no), and returns validation copy.

### Answers

```ts
export type AnswerValue = string | string[] | number | boolean | null;
export type AnswerMap = Record<string, AnswerValue>;
```

| Question type | Answer shape |
| --- | --- |
| `single-choice` | `string` (option id) |
| `multiple-choice` | `string[]` (option ids) |
| `text` / `textarea` | `string` |
| `scale` | `number` |
| `yes-no` | `boolean` |

---

## 7. Agent run (draft / save & resume)

One shape serves every agent.

```ts
export type AgentRunStatus =
  | 'draft' | 'in-progress' | 'processing' | 'complete' | 'abandoned';

export interface AgentRun {
  id: string;                 // `${agentId}:${companyId}:${departmentId ?? '_'}`
  agentId: AgentId;
  companyId?: string;
  departmentId?: string;
  companyInfo?: CompanyInfoInput;   // Offshoring only
  documentIds: string[];
  answers: AnswerMap;
  currentStepId: string;
  currentSectionIndex: number;
  currentQuestionId?: string;
  status: AgentRunStatus;
  startedAt: string;          // ISO
  updatedAt: string;          // ISO
  completedAt?: string;
  resultId?: string;
}
```

Stored under `renovers:run:<id>`. An index at `renovers:runs` lists ids so the
agent overview can offer **Continue assessment** or **Start over**.

`src/lib/runs.ts` is the only module that lists, reads, or deletes runs.
`listRuns()` / `subscribeToRuns()` use a cached snapshot (same pattern as
session) so `useSyncExternalStore` does not loop. `getActiveRun(agentId)`
returns the newest run in `draft` or `in-progress` (overview resume).
`getCurrentRun(agentId)` also includes `processing` so the questionnaire can
restore answers after submit. `upsertRun()` writes a run and maintains the id
index. `saveCompanySelection(agentId, companyId)` creates or updates the
active run, remaps the id when the company changes, and clears `departmentId`
if the company changed. `saveDepartmentSelection(agentId, departmentId)`
writes the department, remaps the id, and clears answers if the department
changed. `saveQuestionnaireProgress()` writes answers, `currentQuestionId`,
and `currentSectionIndex`. `submitAssessment()` sets `status: processing`.
The overview never invents a run — if the store is empty, the resume card is
omitted.

`companies.ts` is the single catalog for both agents. Department selection UI
is still a stub; `departments.ts` is used to resolve names and to load the
Sales questionnaire.

### Assessment session / response

The persisted session **is** the `AgentRun`. The questionnaire treats it as:

```ts
export interface AssessmentSession {
  companyId: string;
  departmentId: string;
  answers: AnswerMap;
  currentQuestionId?: string;
  currentSectionIndex: number;
  status: AgentRunStatus;
}

export interface AssessmentResponse {
  companyId: string;
  departmentId: string;
  answers: AnswerMap;
  currentQuestionId: string;
  completedSectionIds: string[];
  status: "in-progress" | "submitted";
}
```

`AssessmentResponse` is the questionnaire-facing view. `completedSectionIds`
is derived (`src/lib/questionnaire.ts`), not stored. Answers are always keyed
by question id.

```ts
export interface CompanyInfoInput {
  primaryContact: string;
  contactEmail: string;
  headcount: string;
  locations: string[];
  functionsInScope: string[];
  notes?: string;
}
```

---

## 8. Files

Files never leave the browser. `File` objects are held in memory; only metadata
is persisted, so a resumed run shows previously named documents as
`status: 'restored'` and does not pretend to still hold the bytes.

```ts
export type UploadStatus =
  | 'pending' | 'uploading' | 'complete' | 'error' | 'restored';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;          // bytes
  type: string;          // MIME
  extension: string;
  status: UploadStatus;
  progress: number;      // 0–100
  error?: string;
  addedAt: string;
}

export const UPLOAD_LIMITS = {
  maxFileSizeBytes: 25 * 1024 * 1024,
  maxFiles: 10,
  acceptedExtensions: ['pdf','doc','docx','xls','xlsx','csv','ppt','pptx','txt'],
} as const;
```

Rejection reasons are user-facing strings defined in `CONTENT.md`.

---

## 9. Results

One result model for both agents. Agent-specific fields are optional and
additive, so `OpportunityCard` and `DetailPanel` stay generic.

```ts
export interface Opportunity {
  id: string;
  agentId: AgentId;
  title: string;
  summary: string;
  category: string;
  priority: PriorityLevel;
  impact: ImpactLevel;
  score: number;              // 0–100, drives OpportunityScore
  problem: string;            // "Current state"
  solution: string;           // "Potential solution"
  rationale: string[];        // "Why this surfaced"
  recommendedNextStep: string;
  effort: ComplexityLevel;
  timeframe: string;          // '1–3 months'
  affectedRoles: string[];
  metrics: { label: string; value: string; hint?: string }[];

  // Offshoring-specific (absent on assessment opportunities)
  suitability?: SuitabilityLevel;
  complexity?: ComplexityLevel;
  processVolume?: string;
  offshoreConsiderations?: string[];
}

export interface AnalysisResult {
  id: string;
  agentId: AgentId;
  companyId: string;
  departmentId?: string;
  generatedAt: string;
  headline: string;
  summary: string;
  opportunities: Opportunity[];
  observations: { title: string; detail: string }[];
  stats: { label: string; value: string; hint?: string }[];
}
```

### Mock "AI analysis"

`src/lib/analysis.ts` is a pure function, not a fake API:

```ts
analyzeRun(run: AgentRun, catalog: Opportunity[]): AnalysisResult
```

It deterministically selects and orders opportunities from the mock catalog
using the run's answers (for example, a "high manual effort" answer raises the
score of automation opportunities). Deterministic so the same answers always
produce the same result and QA is repeatable. The *delay* is simulated in the
processing screen, not in this function.

---

## 10. Session & user

```ts
export type UserRole = 'operating-partner' | 'portfolio-executive' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  initials: string;
  active: boolean;
}

export interface MockCredential { email: string; password: string; userId: string }

export interface Session {
  userId: string;
  email: string;
  name: string;
  roleLabel: string;
  initials: string;
  issuedAt: string;
  expiresAt: string;   // issuedAt + 12h; expired sessions are treated as absent
}
```

**Passwords are never stored in the session or in `localStorage`.** Mock
credentials exist only in the in-memory `users.ts` module. This is a prototype
convention, not a security claim — see `QA.md`.

Demo credentials are surfaced in the UI on the login screen so the prototype is
usable without documentation.

---

## 11. Storage

`src/lib/storage.ts` is the only module that touches `localStorage`.

| Key | Contents |
| --- | --- |
| `renovers:session` | `Session` |
| `renovers:runs` | `string[]` of run ids |
| `renovers:run:<id>` | `AgentRun` |
| `renovers:results:<runId>` | `AnalysisResult` |
| `renovers:ui` | `{ sidebarCollapsed: boolean }` |

Contract:

- Every read is wrapped in `try/catch` and returns a typed fallback. Malformed
  or foreign JSON never throws into a render.
- Every value is written with a `version` field; a version mismatch discards the
  value rather than migrating it.
- All access is guarded by `typeof window !== 'undefined'` so nothing breaks
  during server rendering.
- Session and run lists are read through `useSyncExternalStore` with a **cached
  `getSnapshot`** and a stable server snapshot. Do not return a new object or
  array from `getSnapshot` / `getServerSnapshot` on every call.
- Other storage reads happen in effects or event handlers, never during a
  server render, so hydration stays clean.
