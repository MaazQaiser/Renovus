# Sales Assessment Agent — Output Templates v2
**Document 3 of 4** · Filled by the agent per Document 2 §7, from answers to Question Bank v3. Placeholders use `{{double_braces}}`; the app team derives the data schema from these fields. Section order and names are fixed. Kept separate so the output can change without touching the questionnaire or instructions.

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
*Parts B–F form the Baseline Report: the single shared document used by {{portco_name}}, {{pe_firm}} and Tkxel in the discovery meeting. Everything is visible to all sides.*

## {{portco_name}} — Sales Baseline Report
{{date}} · Sessions: {{session_list}} · Question bank {{qbank_version}}

### B1. Executive summary
{{exec_summary}}
<!-- 5-8 sentences, factual and plain: what kind of sales engine, the 2-3 defining numbers, how well-instrumented, the one or two most consequential findings. No adjective without a number attached. -->

### B2. How this company wins business today
{{engine_narrative}}
<!-- One paragraph on the engine overall (Phase 1), then one short paragraph per used channel from its module: what happens, at what volume, cost and outcome. -->

### B3. Gaps by used channel
| Channel | What happens today | The gap | Evidence (QIDs + one-line fact) |
|---|---|---|---|
| {{channel}} | {{current_state_line}} | {{gap_statement}} | {{evidence}} |
<!-- One row per module finding. No gap without cited evidence. Include the time-allocation gap from T2 and the capacity ceiling from CAP.2 as rows. -->

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

# PART E — Preliminary Opportunities & AI Candidates
*Hypotheses for the discovery meeting, not commitments. Each cites evidence. No revenue-impact figures; sizing happens after discovery.*

### E1. Improvement opportunities
| # | Opportunity | Evidence (QIDs + fact) | Fix type | First step |
|---|---|---|---|---|
| {{n}} | {{opportunity}} | {{evidence}} | {{Quick win < 30 days / Process change / AI initiative}} | {{step}} |
<!-- Sources: gaps from B3, wanted channels/markets with fixable blockers (CH2/CH3), parked ideas (L2), volume limits (L1), time-allocation waste (T2), team-felt gaps (T4). -->

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
