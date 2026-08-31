# Sales Assessment Agent — Output Templates v2
**Document 3 of 4** · Filled by the agent per Document 2 §7, from answers to Question Bank v3. Placeholders use `{{double_braces}}`; the app team derives the data schema from these fields. Section order and names are fixed. Kept separate so the output can change without touching the questionnaire or instructions.

---

# VISUAL LAYOUT SPEC (for the app team)
*The Baseline Report renders as an infographic, not a text document. Reference implementation: `report.html` (Tkxel brand tokens: Pulse Blue #2563EB, System Blue #10347E, Ice #E8EEFC, Graphite #1A1A2E, RAG #DC2626/#F59E0B/#16A34A; Plus Jakarta Sans + IBM Plex Mono). Component per part:*

| Report part | Renders as |
|---|---|
| B1 Headline | Three stacked statement bars: Where you are / What it means (ice, blue left-border) / Where to go (solid blue, white text) |
| B4 Key numbers | KPI cards, big blue number + mono label + colored confidence chip (A green, E blue, G amber, N red, X gray) |
| B5 Channel map | Chip row: solid blue = using · dashed amber (with blocker text) = want · gray outline = not using. CH4 bet as an ice callout beneath |
| Part C Instrumentation | Donut (conic gradient by tag shares) with measured-% in the hole, legend, and the verdict as an amber-bordered callout |
| B3 Gaps | One card per used channel: Today → Gap → If fixed as three cells with arrows, If-fixed cell solid blue; QID evidence in small mono |
| E1 Opportunities | Ranked rows (max 8): number, title, "→ directional outcome", first step, fix-type badge (quick win green / process blue / AI deep-blue) |
| E3 Path | Three columns Now / Next / Later (Now header solid blue), then the 12-month picture as a blue gradient band holding 3–4 glass tiles, each label + "today: {from}" (soft blue, small) + "→ {to}" (white, bold) |
| Part D + B6 | Two-column footer zone: open questions list · people-map mini table |
| Part F Portfolio | One line in the footer meta (anonymized) or a small quartile chip row when ≥3 portcos assessed |
| Appendix 1 answer log | Separate tab/download, never on the infographic |

*Print/PDF-safe (backgrounds forced), responsive to one column under 720px. The markdown parts below remain the authoritative content contract — the infographic is its rendering.*

---

# PART A — Interim Snapshot
*Generated at the Phase 1 gate. Shown to the CEO for live correction. One screen.*

## {{portco_name}} — Sales Snapshot
{{date}} · Answered by {{respondent_name}}, {{respondent_role}} · Phase 1 of the sales assessment

**The business:** {{b1_summary}} <!-- what they sell, typical vs top customers, customer mix -->
**Deal economics:** typical {{b2_value}} ({{b2_conf}}) · closing time {{b3_value}} ({{b3_conf}})
**Revenue:** {{b4_last}} last 12m, {{b4_prior}} prior · target {{b4_target}} — "{{b4_realism_quote}}"

**Sales engine ({{classification}}):** {{engine_summary}}
<!-- 2-3 lines from E1-E3: how clients are found, how leads are generated, how RFPs are discovered and by whom. -->
**Origination & risk:** {{e4_summary}} · CRM: {{e5_value}} · key-person exposure: {{e6_value}} ({{e6_conf}})

**Channel map (CH1):**
| Channel | Status | Blocker (if wanted) |
|---|---|---|
| {{channel}} | {{Using / Not using / Want to use}} | {{ch2_blocker or —}} |

**Markets wanted (CH3):** {{ch3_list_with_blockers}}
**Their bet (CH4):** "{{ch4_quote}}"

**Team & time:** {{t1_value}} ({{t1_conf}}) · time split {{t2_value}} ({{t2_conf}}) · tools {{t3_value}} · felt gaps: {{t4_value}}
**Volume limit (L1):** {{l1_value}} · **Parked ideas (L2):** {{l2_list}}
**One thing to fix:** "{{l3_fix_quote}}" · **Why now:** "{{l3_whynow_quote}}"

**Phase 2 plan:** {{phase2_plan}} <!-- which modules run in full, which at ★-only, with whom, when -->

---

# PART B — Baseline Report: Engine, Facts & Gaps
*Parts B–F form the Baseline Report: the single shared document used by {{portco_name}}, {{pe_firm}} and Tkxel in the discovery meeting. Everything is visible to all sides. Style rules: one line per cell, verbs over adjectives, every gap paired with a forward direction, nothing that doesn't trace to a QID. If a sentence can be cut without losing a fact or a direction, cut it.*

## {{portco_name}} — Sales Baseline Report
{{date}} · Sessions: {{session_list}} · Question bank {{qbank_version}}

### B1. The headline
**Where you are:** {{headline_now}} <!-- max 3 sentences: engine type + the 2-3 defining numbers -->
**What it means:** {{headline_meaning}} <!-- max 2 sentences: the most consequential finding, with its number -->
**Where to go:** {{headline_direction}} <!-- 1 sentence: the single highest-leverage move, phrased as direction not commitment -->
<!-- Six sentences maximum, total. No adjective without a number attached. No throat-clearing. -->

### B2. How this company wins business today
{{engine_narrative}}
<!-- One paragraph on the engine overall (max 4 sentences), then per used channel: max 3 sentences — what happens, at what volume/cost, with what outcome. Nothing else. -->

### B3. Gaps by used channel
| Channel | Today | The gap | If fixed | Evidence |
|---|---|---|---|---|
| {{channel}} | {{current_state_line}} | {{gap_statement}} | {{directional_outcome}} | {{qids_plus_fact}} |
<!-- One row per module finding, one line per cell. "If fixed" is directional, never a dollar figure: "sees 5-10x more RFPs", "frees ~half of Tariq's proposal hours", "not-nows stop dying". No gap without cited evidence. Include the T2 time-allocation gap and CAP.2 ceiling as rows. -->

### B4. Key numbers
| # | Metric | Value | Confidence | Who would know (if G/N/X) | Source Q |
|---|---|---|---|---|---|
| {{n}} | {{metric_name}} | {{value}} | {{conf}} | {{who}} | {{qid}} |
<!-- One row per quantitative answer. Keep raw phrasing honest: "roughly 40" stays "roughly 40". -->

### B5. Channel & market map (full)
| Channel / market | Status | Detail |
|---|---|---|
| {{item}} | {{Using / Wanted / Not using}} | {{for using: one-line volume+outcome · for wanted: CH2/CH3 blocker verbatim}} |

**Their bet (CH4):** "{{ch4_quote}}" — {{agrees_or_contradicts_evidence_note}}

### B6. People map
| Person / role | Appears as | Interviewed? |
|---|---|---|
| {{name_or_role}} | {{→WHO for QIDs / named originator / lead generator / suggested}} | {{yes / requested / declined / pending}} |

---

# PART C — Instrumentation Read
*Computed from confidence tags. A finding in its own right: how much of the sales function is measured, before anything is analysed.*

| Confidence | Count | Share | What it means |
|---|---|---|---|
| A — Actual | {{a_count}} | {{a_pct}} | Measured; verifiable from a system. |
| E — Estimate ±20% | {{e_count}} | {{e_pct}} | Known well enough to model on. |
| G — Guess | {{g_count}} | {{g_pct}} | Must be established by observation before it carries a number. |
| N — Not recorded | {{n_count}} | {{n_pct}} | Instrumentation gap; usually the first thing worth fixing. |
| X — Exists, can't extract | {{x_count}} | {{x_pct}} | Access problem, not measurement. Escalation list. |

**Measured share (A+E): {{measured_pct}}**
{{instrumentation_verdict}}
<!-- Mandatory when < 40%: "Below 40% measured, the cost side of any business case must be built by observation rather than taken from this assessment." Name the weakest modules. -->

**By module/part:** {{per_module_table}}

---

# PART D — Open Questions for the Discovery Meeting
*What the assessment could not resolve — the discovery meeting's working agenda.*

1. {{open_item}}
<!-- Each: the gap, why it matters, who holds the answer (→WHO), QIDs. Include pending/declined interviews, the X-tag extraction list, document-vs-answer contradictions, respondent-vs-respondent disagreements (e.g. MK5 vs M-OUT.5), and CAP.2's unverified delivery ceiling. -->

---

# PART E — Opportunities & The Path Forward
*Hypotheses for the discovery meeting, not commitments. Each cites evidence. Directional outcomes, no dollar figures; sizing happens after discovery.*

### E1. Improvement opportunities
| # | Opportunity | Evidence | Fix type | Expected outcome (directional) | First step |
|---|---|---|---|---|---|
| {{n}} | {{opportunity}} | {{qids_plus_fact}} | {{Quick win < 30 days / Process change / AI initiative}} | {{directional_outcome}} | {{step}} |
<!-- One line per cell. Max 8 rows — if more qualify, the rest go to Appendix 1 territory, not here. Sources: B3 gaps, CH2/CH3 fixable blockers, L2 parked ideas, L1 volume limits, T2 time waste, T4 felt gaps. Rank by impact x ease. -->

### E2. AI initiative candidates
| Candidate | Typical trigger evidence | Selected? | This company's evidence |
|---|---|---|---|
| Opportunity/RFP discovery & fit-scoring | M-RFP.1 coverage gap; E3 manual watching; L1 volume limit | {{y/n}} | {{evidence}} |
| Go/no-go scorecard support | M-RFP.2 abandoned hours; M-RFP.3 gut-call | {{y/n}} | {{evidence}} |
| Proposal / response first-draft generation | M-RFP.4 hours; M-RFP.5 reuse + unsearchable library | {{y/n}} | {{evidence}} |
| Past-work & pricing library, indexed | M-RFP.5 "folders by year" / "ask {{name}}" | {{y/n}} | {{evidence}} |
| Pre-outreach account research briefs | M-OUT.1–2 low conversation rate | {{y/n}} | {{evidence}} |
| AI-assisted outreach drafting (human review) | M-OUT.1 low volume; CH1 outreach wanted; X2 conditions | {{y/n}} | {{evidence}} |
| Speed-to-lead automation | M-OUT.4 slow inbound response | {{y/n}} | {{evidence}} |
| "Not now" re-engagement triggers | M-OUT.3 nothing happens | {{y/n}} | {{evidence}} |
| Relationship-signal capture (CRM from inbox/calls) | M-REL.2 "inboxes and heads"; M-REL.4 nobody notices | {{y/n}} | {{evidence}} |
| Account-review & expansion-signal cadence | M-REL.3 no cadence, client-initiated expansion | {{y/n}} | {{evidence}} |
| Event follow-up automation | M-FLD.3 contacts go nowhere | {{y/n}} | {{evidence}} |
| Loss-reason capture & win/loss analysis | M-RFP.6 not recorded | {{y/n}} | {{evidence}} |
| Sales-time recovery (admin/reporting automation) | T2 time split; S4 nominated task | {{y/n}} | {{evidence}} |
| Instrumentation fix (CRM hygiene, basic tracking) | Part C measured share < 40%; E5 | {{y/n}} | {{evidence}} |

### E3. The path from here — first 90 days
**Now (weeks 1–4):** {{now_items}} <!-- 1-3 quick wins from E1, each one line: action + owner-role + the QID evidence it rests on -->
**Next (weeks 5–12):** {{next_items}} <!-- 1-3 process changes or first AI builds, each one line -->
**Later (post-discovery):** {{later_items}} <!-- 1-2 lines: what needs discovery-meeting decisions or observation first (link to Part C if instrumentation gates it) -->
**What should be true in 12 months:** 3–4 target tiles, each `{{target_label}}` + `{{from_state}}` (today, short) + `{{to_state}}` (the 12-month state, directional). <!-- Rendered as from→to tiles on the blue band, not prose. Ties to L3a/X4 where possible. Example tile: label "RFP COVERAGE" · from "2 of 50 portals, part-time" · to "10x+ coverage, weekly triage habit". -->
<!-- This section is the forward view: concrete, sequenced, owner-shaped — but still pre-discovery. Verbs, not adjectives. Every item traces to evidence. -->

**Readiness note:** {{ai_readiness_note}}
<!-- 2-3 sentences from S1-S4 + X2: current AI usage, where data lives, and the CEO's stated condition for AI touching customer-facing work — quoted. -->

---

# PART F — Portfolio Context
*Visible to both sides. Anonymized: no other portfolio company named or identifiable.*

| Dimension | This company | Portfolio position |
|---|---|---|
| {{dimension}} | {{value}} | {{"top quartile / mid-pack / lower quartile of {{n}} assessed"}} |
<!-- Dimensions: measured share (Part C), engine type, channel breadth (channels in active use), key-person exposure (E6), sales-time-on-selling share (T2), loss-reason instrumentation. Only where ≥3 portcos assessed; otherwise: "first companies assessed — benchmark builds as the portfolio completes." -->

{{portfolio_note}}

---

## Appendix 1 — Full answer log
| QID | Question (short) | Respondent | Answer | Confidence | →WHO |
|---|---|---|---|---|---|
| {{qid}} | {{q_short}} | {{role}} | {{answer}} | {{conf}} | {{who}} |

## Appendix 2 — Handoff notes for other agents
| Topic | Quote | Suggested agent |
|---|---|---|
| {{topic}} | "{{quote}}" | {{agent}} |

---
*Generated by the Sales Assessment Agent · Question bank {{qbank_version}} · Sessions {{session_list}} · Produced from {{portco_name}}'s own answers; the shared starting point for the discovery meeting with Tkxel.*
