# Report Specification and Consulting Voice

Both outputs are authored by Renovus Capital (Portfolio Operations) about one of its own portfolio companies. Depending on the round-3 audience answer they are read either by the portco CEO/CFO (a joint plan) or by the Renovus investment committee / operating review (an internal recommendation). Write so a reader who only sees the first tab gets the answer, and a reader who opens the Detail tab can reproduce every number.

## Voice

- Answer first. Each section opens with the conclusion, then the evidence.
- "So what" over "what". A chart is followed by the sentence that tells the reader what to do with it.
- Assumptions are named, not implied. "Assuming a blended offshore cost at 40% of onshore loaded cost (Renovus deal team assumption)..." is fine. "Significant savings are possible" is not.
- Plain nouns. Avoid "leverage", "unlock", "transform", "world-class", "seamless", "robust", "synergy", "journey".
- Numbers: currency with thousands separators, one decimal for millions (`$2.4M`), whole percentages, FTEs as integers. EBITDA uplift as a whole percentage; implied EV labeled illustrative.
- Risks are specific to this portco, not generic offshoring risks. "Revenue Cycle has 3 people who are named contacts with the top-5 payers" beats "cultural differences".
- Renovus appears as the sponsor coordinating the program in one dedicated section and in next steps, not sprinkled into every paragraph. Vendors stay generic ("the sourcing partner") unless one was named in discovery.
- Portco-facing tone: "we recommend", collaborative, execution-focused. Renovus-internal tone: same discipline, but direct about management bandwidth, change fatigue, and exit-timing implications.

## Dashboard tabs (default output)

Seven tabs. Tabs 1–6 each fit 1280×800 with no scrolling; tab 7 (Detail) scrolls.

1. **The answer** — kicker line, then a **4–6 line plain-English executive summary in full sentences** (`summary_exec`) that a CEO could read aloud: what we looked at, what we found, what it's worth, what we'd do first, and the main caveat. Only after that paragraph come the KPI tiles (addressable FTEs and share · run-rate saving · 3-year net · payback; plus EBITDA uplift % and illustrative EV when supplied) and the conservative-floor line.
2. **Where the cost sits** — loaded cost by function bar chart + one caption sentence.
3. **What can move** — function × level heatmap (≤12 functions) and top-movers table (≤10 rows) + one caption sentence.
4. **What it saves** — year-1 waterfall + three-scenario table with the headline row marked (+ value-creation strip when supplied) + one caption sentence.
5. **How it happens** — three wave cards with month, FTE, saving, functions + one sequencing sentence.
6. **Risks & next steps** — top 5 risks (owner-tagged) and next-steps table + one caption sentence.
7. **Detail** — scrolling: approach & scope, org snapshot, full sourcing-model table, full scenario table, method note, all risks, implementation model, Appendix A (role-level scores), Appendix B (assumptions register), Appendix C (methodology).

## Detailed report sections (`--mode detailed`, fixed order)

0. **Cover** — "Workforce Sourcing Assessment", portco name, date, "Prepared by Renovus Capital · Portfolio Operations", confidentiality line.
1. **Executive summary** — KPI tiles, the same `summary_exec` paragraph, 3–5 key findings, one-paragraph recommendation, conservative figure in view, value-creation callout when supplied.
2. **Approach and scope** — data received (tier, rows, functions, date), exclusions, scoring dimensions in one line each, scenario definitions.
3. **Organization snapshot** — headcount and loaded cost by function (chart), level mix, structural observations.
4. **Outsourcing potential** — heatmap, drivers of high and low scores, constraints applied.
5. **Recommended sourcing model** — table: function, FTEs, loaded cost, model, rationale, principal risk; prose on the 2–3 functions that matter most.
6. **Savings model** — waterfall, scenario table, plain-language method note, value-creation paragraph when supplied.
7. **Transition roadmap** — three waves with timing, prerequisites, sequencing logic.
8. **Risks and mitigations** — 5–8 rows, each specific, owner one of Portco | Renovus | Vendor | Joint.
9. **Implementation model and next steps** — engagement structure per function, vendor-selection note, governance cadence (portco exec sponsor · Renovus operating partner · vendor delivery lead), SLAs/KPIs, knowledge transfer, next-steps table (step, owner, timing).
10. **Appendix A — Role-level scores** — anonymized IDs, dimension scores, composite, band, wave, costs; override reasons shown.
11. **Appendix B — Assumptions register** — every assumption with source ("Renovus deal team", "portco data", "vendor quote — <name>", "default").
12. **Appendix C — Methodology** — scoring formula, model rules, savings formulas, data-handling note (anonymization, no names retained).

## `narrative.json` schema

