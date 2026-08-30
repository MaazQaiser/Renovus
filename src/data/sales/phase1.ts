import type { SalesQuestion } from "@/types/sales-assessment";
import { BLOCKER_OPTIONS } from "./channels";

/**
 * PHASE 1 — CEO Baseline of `1_Sales_Agent_Questionnaire_v3.md`:
 * Part 1 the business (B1–B4), Part 2 the sales engine (E1–E6),
 * Part 3 the channel map (CH1–CH4, plus the added CH1b dominance probe),
 * Part 4 team, tools & time (T1–T4), Part 5 limits & pain (L1–L3).
 * `question` is the spec's literal "Shown as" line; `why` is its "Why" line.
 */

export const PHASE1_QUESTIONS: SalesQuestion[] = [
  // ── Part 1 — The business ─────────────────────────────────────────────
  {
    id: "B1",
    section: "business",
    sessionKey: "phase1",
    question:
      "In a couple of lines: what does {{company}} sell, and who buys it? And who are your typical customers versus your top ones — government, large enterprise, mid-market, something else?",
    why: "Offering plus customer mix, which sets how everything after is read.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 1,
    options: [
      { id: "government", label: "Mostly government and public sector buyers" },
      { id: "enterprise", label: "Mostly large enterprise accounts" },
      { id: "mid-market", label: "Mostly mid-market companies" },
      { id: "smb", label: "Mostly small businesses or consumers" },
      { id: "mixed", label: "A genuine mix, no single segment dominates" },
    ],
    followUps: [
      {
        id: "B1.f1",
        prompt: "Is that concentration by design, or just where the network reached?",
        when: { kind: "optionIds", ids: ["government", "enterprise", "mid-market", "smb"] },
        options: [
          { id: "by-design", label: "By design — we chose that segment" },
          { id: "network", label: "Just where the network reached" },
          { id: "both", label: "Started accidental, now deliberate" },
        ],
      },
      {
        id: "B1.f2",
        prompt: "What makes the top ones different — size, sector, how you won them?",
        when: { kind: "always" },
        options: [
          { id: "size", label: "They're simply much bigger" },
          { id: "sector", label: "Different sector or use case" },
          { id: "won", label: "Won differently — relationship or a single big pursuit" },
          { id: "tenure", label: "Longer tenure, so they've grown with us" },
        ],
      },
    ],
  },
  {
    id: "B2",
    section: "business",
    sessionKey: "phase1",
    question: "Average deal size — and the smallest and largest you closed last year?",
    why: "Deal economics decide which fixes are worth the effort.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: true,
    order: 2,
    options: [
      { id: "under-25k", label: "Under $25k" },
      { id: "25k-100k", label: "$25k–$100k" },
      { id: "100k-500k", label: "$100k–$500k" },
      { id: "500k-2m", label: "$500k–$2m" },
      { id: "over-2m", label: "Over $2m" },
    ],
    followUps: [
      {
        id: "B2.f1",
        prompt: "The range is exactly what I want — roughly smallest and largest?",
        when: { kind: "includes", tokens: ["varies", "depends", "range", "hard to say"] },
      },
    ],
  },
  {
    id: "B3",
    section: "business",
    sessionKey: "phase1",
    question: "And average closing time — first contact to signed contract, typical not best?",
    why: "Cycle-length baseline, later compared to where they say time is lost.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: true,
    order: 3,
    options: [
      { id: "under-1m", label: "Under a month" },
      { id: "1-3m", label: "One to three months" },
      { id: "3-6m", label: "Three to six months" },
      { id: "6-12m", label: "Six to twelve months" },
      { id: "over-12m", label: "More than a year" },
    ],
    followUps: [
      {
        id: "B3.f1",
        prompt: "Different for government versus commercial?",
        when: {
          kind: "includes",
          tokens: ["government", "public sector", "commercial", "both", "mix"],
        },
      },
    ],
  },
  {
    id: "B4",
    section: "business",
    sessionKey: "phase1",
    question:
      "Revenue over the last 12 months and roughly the year before? And the target for the next 12 — does it feel realistic from where you sit?",
    why: "Size, trajectory, and the gap this assessment exists to close.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: true,
    order: 4,
    options: [
      { id: "growing-fast", label: "Growing fast — up more than 20% year on year" },
      { id: "growing-steady", label: "Growing steadily — single-digit to 20%" },
      { id: "flat", label: "Roughly flat" },
      { id: "declining", label: "Down on last year" },
    ],
    followUps: [
      {
        id: "B4.f1",
        prompt: "Gut feel — comfortable, stretch, or hope?",
        when: { kind: "always" },
        options: [
          { id: "comfortable", label: "Comfortable" },
          { id: "stretch", label: "Stretch" },
          { id: "hope", label: "Hope" },
        ],
      },
    ],
  },

  // ── Part 2 — The sales engine ─────────────────────────────────────────
  {
    id: "E1",
    section: "engine",
    sessionKey: "phase1",
    question:
      "How do you find clients today? Field sales, inside sales or outbound, RFPs, referrals, inbound enquiries, partners — walk me through which of these actually bring you business, and anything I've missed.",
    why: "The engine's source list, in their words.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 5,
    options: [
      { id: "referrals", label: "Mostly referrals and word of mouth" },
      { id: "rfp", label: "Mostly RFPs and formal tenders" },
      { id: "outbound", label: "Mostly outbound and inside sales" },
      { id: "inbound", label: "Mostly inbound enquiries and marketing" },
      { id: "mixed", label: "A real mix across several sources" },
    ],
    followUps: [
      {
        id: "E1.f1",
        prompt: "The last three new clients — where did each actually come from?",
        when: {
          kind: "includes",
          tokens: ["mostly", "mainly", "referral", "word of mouth", "just comes"],
        },
      },
    ],
  },
  {
    id: "E2",
    section: "engine",
    sessionKey: "phase1",
    question:
      "And how are leads actually generated — who does the generating, and what does a week of it look like?",
    why: "Separates a lead-generation function from leads-that-happen.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 6,
    options: [
      { id: "dedicated", label: "A dedicated person or team generates leads every week" },
      { id: "part-time", label: "Senior people do it between delivery work" },
      { id: "founder", label: "Largely the founder or MD personally" },
      { id: "just-comes", label: "It mostly just comes in — nobody generates it" },
    ],
    followUps: [
      {
        id: "E2.f1",
        prompt: "So if enquiries stopped tomorrow, is there a muscle that could go get leads?",
        when: { kind: "optionIds", ids: ["just-comes"] },
      },
    ],
  },
  {
    id: "E3",
    section: "engine",
    sessionKey: "phase1",
    question:
      "For RFPs and formal opportunities specifically: how do you get to know about them? Which portals, lists, contacts or clients tell you — and who watches those sources, how often?",
    why: "RFP discovery mechanics and their labour cost.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 7,
    options: [
      { id: "portals", label: "Named portals and tender lists someone watches on a routine" },
      { id: "aggregator", label: "A paid aggregator or subscription service feeds us" },
      { id: "clients", label: "Existing clients and contacts tell us" },
      { id: "ad-hoc", label: "Ad hoc — whoever happens to see something" },
      { id: "none", label: "We don't pursue formal RFPs" },
    ],
    followUps: [
      {
        id: "E3.f1",
        prompt: "Roughly how many hours a week does that watching take, across everyone?",
        when: { kind: "optionIds", ids: ["portals", "aggregator", "ad-hoc"] },
      },
      {
        id: "E3.f2",
        prompt: "How often do you learn about one too late to respond properly?",
        when: { kind: "optionIds", ids: ["clients"] },
      },
    ],
  },
  {
    id: "E4",
    section: "engine",
    sessionKey: "phase1",
    question:
      "Who personally originates most new business? Roles are enough. And is there anyone whose job is primarily selling — not delivery with some selling on the side?",
    why: "Founder-led-selling detection and whether a sales function exists.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 8,
    options: [
      { id: "founder", label: "The founder or CEO originates most of it" },
      { id: "one-senior", label: "One senior person who also delivers" },
      { id: "sales-team", label: "A dedicated salesperson or sales team" },
      { id: "delivery-leads", label: "Spread across several delivery leads" },
    ],
    followUps: [
      {
        id: "E4.f1",
        prompt: "Rough share of new business that starts with that one person?",
        when: { kind: "optionIds", ids: ["founder", "one-senior"] },
      },
    ],
  },
  {
    id: "E5",
    section: "engine",
    sessionKey: "phase1",
    question: "Is there a CRM anyone actually reads? Honest options: yes / it exists but no / no CRM.",
    why: "Ceiling on data quality for every number in this assessment.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 9,
    options: [
      { id: "yes", label: "Yes" },
      { id: "exists-but-no", label: "It exists but no" },
      { id: "no-crm", label: "No CRM" },
    ],
    followUps: [
      {
        id: "E5.f1",
        prompt: "What do people use instead — spreadsheets, inboxes, memory?",
        when: { kind: "optionIds", ids: ["exists-but-no", "no-crm"] },
        options: [
          { id: "spreadsheets", label: "Spreadsheets" },
          { id: "inboxes", label: "Individual inboxes" },
          { id: "memory", label: "Memory and conversation" },
          { id: "mix", label: "A mix of all three" },
        ],
      },
    ],
  },
  {
    id: "E6",
    section: "engine",
    sessionKey: "phase1",
    question:
      "Uncomfortable one: if your two strongest relationship people left tomorrow, roughly what share of next year's revenue walks with them?",
    why: "Key-person risk — the classification signal PE firms care most about.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 10,
    options: [
      { id: "under-10", label: "Under 10% — the business would barely notice" },
      { id: "10-25", label: "Around 10–25%" },
      { id: "25-50", label: "Around 25–50%" },
      { id: "over-50", label: "More than half" },
    ],
    followUps: [
      {
        id: "E6.f1",
        prompt: "As a thought experiment — what share sits on those two relationships?",
        when: {
          kind: "includes",
          tokens: ["never leave", "would never", "won't leave", "hypothetical", "not going to happen"],
        },
      },
    ],
  },

  // ── Part 3 — Channel map ──────────────────────────────────────────────
  {
    id: "CH1",
    section: "channels",
    sessionKey: "phase1",
    question:
      "Quick pass through a list — for each, tell me: using it, not using it, or want to use it. Field sales · inside sales / cold outreach · RFP portals and tenders · referrals and partnerships · events and conferences · LinkedIn · content and SEO · paid advertising · marketplaces or platforms · structured expansion of existing clients.",
    why: "The channel map — the single most load-bearing answer in Phase 1.",
    type: "channel-matrix",
    required: true,
    supportsText: false,
    supportsSpeech: false,
    asksConfidence: false,
    order: 11,
    followUps: [
      {
        id: "CH1.f1",
        prompt: "Earlier you mentioned {{channel}} — using or not?",
        when: { kind: "always" },
        options: [
          { id: "using", label: "Using it" },
          { id: "not-using", label: "Not using it" },
          { id: "want", label: "Want to use it" },
        ],
      },
    ],
  },
  {
    id: "CH1b",
    section: "channels",
    sessionKey: "phase1",
    question: "Which two of those bring in the most business today?",
    why: "Dominant channels get the full deep dive; other used channels get the short version.",
    type: "multiple-choice",
    required: true,
    supportsText: false,
    supportsSpeech: true,
    asksConfidence: false,
    order: 12,
    options: [],
  },
  {
    id: "CH2",
    section: "channels",
    sessionKey: "phase1",
    question:
      "{{Channel}} — what's stopped you so far? Time, skill, money, tried-and-failed, or you don't believe it works for a business like yours?",
    why: "The blocker type decides the fix.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 13,
    loop: "channel-want",
    options: BLOCKER_OPTIONS.map((blocker) => ({ id: blocker.id, label: blocker.label })),
    followUps: [
      {
        id: "CH2.f1",
        prompt: "What did the attempt look like, and how long did you give it?",
        when: { kind: "optionIds", ids: ["tried-failed"] },
      },
    ],
  },
  {
    id: "CH3",
    section: "channels",
    sessionKey: "phase1",
    question:
      "Beyond channels — are there customer types or markets you'd like to sell to but don't today? New industries, company sizes, geographies?",
    why: "ICP expansion candidates, read against the current mix from B1.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 14,
    options: [
      { id: "industries", label: "Yes — new industries or sectors" },
      { id: "sizes", label: "Yes — larger or smaller company sizes" },
      { id: "geographies", label: "Yes — new geographies" },
      { id: "several", label: "Yes — several of those" },
      { id: "none", label: "No — the current mix is the right one" },
    ],
    followUps: [
      {
        id: "CH3.f1",
        prompt: "{{segment}} — what's kept you out: fit, credibility, capacity, or nobody's tried?",
        when: { kind: "always" },
        options: [
          { id: "fit", label: "Fit — the offering isn't right yet" },
          { id: "credibility", label: "Credibility — no references there" },
          { id: "capacity", label: "Capacity — nobody has the time" },
          { id: "untried", label: "Nobody's tried" },
        ],
      },
    ],
  },
  {
    id: "CH4",
    section: "channels",
    sessionKey: "phase1",
    question:
      "If one of those untried channels or markets magically worked, which would change {{company}}'s growth the most?",
    why: "Their bet, quoted in the report next to the evidence.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 15,
    options: [
      { id: "channel", label: "One of the untried channels" },
      { id: "segment", label: "One of the untried customer types or geographies" },
      { id: "both", label: "Both together — a channel into a new market" },
      { id: "unsure", label: "Genuinely unsure which would matter most" },
    ],
  },

  // ── Part 4 — Team, tools & time ───────────────────────────────────────
  {
    id: "T1",
    section: "team",
    sessionKey: "phase1",
    question:
      "Who works on winning business? Rough headcount by role — and include leaders who sell part-time, like yourself.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: true,
    order: 16,
    options: [
      { id: "none", label: "Nobody full-time — selling is done alongside other jobs" },
      { id: "1-2", label: "One or two people on business development" },
      { id: "3-5", label: "Three to five across sales and bid work" },
      { id: "6-15", label: "Six to fifteen" },
      { id: "over-15", label: "More than fifteen" },
    ],
    followUps: [
      {
        id: "T1.f1",
        prompt: "And how much of your own week goes into selling?",
        when: { kind: "always" },
        options: [
          { id: "under-10", label: "Under 10% of the week" },
          { id: "10-25", label: "About a quarter" },
          { id: "25-50", label: "A quarter to a half" },
          { id: "over-50", label: "More than half" },
        ],
      },
    ],
  },
  {
    id: "T2",
    section: "team",
    sessionKey: "phase1",
    question:
      "Where does the sales team's time actually go? Rough split between real selling, writing proposals, admin and reporting, and supporting delivery.",
    why: "The time-allocation picture — usually the fastest route to found capacity.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: true,
    order: 17,
    options: [
      { id: "mostly-selling", label: "Mostly real selling — more than half the week" },
      { id: "even", label: "Roughly even across selling, proposals, admin and delivery support" },
      { id: "proposals", label: "Proposals and bid writing take the biggest share" },
      { id: "admin", label: "Admin and reporting take the biggest share" },
      { id: "delivery", label: "Delivery support crowds out most of the selling" },
    ],
    followUps: [
      {
        id: "T2.f1",
        prompt: "Including CRM updates, internal meetings, chasing information?",
        when: { kind: "optionIds", ids: ["mostly-selling"] },
      },
    ],
  },
  {
    id: "T3",
    section: "team",
    sessionKey: "phase1",
    question:
      "Which tools are in play — CRM, outreach, proposals, marketing? And is anyone on the team already using AI for any of this, even unofficially?",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 18,
    options: [
      { id: "full-stack", label: "A full stack — CRM plus outreach, proposal and marketing tools" },
      { id: "crm-only", label: "A CRM and little else" },
      { id: "office", label: "Mostly email, spreadsheets and shared drives" },
      { id: "ai-yes", label: "Tools plus AI assistants already in unofficial use" },
    ],
    followUps: [
      {
        id: "T3.f1",
        prompt: "What for, and does it actually help?",
        when: {
          kind: "includes",
          tokens: ["ai", "chatgpt", "copilot", "gemini", "claude", "llm"],
        },
      },
    ],
  },
  {
    id: "T4",
    section: "team",
    sessionKey: "phase1",
    question: "What gaps does the team itself feel right now — skills, capacity, know-how, coverage?",
    why: "Self-diagnosed limitations, cross-checked in Phase 2 against the numbers.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 19,
    options: [
      { id: "skills", label: "Skills — the selling craft itself" },
      { id: "capacity", label: "Capacity — not enough hours or heads" },
      { id: "know-how", label: "Know-how — nobody has done this motion before" },
      { id: "coverage", label: "Coverage — territories or accounts nobody owns" },
      { id: "several", label: "Several of those at once" },
    ],
  },

  // ── Part 5 — Limits & pain ────────────────────────────────────────────
  {
    id: "L1",
    section: "limits",
    sessionKey: "phase1",
    question:
      "Is there any limitation — team or geographic — that stops you from increasing the volume of RFPs, leads and prospects you see?",
    why: "Their stated volume ceiling, in one question.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 20,
    options: [
      { id: "team", label: "Team — we can't see or work more than we already do" },
      { id: "geographic", label: "Geographic — we only cover certain regions" },
      { id: "delivery", label: "Delivery — we couldn't service much more anyway" },
      { id: "both", label: "Both team and geographic" },
      { id: "none", label: "No real limit — we simply haven't pushed" },
    ],
    followUps: [
      {
        id: "L1.f1",
        prompt: "Which geographies would you cover if you could?",
        when: { kind: "optionIds", ids: ["geographic", "both"] },
      },
    ],
  },
  {
    id: "L2",
    section: "limits",
    sessionKey: "phase1",
    question: "What ideas for growing sales have you wanted to implement but never got to?",
    why: "Their parked backlog — the strongest adoption signal.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 21,
    options: [
      { id: "one", label: "One specific idea I keep coming back to" },
      { id: "several", label: "Several ideas parked — none started" },
      { id: "fizzled", label: "We started things but they fizzled out" },
      { id: "none", label: "Nothing parked — we do what we can" },
    ],
    followUps: [
      {
        id: "L2.f1",
        prompt: "If you could fund only one this quarter, which?",
        when: { kind: "optionIds", ids: ["several", "fizzled"] },
      },
    ],
  },
  {
    id: "L3",
    section: "limits",
    sessionKey: "phase1",
    question:
      "Two closing ones. If you could fix one thing about how {{company}} wins business, what would it be? And what made this the moment for an assessment — why now?",
    why: "Their theory of the problem and the trigger event, quoted verbatim in the snapshot.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 22,
    options: [
      { id: "volume", label: "See more opportunities in the first place" },
      { id: "conversion", label: "Convert more of what we already see" },
      { id: "speed", label: "Move faster from first contact to signature" },
      { id: "dependence", label: "Stop the whole thing depending on one or two people" },
      { id: "visibility", label: "Actually know what's happening — data we can trust" },
    ],
    followUps: [
      {
        id: "L3.f1",
        prompt: "If only one could be done by year end?",
        when: { kind: "always" },
      },
    ],
  },
];
