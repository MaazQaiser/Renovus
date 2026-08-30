# Discovery Question Bank — 3 rounds × 3 questions

The person running this is a Renovus Capital deal team member or operating partner assessing one of Renovus's own portfolio companies ("the portco"). Run each round with a single `ask_user_input_v0` call carrying exactly three questions. Options are tappable; where a number is needed, include an "I'll type it" option and take the free-text follow-up before moving on. Adapt wording to the portco and the functions found in the data — the questions below are the shape, not the script.

Keep the framing before each call short. In round 3, the framing must contain the actual headline numbers and a compact function-level heatmap so the deal team reacts to results, not abstractions.

## Round 1 — after ingest: portco context, scope, gaps

**Q1. Function taxonomy and scope.** Show the functions detected (e.g. "I found 6 functions: Revenue Cycle (28), Clinical (41), Engineering (19), Finance Ops (7), Sales (12), Support (15)"). Ask: "Assess all of these, or narrow scope?"
Options: All functions · Back-office / delivery only (exclude client-facing) · Let me pick (multi-select with the detected functions) · Exclude clinical/licensed roles, assess the rest

**Q2. Portco sector and hold stage.** "Which sector and stage is this portco in? It changes the constraints I apply and how savings are framed."
Options: Healthcare services — early hold (year 0–1) · Healthcare services — mid/late hold · Education — any stage · Technology / Professional services — early hold · Technology / Professional services — mid/late hold · I'll describe it
Sector drives default constraint prompts (PHI/HIPAA and payer contracts for healthcare; FERPA, accreditation and state authorization for education; client MSAs and data residency for tech/professional services). Stage drives tone: early-hold reports frame savings as margin build toward the value-creation plan; late-hold reports frame run-rate EBITDA visible at exit.

**Q3. Tier-dependent.**
- Tier A/B: "Any headcount already planned to change (hiring freeze, planned reductions, open reqs, pending add-on integration) that the model should reflect?" Options: No, use as-is · Exclude open reqs · Include open reqs as future roles · There's an add-on integration in flight (I'll explain)
- Tier C: "No pay data in the file. How should we get to cost?" Options: I'll give salary bands per function · Use one blended average per level (I'll type) · Skip savings, potential only. If bands are chosen, collect them next turn as a small table (function → Junior/Mid/Senior/Lead midpoint), write them to `bands_by_function`, and treat the run as Tier B.

**Q2 also determines the loaded-cost multiplier default.** If salaries look like base pay, fold the multiplier into the framing text ("I'll assume 1.35× to fully loaded unless you say otherwise") rather than spending a question on it; only ask explicitly if the data is ambiguous (already-loaded figures, mixed currencies, non-annual figures).

## Round 2 — before scoring: offshore economics and constraints

**Q1. Offshore cost as % of onshore loaded cost.** "What blended offshore/nearshore cost should I assume, as a share of onshore loaded cost? Use your vendor quotes or benchmarks from other Renovus portcos if you have them."
Options: ~30% across the board · ~40% across the board · Tech 40% / back-office 30% · I'll give a figure per function (from vendor quotes)
When "per function" is selected, collect them in the next turn and write `offshore_pct_by_function`. Every figure is attributed in the report as "Renovus deal team assumption" — never as a vendor's actual pricing unless the deal team says a quote is in hand, in which case record the vendor name in the assumptions register.

**Q2. Transition assumptions.** "How should transition costs and ramp be modeled?"
Options: Standard (15% recruit/onboarding fee, 2-month overlap, 60% year-1 realization) · Lighter — vendor absorbs setup (no fee, 1-month overlap, 75% year-1) · Heavier — complex knowledge transfer (20% fee, 3-month overlap, 50% year-1) · I'll specify

**Q3. Hard constraints.** Multi-select: "Anything that caps what can move offshore at this portco?"
Options: Regulated data (PHI / PCI / FERPA / financial core) in some teams · Client or payer contracts require onshore staff · Licensure / accreditation requires onshore or in-state roles · Union / works council / WARN exposure · Time-zone overlap required for some roles · None
For each selected item, ask in the next turn which functions or roles it applies to, write them into `constraints`, and apply the score overrides described in the rubric. For healthcare portcos also confirm whether the org already operates under BAAs with offshore vendors — if yes, PHI-handling ops roles (e.g. revenue cycle) are cappable rather than excluded.

## Round 3 — after first scoring pass: validate and frame

Framing text shows: addressable FTEs and share, current loaded cost in scope, base-case run-rate saving, 3-year cumulative net, payback months, and a small table of function → High/Med/Low counts → model.

**Q1. Scoring sanity check.** "Does the heatmap match your read of the business?"
Options: Yes, proceed · A function is over-scored (I'll say which) · A function is under-scored (I'll say which) · Specific roles need changes (I'll list IDs)
Apply changes as `score_overrides` or `model_overrides`, re-run, and re-show the deltas.

**Q2. Headline scenario.** "Which scenario leads the executive summary?"
Options: Base (High + half of Medium) · Conservative (High only, discounted) · Aggressive (High + all Medium) · Show base with conservative as the floor

**Q3. Implementation model and audience.** "How should the recommendation be framed, and who reads this first?"
Options: Vendor-led managed service per function — report goes to portco CEO/CFO · Staff augmentation into portco teams — report goes to portco CEO/CFO · Renovus-internal first (IC / ops review), recommend model per function · Build-operate-transfer / captive worth exploring — flag it
Audience drives voice: portco-facing reports read as a joint plan ("we recommend", owners split Portco/Renovus/Vendor); Renovus-internal reports may be more direct about execution risk and management bandwidth.

## After round 3 — the value-creation question (always ask, one plain-text question)

"Optional but recommended: what's the portco's current EBITDA (and revenue if handy), and what exit multiple does the deal model use? I'll express the savings as EBITDA uplift and implied enterprise value at exit."
Write answers into `value_creation` in `assumptions.json` (`current_ebitda`, `revenue`, `exit_multiple`). If declined, the report shows cost savings only — never invent EBITDA or a multiple.

Do not ask further structured rounds. If something is still missing (a band, a function assignment), ask it as a single plain-text question. Then proceed to the narrative.
