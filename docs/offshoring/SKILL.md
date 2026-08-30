---
name: renovus-outsourcing-assessment
description: "Turn a Renovus Capital portfolio company's org and payroll data into a consultancy-grade Workforce Sourcing Assessment run by Renovus itself: which portco roles and functions can be outsourced, under which model (lift-out, hybrid, or role-by-role), what it saves, and what that is worth in EBITDA uplift and implied enterprise value at exit — delivered as a Renovus-branded tabbed executive dashboard plus an optional full consulting report. Use whenever someone provides or describes a portco's headcount, org chart, HRIS/payroll export, salary bands, or role list and wants outsourcing potential, offshoring savings, cost-to-serve reduction, workforce cost optimization, right-shoring, margin improvement, or an EBITDA case from labor arbitrage. Trigger even without the word 'outsourcing' — e.g. 'analyze this portco's payroll for savings', 'which teams could move offshore', 'what's the EBITDA opportunity here' — and for re-runs or references to the Renovus sourcing template."
---

# Portco Workforce Sourcing Assessment (Renovus Capital)

The default output is an **executive dashboard**: a single HTML file with a horizontal tab bar and one screen per tab — no scrolling page. Six tabs (The answer · Where the cost sits · What can move · What it saves · How it happens · Risks & next steps) each fit a 1280×800 viewport with one visual, big numbers and at most one sentence of interpretation; a seventh "Detail" tab scrolls and holds everything a CFO needs to check the numbers. **Tab 1 opens with a 4–6 sentence plain-English executive summary — full human sentences a CEO could read aloud — before any tiles or charts appear.** Arrow keys switch tabs; printing lays all tabs out in sequence. This format is not optional: **never ship a long single-scroll page as the executive output.** A **detailed** consulting report is available with `--mode detailed` when someone explicitly asks for the working; the same `narrative.json` feeds both.

Produce a deliverable Renovus Capital's deal team or operating partners use on one of Renovus's **own portfolio companies**. The portco's org and pay data goes in; a defensible answer to "what should this portco outsource, how, what does it save, and what is that worth to the investment" comes out. Depending on the round-3 audience answer, the report is handed to portco leadership as a joint plan or reviewed Renovus-internally first. It must survive a CFO reading it, so every number traces to a stated assumption and every recommendation has a rationale.

The Renovus deal team supplies the offshore cost assumptions each run (blended per function, from vendor quotes or benchmarks across the portfolio). The skill does not carry a rate card and is vendor-agnostic — recommendations name a "sourcing partner" unless the deal team names a vendor. Your judgment supplies the outsourcing-potential scores; the scripts do the deterministic math so figures reconcile across sections.

## Pipeline at a glance

```
1. Ingest      scripts/normalize_input.py  → work/roles.json (anonymized) + work/id_map.json (private)
2. Discovery   3 rounds × 3 questions via ask_user_input_v0 (references/discovery-questions.md)
3. Score       you write work/assumptions.json (scores + cost assumptions) → scripts/score_and_model.py → work/analysis.json
4. Confirm     show headline numbers + heatmap inline, run discovery round 3 + the value-creation question, adjust, re-run
5. Narrate     you write work/narrative.json (prose for every section incl. the _short dashboard fields, references/report-spec.md)
6. Build       scripts/build_report.py (tabbed dashboard by default; --mode detailed for the long form) → QA every tab, present
```

Work in `/home/claude/work/` (or a `work/` folder next to the input). Only the final HTML goes to outputs. `id_map.json` (real names → role IDs) never leaves the working folder and never appears in the report.

## Step 1 — Ingest and normalize

Inputs arrive in any of four shapes. Detect which and set the **data tier**, because tier drives model depth:

| Tier | What you have | Savings depth |
|------|---------------|---------------|
| **A** | Row-per-person with salary (HRIS/payroll export) | Full: loaded cost, offshore delta, transition one-offs, ramp, 3-year cumulative, scenarios, per-role movers |
| **B** | Headcount by function/level with salary bands or averages | Run-rate: loaded midpoints × headcount, transition estimate, 3-year, scenarios; no per-person precision |
| **C** | Org chart / titles only, no pay | Potential only until bands are supplied — ask for bands per function in Discovery round 1, then it becomes Tier B |

Run the normalizer on files; for pasted tables, save them as CSV first:

```bash
python3 scripts/normalize_input.py <file.xlsx|file.csv> --client "Portco Name" --geo US --currency USD --out work/
```