Every string is prose you write. `_short` fields feed the dashboard and have hard character budgets — `build_report.py` prints `LENGTH:` warnings when one busts its budget; fix the prose, not the layout. The long fields feed the detailed report and the Detail tab.

```json
{
  "report_date": "27 August 2026",
  "prepared_for": "Portco legal name",
  "prepared_by": "Renovus Capital · Portfolio Operations",
  "confidentiality": "Confidential — Renovus Capital and <Portco> leadership only",
  "audience": "portco | renovus_internal",
  "executive_summary": {
    "summary_exec": "4–6 full sentences, ≤640 chars. Plain English, no jargon, human cadence. Shape: what we assessed → what we found (with the two numbers that matter) → what it's worth to the investment → what we'd do first → the one caveat.",
    "summary": "4–6 sentences for the detailed report (may repeat summary_exec).",
    "key_findings": ["3–5 bullets, each with a number"],
    "key_findings_short": ["exactly 3 bullets, ≤90 chars each"],
    "recommendation": "One paragraph."
  },
  "captions_short": {
    "cost": "≤150 chars — the takeaway of the cost chart",
    "move": "≤150 chars — the takeaway of the heatmap",
    "save": "≤150 chars — the takeaway of the savings tab",
    "waves": "≤150 chars — the sequencing logic in one line",
    "risks": "≤150 chars — the risk posture in one line"
  },
  "approach": { "data_received": "2–3 sentences.", "exclusions": "1–2 sentences.", "method_note": "2–3 sentences." },
  "org_snapshot": { "observations": ["3–5 bullets"] },
  "potential": {
    "drivers_high": "Paragraph.", "drivers_low": "Paragraph.",
    "constraints_applied": ["bullets, one per constraint, or empty"]
  },
  "sourcing_model": {
    "intro": "1–2 sentences.",
    "functions": { "Revenue Cycle": { "rationale": "One sentence.", "risk": "One sentence." } },
    "focus": "Paragraph on the 2–3 functions that matter most."
  },
  "savings": {
    "method_note": "Plain-language paragraph.",
    "interpretation": "Paragraph on what the scenarios mean and which to plan on.",
    "value_creation": "Paragraph tying run-rate saving to EBITDA and (if supplied) illustrative EV at exit. Omit key entirely when value_creation wasn't supplied."
  },
  "roadmap": {
    "sequencing": "Paragraph on why the waves are ordered this way.",
    "wave_prerequisites": { "1": ["bullets"], "2": ["bullets"], "3": ["bullets"] }
  },
  "risks": [ { "risk": "...", "impact": "High|Medium|Low", "mitigation": "...", "owner": "Portco|Renovus|Vendor|Joint" } ],
  "implementation": {
    "engagement_structure": "Paragraph: model per function, vendor-agnostic unless named.",
    "vendor_note": "1–2 sentences on vendor selection / RFP or the named vendor.",
    "governance": ["bullets: cadence, roles (portco sponsor, Renovus operating partner, vendor lead), escalation"],
    "kpis": ["bullets: SLAs/KPIs"],
    "knowledge_transfer": "Paragraph.",
    "next_steps": [ { "step": "...", "owner": "Portco|Renovus|Vendor|Joint", "timing": "..." } ]
  },
  "methodology_note": "Paragraph for Appendix C on data handling and anonymization."
}
```

`analysis.json` already contains every number, table, wave, value-creation figure, and the assumptions register; do not restate numbers in narrative strings unless the sentence needs them, and when you do, copy them from `analysis.json` so they match.

## Narrative field types (exact — templates are tolerant, but follow these)

- `executive_summary.summary_exec` — string, 4–6 full sentences, ≤640 chars. Plain spoken English, no headings, no bullets. This renders as the opening paragraph of Tab 1 before any visuals.
- `executive_summary.key_findings` — list of strings.
- `org_snapshot.observations`, `implementation.kpis` — list of strings.
- `implementation.governance` — string paragraph OR list of strings (both render).
- `implementation.next_steps` — list of objects `{step, owner, timing}` (preferred; renders as a numbered table with owner · timing). Plain strings also accepted.
- `risks` — list of objects `{risk, mitigation, owner}`; `impact` (High/Medium/Low) optional. Owner is one of Portco / Renovus / Vendor / Joint. Always dicts, never strings.
- `potential.constraints_applied` — string paragraph OR list of strings.
- `roadmap.wave_prerequisites` — list of strings (one per wave, index = wave) OR dict keyed by wave number string. Write the gate content only — do not repeat "Wave N (month M):" since the card header already says it.
- `sourcing_model.functions` — dict keyed by exact function name → `{rationale, risk}`.
