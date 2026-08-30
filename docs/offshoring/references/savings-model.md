# Savings Model

Depth follows the data tier. Every number the script writes into `analysis.json` is derived from these formulas and the assumptions in `assumptions.json`; the report's methodology appendix should describe them in plain language.

## Assumptions file (`work/assumptions.json`)

```json
{
  "client": { "name": "Behavioral Health Portco", "geography": "US", "currency": "USD" },
  "loaded_multiplier": 1.35,
  "offshore_pct_by_function": { "Revenue Cycle": 0.30, "Engineering": 0.40, "Finance Ops": 0.35, "default": 0.40 },
  "offshore_pct_overrides": { "ENG-007": 0.55 },
  "transition": {
    "recruit_fee_pct_of_offshore_annual": 0.15,
    "overlap_months": 2,
    "year1_realization": 0.60,
    "wave_start_months": [0, 4, 9]
  },
  "scenarios": {
    "conservative": { "high": 0.80, "medium": 0.00, "offshore_pct_adj": 1.15 },
    "base":         { "high": 1.00, "medium": 0.50, "offshore_pct_adj": 1.00 },
    "aggressive":   { "high": 1.00, "medium": 1.00, "offshore_pct_adj": 0.90 }
  },
  "headline_scenario": "base",
  "value_creation": { "current_ebitda": 8500000, "revenue": 62000000, "exit_multiple": 9.0 },
  "constraints": [ "Clinical documentation team handles PHI — vendor must be BAA-covered" ],
  "score_overrides": { "SUP-003": { "d2": 2, "reason": "Named contact on top-5 payer accounts" } },
  "model_overrides": { "Design": "hybrid" },
  "bands_by_function": { "Support": { "Junior": 48000, "Mid": 58000, "Senior": 72000, "Lead": 95000 } }
}
```

- `loaded_multiplier` converts base salary to fully loaded cost (benefits, employer taxes, tooling, facilities). US 1.25–1.40, UK 1.20–1.30, EU 1.35–1.55 are typical; ask, don't assume.
- `offshore_pct_by_function` is the deal team's blended offshore cost as a fraction of onshore **loaded** cost. This is the single most important input and is always attributed in the report as "Renovus deal team assumption" (or to a named vendor quote when one is in hand).
- `value_creation` is optional. Omit it entirely rather than guessing: never invent an EBITDA or a multiple.
- `bands_by_function` is used only when roles lack pay (Tier C → B). Midpoints of provided bands are fine.

## Per-role computation

```
loaded_cost        = loaded_cost_given  OR  base_salary × loaded_multiplier  OR  band_midpoint × loaded_multiplier
offshore_cost      = loaded_cost × offshore_pct[function or override] × scenario.offshore_pct_adj
gross_saving       = loaded_cost − offshore_cost
inclusion_factor   = scenario.high if band == High; scenario.medium if Medium; 0 if Low or Leadership
annual_saving      = gross_saving × inclusion_factor
transition_one_off = (offshore_cost × recruit_fee_pct) + (loaded_cost × overlap_months / 12), × inclusion_factor
```

Tier B roles are synthetic rows (one per headcount unit at the band midpoint), so the same formulas apply and per-role precision is simply lower — say so in the report.

## Aggregation

- **Current loaded cost** — sum of loaded_cost for all roles (whole org), and separately for in-scope functions.
- **Addressable** — roles in High + Medium (count, loaded cost, share of total).
- **Annual run-rate saving** (per scenario) — sum of annual_saving at steady state.
- **Year 1** = run-rate × `year1_realization` (captures staggered waves + overlap); **Year 2, 3** = run-rate.
- **3-year cumulative net** = Y1 + Y2 + Y3 − transition one-offs.
- **Payback months** = transition_one_off / (run-rate / 12), rounded up.

## Value creation (when `value_creation` is supplied)

Computed per scenario and surfaced for the headline scenario:

```
ebitda_uplift_pct   = run_rate_saving / current_ebitda            (savings drop to EBITDA ~1:1 at steady state)
margin_uplift_pts   = run_rate_saving / revenue × 100             (only if revenue given)
implied_ev_uplift   = run_rate_saving × exit_multiple             (only if exit_multiple given)
```

The implied EV figure is always labeled as illustrative — "run-rate saving capitalized at the deal model's exit multiple" — and never presented as a valuation. If the deal team gave neither EBITDA nor a multiple, none of these lines appear anywhere in the report.

Report the base case as the headline unless the deal team chose otherwise in round 3, and always show conservative beside it.

## Waves

| Wave | Contents | Typical start |
|------|----------|---------------|
| 1 — Quick wins | High band, Junior/Mid level, in functions recommended for lift-out | Month 0–3 |
| 2 — Core transition | Remaining High band Junior/Mid/Senior (hybrid and role-by-role functions); Medium band Junior/Mid in lift-out functions | Month 4–8 |
| 3 — Complex / hybrid | Everything else still addressable: Medium band Senior/Lead, Medium Junior/Mid outside lift-out functions, High Leads | Month 9–12 |

Each wave lists FTE count, loaded cost moving, run-rate saving, and the functions involved. Roles appear in exactly one wave; Low and Leadership never appear.

## What the depth tiers change in the report

| Section | Tier A | Tier B |
|---------|--------|--------|
| Role-level appendix | Every role with scores, loaded cost, offshore cost, saving | Rows per function × level with headcount, band midpoint |
| Savings precision | To the role | To the function × level |
| Transition cost | Computed per role | Computed per synthetic row; label "estimate" |
| Ramp | Year 1 realization applied | Same |
| Scenario table | All three | All three |

Tier C without bands: skip savings entirely, produce heatmap, models, waves (as sequencing), and an explicit "Data required to quantify" callout.
