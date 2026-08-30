# Outsourcing Potential Scoring Rubric

Score every non-leadership role on five dimensions, 1–5. Composite = weighted sum, rescaled to 0–100. The script does the math; you supply the judgment, especially the overrides.

## Dimensions

| # | Dimension | Weight | 5 = most outsourceable | 1 = least outsourceable |
|---|-----------|--------|------------------------|-------------------------|
| 1 | **Codifiability** | 30% | Repeatable, documented, ticket/queue driven, measurable output (L1 support, QA execution, AP/AR, claims processing, standard dev tickets) | Novel problem-solving, undefined scope, judgment on incomplete information (architecture, strategy, clinical judgment, research) |
| 2 | **Customer / stakeholder exposure** (inverse) | 20% | No external contact, internal handoffs only | Owns client, payer, student or key-account relationships; in-person presence expected |
| 3 | **IP / data / regulatory sensitivity** (inverse) | 20% | Non-sensitive data, no regulated access, no core IP | Handles PHI/PCI/FERPA/classified data without a compliant offshore setup, core algorithms, M&A or board material, or roles a regulator/accreditor requires onshore |
| 4 | **Seniority & institutional knowledge** (inverse) | 15% | Junior/mid, role learnable in weeks from docs | Deep tacit knowledge, decade of context, single point of failure |
| 5 | **Offshore/nearshore talent availability** | 15% | Abundant in major delivery markets (India, Pakistan, Philippines, LATAM, Eastern Europe): standard SWE, QA, data, support, finance ops, revenue cycle | Rare skills, US-licensed professions (clinical, legal, CPA sign-off), language/locale-specific work |

Composite: `((0.30·d1 + 0.20·d2 + 0.20·d3 + 0.15·d4 + 0.15·d5) − 1) / 4 × 100`

## Bands

| Band | Composite | Meaning in the report |
|------|-----------|-----------------------|
| **High** | ≥ 70 | Outsource in Wave 1–2; counted in every scenario |
| **Medium** | 50–69 | Outsource with hybrid safeguards or in Wave 2–3; 50% counted in base case, 100% in aggressive, 0% in conservative |
| **Low** | < 50 | Retain; appears in appendix with reason, never in a wave |

Leadership level (VP, Director, Head, Chief) is scored for completeness but forced to Low and excluded from savings. If the deal team wants a leader's team offshored under that leader, that is the hybrid model, not a score change.

## Default scores by function × level

`assets/default_scores.json` seeds d1–d5 by matching function keywords and level. Typical seeds (d1,d2,d3,d4,d5):

| Function keyword | Junior/Mid | Senior | Lead |
|------------------|-----------|--------|------|
| Revenue Cycle / medical billing / claims | 5,4,3,4,5 | 4,4,3,3,5 | 3,3,2,2,4 |
| Clinical / licensed care delivery | 2,1,2,3,1 | 1,1,1,2,1 | 1,1,1,1,1 |
| Credentialing / provider enrollment | 5,4,3,4,4 | 4,4,3,3,4 | 3,3,3,2,3 |
| Enrollment / admissions / student services | 4,3,3,4,4 | 3,3,3,3,4 | 2,2,2,2,3 |
| Instruction / curriculum / faculty | 3,2,3,3,3 | 2,2,3,2,3 | 1,1,2,1,2 |
| Engineering / Software / Dev | 4,4,3,4,5 | 3,4,3,3,5 | 2,3,3,2,4 |
| QA / Test | 5,5,4,4,5 | 4,4,4,3,5 | 3,4,4,2,5 |
| Support / Helpdesk / Service Desk | 5,3,4,5,5 | 4,3,4,4,5 | 3,3,4,3,4 |
| Data / Analytics / BI | 4,4,3,4,5 | 3,4,3,3,4 | 2,3,2,2,4 |
| DevOps / Cloud / Infra / IT | 4,5,3,4,5 | 3,5,3,3,5 | 2,4,2,2,4 |
| Finance Ops / AP / AR / Payroll | 5,4,3,4,4 | 4,4,3,3,4 | 2,3,2,2,3 |
| HR Ops / Recruiting coordination | 4,3,3,4,4 | 3,3,3,3,4 | 2,2,2,2,3 |
| Design / UX | 3,4,4,3,4 | 2,4,4,2,4 | 2,3,4,2,3 |
| Product Management | 2,2,3,3,3 | 1,2,3,2,3 | 1,1,2,1,2 |
| Sales / Account Management | 2,1,3,3,2 | 1,1,3,2,2 | 1,1,2,1,2 |
| Marketing (ops / content / performance) | 4,3,4,4,4 | 3,3,4,3,4 | 2,2,3,2,3 |
| Legal / Compliance / Security | 2,3,1,3,2 | 1,3,1,2,2 | 1,2,1,1,2 |
| Operations (generic) | 3,3,3,4,4 | 3,3,3,3,4 | 2,3,3,2,3 |

Unmatched functions get 3,3,3,3,3 and the script flags them as `needs_review`. Review every flag.

## When to override the default

Override (with a `reason`) whenever the title, location, or discovery answers contradict the seed:

- Title carries a modifier: "Embedded", "Field", "Enterprise", "Executive", "Principal", "Founding", "Onsite", "Licensed", "Registered", "Board Certified" → lower d2/d4 (or d5 for licensure); "L1", "Tier 1", "Associate", "Coordinator" → raise d1.
- Discovery says a function handles regulated data (PHI, PCI, FERPA, banking core) **without** a compliant offshore setup (e.g. no BAA-covered vendor) → set d3 ≤ 2 for that function. If the portco already runs BAAs with offshore vendors, PHI-handling ops roles keep their seed d3.
- Discovery says a client/payer contract, accreditor, or state-authorization rule requires onshore or in-state staff → set d2 = 1 (contract) or d5 = 1 (licensure) for those roles; note it in constraints.
- Clinical, therapeutic, and other US-licensed delivery roles are never offshored regardless of composite; if a seed or title mismatch pushes one above Low, override it down with reason "licensed care delivery".
- Portco geography with strong data-residency law (EU, some Gulf sectors) → cap d3 at 3 unless a compliant delivery setup is in scope.
- A function with one person is a key-person risk; lower d4 for that person by 1.

## Engagement model per function

The script applies these rules to each function after scoring; you can override with `model_overrides` in assumptions.

| Condition (checked in order) | Model | Report wording |
|-----------|-------|----------------|
| ≥ 70% of function FTEs are High, and leads (if any) average ≥ 50 | **Function lift-out** | "Move the function to a dedicated managed-service team at the sourcing partner, with a retained onshore owner at the portco" |
| ≥ 30% High and ≥ 50% High+Medium | **Hybrid (keep leads/seniors, offshore the delivery layer)** | "Retain leads and client-facing seniors onshore; the sourcing partner supplies the delivery layer via a dedicated pod or staff augmentation" |
| Any High or Medium roles, below the thresholds above | **Role-by-role** | "Selective backfill of named roles with offshore equivalents on attrition or by plan" |
| No High or Medium roles | **Retain** | "Keep onshore; revisit after process documentation" |

State the model, the one-sentence rationale, and the principal risk for every function in the report body. "Sourcing partner" stays vendor-agnostic unless the deal team named a vendor in discovery.