It fuzzy-maps column headers, infers level from title keywords, assigns anonymized IDs like `RCM-014`, and reports the tier and any columns it couldn't place. Check its summary: if it mis-mapped a column, pass `--map "Comp=ignore"` style overrides and re-run. If functions are inconsistent ("RCM", "Billing", "Revenue Cycle"), pass `--function-alias "Billing=Revenue Cycle"`. The seed taxonomy covers Renovus's sectors — revenue cycle, clinical, credentialing, enrollment/admissions, instruction — alongside the standard tech and back-office functions; clinical and licensed roles seed to Low and stay onshore.

Never proceed with a guessed function taxonomy silently: the function list becomes the spine of the heatmap and the discovery questions, so confirm it with the deal team in round 1.

## Step 2 — Discovery (three rounds, three questions each)

Read `references/discovery-questions.md` and run exactly three rounds using `ask_user_input_v0`, three questions per round, tappable options plus an "I'll type it" escape where a number is needed:

- **Round 1 (after ingest):** confirm function taxonomy and scope, portco sector and hold stage (drives constraints and framing), and Tier C band collection.
- **Round 2 (before scoring):** offshore cost as % of onshore loaded cost per function (deal-team assumption or vendor quote), transition/overlap assumptions, and constraints that cap outsourceability (PHI/PCI/FERPA, payer or client contracts, licensure/accreditation, union/WARN).
- **Round 3 (after first scoring pass, with results shown inline):** sanity-check the heatmap, choose the headline scenario, and set the implementation model and audience (portco-facing vs Renovus-internal).
- **After round 3, always ask the value-creation question** (one plain-text question): current EBITDA, revenue if handy, and the deal model's exit multiple → `value_creation` in assumptions. If declined, the report shows cost savings only; never invent an EBITDA or a multiple.

Keep the intro before each round to one or two sentences and, in round 3, put the actual numbers and the function-level heatmap in that intro so the deal team is reacting to output, not to abstractions.

## Step 3 — Score outsourcing potential

Read `references/scoring-rubric.md` before scoring. Five dimensions, each 1–5, higher = more outsourceable: codifiability (30%), customer/stakeholder exposure inverse (20%), IP/data/regulatory sensitivity inverse (20%), seniority/institutional knowledge inverse (15%), offshore/nearshore talent availability (15%) → composite 0–100. Bands: **High ≥ 70**, **Medium 50–69**, **Low < 50 (retain)**.

`assets/default_scores.json` seeds scores by function keyword × level. Your job is to override where the title or context says otherwise (a "Billing Specialist" who is the named contact for the top payer is not a queue worker; any licensed clinical role stays Low regardless of arithmetic). Write overrides into `work/assumptions.json` under `score_overrides` keyed by role ID, with a one-line `reason` each — those reasons surface in the appendix and are what make the report defensible.

Then:

```bash
python3 scripts/score_and_model.py work/roles.json work/assumptions.json --out work/analysis.json
```

The script picks an engagement model per function (lift-out / hybrid / role-by-role / retain), computes savings for three scenarios, builds three transition waves, computes EBITDA uplift and implied EV when `value_creation` is supplied, and writes every intermediate number so the report reconciles. Read `references/savings-model.md` to understand what it computes.

## Step 4 — Confirm inline, then round 3

Print, in chat, the headline numbers (addressable FTEs, current loaded cost, base-case annual run-rate savings, 3-year cumulative net of transition, EBITDA uplift if supplied) and a compact function × level heatmap table with the chosen model per function. Then run discovery round 3 and the value-creation question. Apply changes, re-run the script, and only move on when the deal team is satisfied. This is the last cheap point to fix a wrong score.

## Step 5 — Write the narrative

Read `references/report-spec.md` for section-by-section content requirements, the consulting voice, and the `narrative.json` schema. The voice: answer first, evidence second, hedge stated as an assumption rather than a mood. No hype words. Every function recommendation names the model, the rationale in one sentence, and the main risk. Owners are Portco | Renovus | Vendor | Joint.

Two narrative rules matter more than the rest:

- **`summary_exec` is the first thing anyone reads.** 4–6 full sentences, ≤640 characters, plain English with a human cadence — what we assessed, what we found (the two numbers that matter), what it's worth to the investment, what we'd do first, and the one caveat. No bullet fragments, no jargon, no "leverage".
- **Write every `_short` field** (`summary_exec`, `key_findings_short`, all five `captions_short`). The dashboard has hard budgets and `build_report.py` prints `LENGTH:` warnings when a field busts one; fix the prose, never the layout.

## Step 6 — Build, QA, present

