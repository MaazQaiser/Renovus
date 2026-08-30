# Flows

**Status:** Source of truth for user journeys
**Last updated:** 2026-08-30

No flow may be implemented that is not listed here. Happy paths, validation
failures, and resume paths are all first-class.

---

## 1. Authentication

```text
Visit any protected route without a session
        ↓
/login
        ↓
[valid credentials] ──────────────────────────────► /agents
        ↓
[empty / invalid fields] ► inline field errors, stay
        ↓
[unknown email or wrong password] ► form alert, stay
        ↓
[deactivated user] ► form alert, stay
        ↓
[5 consecutive failures] ► warning alert + forgot-password prompt, stay
```

```text
/login  —Forgot password→  /forgot-password
        ↓
[well-formed email] ► generic success (always)
        ↓
Back to sign in → /login
```

```text
Sidebar or topbar UserMenu → Log out → ConfirmationDialog
        ↓
Confirm → clear session (+ session-scoped drafts) → /login
Cancel  → stay
```

Authenticated users who open `/login` or `/forgot-password` are redirected to
`/agents`.

---

## 2. Agent Hub → launch

```text
Login
        ↓
Authentication
        ↓
Agent Hub
        ↓
Choose Agent
 ├── Assessment Agent → /agents/assessment
 └── Offshoring Agent → /agents/offshoring
```

Cards render from `src/data/agents.ts`. Adding an agent is a configuration
change, not a Hub redesign. Coming-soon and maintenance cards cannot be
launched; those statuses are supported by `AgentStatus` but are not listed in
this increment.

---

## 3. Assessment Agent

```text
Agent Hub
        ↓  Launch agent
Assessment Conversation              /agents/assessment
        ↓  Company (in chat)
        ↓  Routing R1–R6
        ↓  Funnel / Relationship / Both
        ↓  Analyze assessment
Processing                           /agents/assessment/processing  (stub)
        ↓
Results                              /agents/assessment/results      (not built)
```

Company, routing, and path questions are one continuous chat. Session key:
`renovers:sales-assessment`. Questions from
`src/data/salesAssessmentQuestions.ts` (Excel workbook).

### Save / resume

Refresh restores messages, answers, company, sales model, and current question.

### Validation

Required questions and confidence (when asked) block advance with inline errors.

---

## 4. Offshoring Agent

```text
Agent Hub
        ↓  Launch agent
Offshoring Conversation              /agents/offshoring
        ↓  Company (in chat)
        ↓  Payroll sheet upload (in chat)  [or continue without → Tier C]
        ↓  Discovery round 1 (scope, sector, headcount)
        ↓  Discovery round 2 (rates, transition, constraints)
        ↓  Mock first-pass preview
        ↓  Discovery round 3 (sanity, scenario, audience)
        ↓  Value-creation (optional)
        ↓  Analyze offshoring potential
Processing                           /agents/offshoring/processing  (stub)
        ↓
Results                              /agents/offshoring/results      (not built)
```

Company, payroll, and discovery are one continuous chat. Session key:
`renovers:offshoring`. Discovery bank from
`docs/offshoring/references/discovery-questions.md`, authored in
`src/data/offshoringQuestions.ts`. Playbook: `docs/offshoring/SKILL.md`.

Detected functions are seeded from company sector (no spreadsheet parse in
this increment). Payroll skip sets data tier C.

### Save / resume

Refresh restores messages, answers, company, file metadata, detected
functions, data tier, and current question.

### Validation

Required questions block advance with inline errors. Unsupported or oversized
files show an inline reason and are not attached.

---

## 5. Shared agent framework

Every future agent follows:

```text
Configuration → Overview → Agent-specific inputs → Processing → Results → Detail
```

Shared machinery: company selection, step indicator, questionnaire renderer,
draft persistence, processing stages, opportunity cards.

---

## 6. Implemented in this increment

| Flow | Status |
| --- | --- |
| Login happy path + validation + deactivated + 5-failure warning | Built |
| Authenticated redirect away from `/login` | Built |
| Unauthenticated redirect to `/login` from `/` and `/agents` | Built |
| Logout from AppShell | Built |
| Forgot password | Route present; full screen pass not done |
| Agent Hub listing and launch | Built |
| Assessment Agent Overview | Built |
| Assessment company selection | Removed — in-chat |
| Assessment department selection | Removed — Sales fixed in session |
| Assessment questionnaire (form wizard) | Removed — replaced by conversation |
| Assessment conversation | Built |
| Assessment processing, results | Stub / not started |
| Offshoring conversation | Built |
| Offshoring processing, results | Stub / not started |