```bash
# executive dashboard (default)
python3 scripts/build_report.py work/analysis.json work/narrative.json \
  --out /mnt/user-data/outputs/Sourcing_Assessment_<Portco>.html

# full consulting report, only when asked for the working
python3 scripts/build_report.py work/analysis.json work/narrative.json --mode detailed \
  --out /mnt/user-data/outputs/Sourcing_Assessment_<Portco>_detailed.html
```

If the official Renovus logo SVG is available, drop it at `assets/logo.svg` (or pass `--logo`) and it replaces the text wordmark in both outputs.

QA the dashboard tab by tab, never as one tall image — use `?tab=N` in the URL (wkhtmltoimage silently drops `#fragment`s; the page reads both):

```bash
for n in 1 2 3 4 5 6 7; do wkhtmltoimage --quiet --width 1280 --height 800 \
  --disable-smart-width --javascript-delay 400 \
  "file:///mnt/user-data/outputs/Sourcing_Assessment_<Portco>.html?tab=$n" /tmp/t$n.png; done
```

View every one. If content overflows a tab, **shorten the narrative string** — never shrink fonts, never let a tab scroll. A font/network warning from wkhtmltoimage is expected and harmless — the report loads its fonts from Google Fonts in the browser and falls back to system fonts offline. For `--mode detailed`, rasterize at width 1100 and view in ~1300px slices. Check that:

- the KPI tiles on tab 1 match the scenario table and the Appendix A totals, and the tab-1 summary paragraph reads as 4–6 natural sentences
- the heatmap has every function confirmed in round 1, and Leadership is neutral/absent per the tab design
- no real names leaked: `grep -c` the HTML for a few names from `id_map.json` and expect 0
- the scenario table shows all three scenarios with the headline row highlighted
- the three waves together cover every High/Medium role in a non-retained function exactly once, and no Low or Leadership role appears in a wave
- narrative numbers (summary, key findings) equal the numbers in `analysis.json`, including the EBITDA/EV figures
- spacing is consistent: no element touching a tab edge, no orphaned half-empty columns — this is a board-grade document

Fix and rebuild rather than caveat. The scripts are deterministic, so a mismatch is always in the narrative or the assumptions, never the math.

Present the single HTML file.

## Brand

Official Renovus brand: gold `#FCB900` accent (fills only — never as text on white), ink `#1D252D`, amber text `#8A6400` for small colored labels, grey `#8A94A0`. The official logo ships at `assets/logo.svg` and is inlined automatically (a white-text variant is generated for the dark report cover). Do not reintroduce red.

## Guardrails that keep the report credible

- The executive output is the tabbed dashboard. Do not substitute a long scrolling page, whatever the time pressure.
- Write the `_short` narrative fields. The dashboard has no fallbacks for them and `LENGTH:` warnings are release blockers.
- The dashboard script must never write to `history` or `location.hash` — sandboxed viewers (the claude.ai file preview, `file://`, iframes) throw an uncaught SecurityError and the tabs stop working. It reads the hash once on load, inside a try/catch. Keep it that way if you touch the template.
- The templates deliberately avoid CSS variables, flex `gap` and `height:100%` chains: the QA renderer supports none of them. Colors are hardcoded hex, spacing uses margins, and `main` is pinned with `calc(100vh - 112px)`. Trailing whitespace at the bottom of a wkhtmltoimage capture is a renderer artifact, not a layout bug — only *overflow* is a real failure.
- Tab 3 caps the heatmap at 12 functions and the movers table at 10 with a roll-up line. Raise `TOP_N` / `MOVERS_N` in `build_report.py` only after re-running tab QA.
- If the deal team picks `conservative` as the headline, Wave 3 will show a near-zero saving because the conservative scenario values the Medium band at zero. That is arithmetic, not a bug — say so in `captions_short.waves` and give the base-case figure for that wave in `roadmap.sequencing`.
- Do not invent salaries, EBITDA, or exit multiples. Tier C without bands produces potential only; no `value_creation` input means no EBITDA or EV lines anywhere.
- Implied EV at exit is always labeled illustrative — run-rate saving capitalized at the deal model's multiple — never presented as a valuation.
- Do not present offshore rates as vendor pricing unless the deal team said a quote is in hand. Label them "Renovus deal team assumption" (they render that way in the assumptions register).
- Always show the conservative scenario next to the base case; a CFO that sees only one number distrusts it.
- Leadership, Low-band, and licensed clinical roles are never in a wave. If the deal team wants a leader's team moved under that leader, that is a hybrid model note, not a score change.
- Keep individual-level data in the appendix only, anonymized. Function-level aggregates carry the body.
