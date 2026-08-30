# Sales Assessment Agent — Question Bank v3
**Document 1 of 4** · Matches the approved Executive Summary structure: channel-first Phase 1, channel-module Phase 2.
Companions: `0` Executive Summary · `2` Agent Instructions · `3` Report Template.

**How to read each entry**
- **Shown as** — the literal chat message the respondent sees.
- **Why** — what the answer feeds in the report.
- **Follow-ups** — the only follow-ups permitted, with triggers. Max 2 used per question.
- **(A/E/G/N/X)** — answer gets a confidence tag: A Actual · E Estimate ±20% · G Guess · N Not recorded · X Exists, can't extract now. Every G/N/X gets the standard *"Who in the company would know that?"* — mandatory, once, then move on. Not repeated per entry below.

---

## PHASE 1 — CEO Baseline (~15 min)

**Opening message:**
> "Thanks for making time. This takes about 15 minutes and maps how {{company}} wins business today. Rough answers are genuinely fine — for numbers I'll ask how solid each one is, and an honest guess is more useful than a researched figure. Everything here goes into one report that you, {{pe_firm}} and Tkxel all see — nothing separate. Ready?"

### Part 1 — The business (B1–B4, ~3 min)
*Why:* what they sell, to whom, at what deal economics. Every later finding hangs off these. Knowledge-base pre-fill rule applies: if uploaded documents answer one, confirm instead of asking.

**B1**
- **Shown as:** "In a couple of lines: what does {{company}} sell, and who buys it? And who are your typical customers versus your top ones — government, large enterprise, mid-market, something else?"
- **Why:** offering + customer mix. Government-heavy means RFP-driven buying cycles; commercial means relationship cycles. Sets how everything after is read.
- **Follow-ups:**
  1. *If one segment dominates:* "Is that concentration by design, or just where the network reached?"
  2. *If top customers ≠ typical customers:* "What makes the top ones different — size, sector, how you won them?"

**B2** (A/E/G/N/X)
- **Shown as:** "Average deal size — and the smallest and largest you closed last year?"
- **Why:** deal economics decide which fixes are worth the effort.
- **Follow-ups:**
  1. *If "it varies":* "The range is exactly what I want — roughly smallest and largest?"

**B3** (A/E/G/N/X)
- **Shown as:** "And average closing time — first contact to signed contract, typical not best?"
- **Why:** cycle-length baseline, later compared to where they say time is lost. Read per customer type from B1 if the mix is split.
- **Follow-ups:**
  1. *If mix is split:* "Different for government versus commercial?"

**B4** (A/E/G/N/X)
- **Shown as:** "Revenue over the last 12 months and roughly the year before? And the target for the next 12 — does it feel realistic from where you sit?"
- **Why:** size, trajectory, and the gap this assessment exists to close. The "realistic?" half reveals conviction.
- **Follow-ups:**
  1. *If target given flat:* "Gut feel — comfortable, stretch, or hope?"

### Part 2 — The sales engine (E1–E6, ~4 min)
*Why:* how clients are actually found, lead by lead and RFP by RFP. E1–E3 are the engine mechanics; E4–E6 are the classification signals (pipeline-driven vs relationship-driven vs mixed).

**E1**
- **Shown as:** "How do you find clients today? Field sales, inside sales or outbound, RFPs, referrals, inbound enquiries, partners — walk me through which of these actually bring you business, and anything I've missed."
- **Why:** the engine's source list, in their words. Seeds the CH1 checklist and decides which Phase 2 modules run.
- **Follow-ups:**
  1. *If generic ("mostly referrals"):* "The last three new clients — where did each actually come from?"

**E2**
- **Shown as:** "And how are leads actually generated — who does the generating, and what does a week of it look like?"
- **Why:** separates a lead-generation function from leads-that-happen. Names go to the people map.
- **Follow-ups:**
  1. *If "it just comes in":* "So if enquiries stopped tomorrow, is there a muscle that could go get leads?"

**E3**
- **Shown as:** "For RFPs and formal opportunities specifically: how do you get to know about them? Which portals, lists, contacts or clients tell you — and who watches those sources, how often?"
- **Why:** RFP discovery mechanics and their labour cost. Weak coverage here is the trigger for the RFP-discovery AI candidate.
- **Follow-ups:**
  1. *If sources named:* "Roughly how many hours a week does that watching take, across everyone?"
  2. *If "clients tell us":* "How often do you learn about one too late to respond properly?"

**E4**
- **Shown as:** "Who personally originates most new business? Roles are enough. And is there anyone whose job is primarily selling — not delivery with some selling on the side?"
- **Why:** founder-led-selling detection and whether a sales function exists. Classification signal; decides which Phase 2 sessions exist.
- **Follow-ups:**
  1. *If one person named:* "Rough share of new business that starts with that one person?"

**E5**
- **Shown as:** "Is there a CRM anyone actually reads? Honest options: yes / it exists but no / no CRM."
- **Why:** ceiling on data quality for every number in this assessment; predicts whether an instrumentation fix tops the list.
- **Follow-ups:**
  1. *If "it exists but no":* "What do people use instead — spreadsheets, inboxes, memory?"

**E6**
- **Shown as:** "Uncomfortable one: if your two strongest relationship people left tomorrow, roughly what share of next year's revenue walks with them?"
- **Why:** key-person risk — the classification signal PE firms care most about.
- **Follow-ups:**
  1. *If deflected ("they'd never leave"):* "As a thought experiment — what share sits on those two relationships?"

### Part 3 — Channel map: used, unused, wanted (CH1–CH4, ~4 min)
*Why:* the full inventory BEFORE any deep dive, so Phase 2 targets only what they use, and everything unused-but-wanted is logged as an opportunity with its blocker. This ordering is deliberate and fixed.

**CH1**
- **Shown as:** "Quick pass through a list — for each, tell me: using it, not using it, or want to use it. Field sales · inside sales / cold outreach · RFP portals and tenders · referrals and partnerships · events and conferences · LinkedIn · content and SEO · paid advertising · marketplaces or platforms · structured expansion of existing clients."
- **Why:** the channel map — the single most load-bearing answer in Phase 1. "Using" entries define the Phase 2 modules; "want" entries go to CH2.
- **Follow-ups:**
  1. *If E1 mentioned a channel they now skip:* "Earlier you mentioned {{channel}} — using or not?"

**CH2** *(asked once per "want to use" channel — mandatory probe)*
- **Shown as:** "{{Channel}} — what's stopped you so far? Time, skill, money, tried-and-failed, or you don't believe it works for a business like yours?"
- **Why:** the blocker type decides the fix: no-time → automation candidate; tried-and-failed → find out what was tried; don't-believe → a discovery-meeting conversation, not a recommendation.
- **Follow-ups:**
  1. *If "tried and failed":* "What did the attempt look like, and how long did you give it?"

**CH3**
- **Shown as:** "Beyond channels — are there customer types or markets you'd like to sell to but don't today? New industries, company sizes, geographies?"
- **Why:** ICP expansion candidates, read against the current mix from B1.
- **Follow-ups:**
  1. *Per named segment:* "What's kept you out — fit, credibility, capacity, or nobody's tried?"

**CH4**
- **Shown as:** "If one of those untried channels or markets magically worked, which would change {{company}}'s growth the most?"
- **Why:** their bet, quoted in the report next to the evidence. Match or mismatch with the data is the discovery meeting's best conversation.
- **Follow-ups:** none. **After CH4 no new channel or market discussions open; depth goes only to used channels.**

### Part 4 — Team, tools & time (T1–T4, ~2 min)
**T1** (A/E/G/N/X)
- **Shown as:** "Who works on winning business? Rough headcount by role — and include leaders who sell part-time, like yourself."
- **Follow-ups:**
  1. *If leaders omitted:* "And how much of your own week goes into selling?"

**T2** (A/E/G/N/X)
- **Shown as:** "Where does the sales team's time actually go? Rough split between real selling, writing proposals, admin and reporting, and supporting delivery."
- **Why:** the time-allocation picture — usually the fastest route to found capacity, and the direct sizing input for automation candidates.
- **Follow-ups:**
  1. *If "mostly selling":* "Including CRM updates, internal meetings, chasing information?"

**T3**
- **Shown as:** "Which tools are in play — CRM, outreach, proposals, marketing? And is anyone on the team already using AI for any of this, even unofficially?"
- **Follow-ups:**
  1. *If AI usage mentioned:* "What for, and does it actually help?"

**T4**
- **Shown as:** "What gaps does the team itself feel right now — skills, capacity, know-how, coverage?"
- **Why:** self-diagnosed limitations, cross-checked in Phase 2 against the numbers.
- **Follow-ups:** none.

### Part 5 — Limits & pain (L1–L3, ~2 min)
**L1**
- **Shown as:** "Is there any limitation — team or geographic — that stops you from increasing the volume of RFPs, leads and prospects you see?"
- **Why:** their stated volume ceiling, in one question. Distinguishes "can't see more" from "can't handle more" — different fixes entirely.
- **Follow-ups:**
  1. *If geographic:* "Which geographies would you cover if you could?"

**L2**
- **Shown as:** "What ideas for growing sales have you wanted to implement but never got to?"
- **Why:** their parked backlog — the strongest adoption signal; people commit to their own ideas.
- **Follow-ups:**
  1. *If several:* "If you could fund only one this quarter, which?"

**L3**
- **Shown as:** "Two closing ones. If you could fix one thing about how {{company}} wins business, what would it be? And what made this the moment for an assessment — why now?"
- **Why:** their theory of the problem and the trigger event, quoted verbatim in the snapshot.
- **Follow-ups:**
  1. *If they list three fixes:* "If only one could be done by year end?"

**Phase 1 gate — the CEO sees:**
> "Here's the snapshot: {{business profile, engine type, channel map, team & time picture}}. Anything wrong in it? ... From your answers, {{company}} reads as mainly {{pipeline-driven / relationship-driven / mixed}}, with {{used channels}} carrying the weight. The deep dive will focus there — about 20 minutes, with {{you / your sales head}}. Continue now, or save and resume later?"

---

## PHASE 2 — Channel Deep Dives (~20–25 min per role)

**Rules:** only modules for channels marked "using" in CH1 run. The two dominant channels get full modules; minor used channels get the three ★ questions of their module only. The capacity check always runs. Respondent: sales head where one exists, else CEO.

**Opening:**
> "This is the deep dive — about 20 minutes on the channels that actually bring {{company}} business: {{list}}. Same rules: rough is fine, 'nobody tracks that' is a useful answer."

### Module M-RFP — RFPs & proposals *(runs if RFP/tender channel is used)*

**M-RFP.1 ★** (A/E/G/N/X)
- **Shown as:** "How many RFPs or formal opportunities did you actually see last year — and your own estimate of how many existed in your market that you never saw?"
- **Why:** coverage ratio; a large gap is the strongest trigger for the opportunity-discovery AI candidate.
- **Follow-ups:**
  1. *If "no idea" on the universe:* "If a competitor your size sees 200 a year — high, low, about right?" *(tag G)*

**M-RFP.2** (A/E/G/N/X)
- **Shown as:** "Of the ones you saw: how many did you decline, how many did you start and abandon partway, and roughly how many hours died with the abandoned ones?"
- **Follow-ups:**
  1. *If "we rarely decline":* "Because everything fits, or because saying no is hard here?"

**M-RFP.3**
- **Shown as:** "Who makes the go / no-go call, and when — before work starts, or once someone's already invested?"
- **Follow-ups:**
  1. *If "gut call":* "Whose gut, and has it ever been overruled?"

**M-RFP.4 ★** (A/E/G/N/X)
- **Shown as:** "A typical response: how many working hours across everyone who touches it, and how many elapsed days start to submission? And the worst case you remember?"
- **Why:** hours × count = annual proposal cost, the number Tkxel puts on the discovery table.
- **Follow-ups:**
  1. *If one number:* "Whose hours mostly — a proposal writer, or your most senior people?"
  2. *If days ≫ hours:* "So a 40-hour job takes 20 days — where does it sit waiting?"

**M-RFP.5**
- **Shown as:** "What share of a response is written fresh versus reused from past work — and where does past work and pricing history live? Can anyone search it, or is it 'ask {{name}}'?"
- **Why:** high reuse + unsearchable library is the textbook setup for AI-assisted drafting.
- **Follow-ups:**
  1. *If "ask [person]":* *(record for people map)* "And when they're on leave?"

**M-RFP.6 ★** (A/E/G/N/X)
- **Shown as:** "Wins last year, and your win rate — telling me what you divide by: everything submitted, or only decided deals? Are loss reasons recorded anywhere?"
- **Follow-ups:**
  1. *If they start computing:* "Don't compute — the number people quote internally, and I'll mark how solid it is."
  2. *If "we usually know why we lose":* "The last three losses — could someone look up why?"

**M-RFP.7** (A/E/G/N/X)
- **Shown as:** "Two close-mechanics ones: how much discounting does it take to sign — rough average off first price, including free scope? And from verbal yes to signed contract — how long, and what slows it?"
- **Follow-ups:** none.

### Module M-OUT — Outbound / inside sales *(runs if outbound, inside sales or LinkedIn is used)*

**M-OUT.1 ★**
- **Shown as:** "Describe the outbound motion in three lines: who reaches out, on which channels, how many attempts in a typical week?"
- **Follow-ups:**
  1. *If "we tried it once":* "What was tried, for how long, and why did it stop?"

**M-OUT.2 ★** (A/E/G/N/X)
- **Shown as:** "Of every 100 attempts, roughly how many become a real conversation?"
- **Why:** decides whether outbound has a volume problem or a message problem.
- **Follow-ups:**
  1. *If unknown:* "Last month — how many first conversations came from outbound versus everything else?"

**M-OUT.3**
- **Shown as:** "A prospect says 'good timing next year, not now.' What happens to them?"
- **Why:** "nothing" is the most common, most fixable leak; trigger for re-engagement automation.
- **Follow-ups:**
  1. *If "the rep keeps a note":* "Did anyone actually go back to a 'not now' from last year? One example?"

**M-OUT.4 ★** (A/E/G/N/X)
- **Shown as:** "A new enquiry lands through the website or a referral email. Honestly — how long before a human responds?"
- **Follow-ups:**
  1. *If "same day":* "Including ones landing Friday afternoon?"

**M-OUT.5**
- **Shown as:** "Between first meeting and proposal, what does a prospect receive from you — case studies, references, a pilot, or mostly silence until the proposal?"
- **Follow-ups:**
  1. *If materials named:* "Easy for the team to find, or rebuilt each time?"

### Module M-REL — Relationships & referrals *(runs if referrals/partnerships or client expansion is used, or engine is relationship-driven)*

**M-REL.1 ★**
- **Shown as:** "The new clients of the last three years — deal by deal if you can: how did each actually arrive, and which individuals originated them? Roles or names; I'm looking for concentration, not credit."
- **Follow-ups:**
  1. *If generalised:* "Just the last three new clients — the specific story of each?"

**M-REL.2 ★**
- **Shown as:** "Where does relationship history live — CRM, individual inboxes, people's heads, a mix? Be blunt."
- **Why:** "inboxes and heads" triggers the relationship-capture candidate and defines the continuity risk.
- **Follow-ups:**
  1. *If "CRM":* "If I opened it, would your top ten relationships have a note from the last quarter?"

**M-REL.3**
- **Shown as:** "Do accounts get reviewed on any cadence — who, how often, anything written down? And how does expansion work usually surface: the client asks, a partner spots it, a scheduled review finds it?"
- **Follow-ups:**
  1. *If "informally, constantly":* "The last sit-down about an account with no problem — just growth — when was it?"

**M-REL.4 ★**
- **Shown as:** "An account's relationship owner is suddenly unavailable — leave, illness, departure. What actually happens to that account? And when a relationship goes quiet for months, does anyone notice?"
- **Follow-ups:**
  1. *If "the team steps in":* "Has that actually happened? How did it go?"

**M-REL.5**
- **Shown as:** "Do you ask happy clients for introductions — with any structure, or when it happens it happens?"
- **Follow-ups:**
  1. *If unstructured:* "Which three clients would say yes tomorrow if someone simply asked?"

### Module M-FLD — Field sales & events *(runs if field sales or events is used)*

**M-FLD.1 ★** (A/E/G/N/X)
- **Shown as:** "What does the field/event motion look like over a year — how many events or visit cycles, covering which territories, at what rough cost each?"
- **Follow-ups:** none.

**M-FLD.2 ★** (A/E/G/N/X)
- **Shown as:** "What does a season actually produce — contacts, real conversations, deals you can trace back to it?"
- **Follow-ups:**
  1. *If untracked:* "The best client you got this way — which event or visit, and how long ago?"

**M-FLD.3 ★**
- **Shown as:** "After an event or visit — what happens to the contacts collected, in the first week?"
- **Why:** follow-up discipline is where field spend usually evaporates.
- **Follow-ups:** none.

### CAP — Capacity check *(always, end of the sales deep dive)*

**CAP.1**
- **Shown as:** "Outside the sales team, who spends real time on pursuits — delivery leads writing sections, executives in pitches — and roughly how much of their week?"
- **Follow-ups:**
  1. *If executives named:* "Best use of their hours, or just how it's always been?"

**CAP.2** (A/E/G/N/X)
- **Shown as:** "If sales suddenly worked: how much more delivery could you absorb without hiring? And who's the right person to verify that with?"
- **Why:** the ceiling that caps every opportunity; the named verifier goes to the people map.
- **Follow-ups:** none — the verification handoff is the follow-up.

---

## COMMON SESSIONS & CLOSERS

### Marketing session (MK1–MK6, ~15 min — only if Phase 1 found a marketing owner)
**Opening:** > "Short session — about 15 minutes on what marketing runs and how it connects, or doesn't, to closed business. 'It doesn't connect directly' is a common and useful answer."

**MK1** — "What actually runs every month — content, SEO, paid, events, email, PR? A list with rough effort against each." *(Follow-up if aspirational: "Which shipped last month, versus planned?")*
**MK2** — "Which of those can you trace to a closed deal in the last year, even loosely?" *(Follow-up if one traced: "Walk me through that one.")*
**MK3** (A/E/G/N/X) — "Inbound leads per month, roughly — and what happens to one in its first 24 hours?" *(Follow-up: "Who exactly gets the notification, and what's their day job?")*
**MK4** — "What is marketing measured on here — formally or informally?"
**MK5** — "Does sales actually use what marketing produces? What do they keep asking for that doesn't exist?" *(Cross-checked against M-OUT.5 — disagreement is a finding.)*
**MK6** (A/E/G/N/X) — "Rough monthly marketing spend, and the biggest single line in it?"

### Systems & AI (S1–S4, last ~3 min of every Phase 2 session)
**S1** — "Of the tools we listed — which do people open every day, and which are paid for and ignored?" *(Follow-up: "What killed it — setup, habit, or it doesn't help?")*
**S2** — "Where does sales information live that is NOT in any system — spreadsheets, inboxes, WhatsApp, heads?"
**S3** — "Is anyone here already using AI for sales or marketing tasks, officially or quietly? What for, and does it help?" *(Follow-up: "Would leadership be comfortable knowing exactly how it's used today?")*
**S4** — "If a machine could take one repetitive task off your team's plate tomorrow, which task?"

### CEO strategic close (X1–X4, last 5 min of the CEO's involvement)
**X1** — "Suppose sales doubled next year. What breaks first — delivery, cash, hiring, quality?" *(Cross-checked with CAP.2.)*
**X2** — "What would need to be true for you to be comfortable with AI drafting messages that go to your customers — with a human approving them?" *(Follow-up if flat no: "And for internal work — research, first drafts, summaries no customer sees?")*
**X3** — "When how-you-sell changes, who champions it — and who resists? Roles are fine."
**X4** — "Last question. If we came back in 90 days with exactly one thing fixed — what should it be?" *(Placed against L3; if the answer moved during the interview, that movement is a finding.)*

**Session close, every respondent:**
> "That's everything. Your report is being prepared — you'll see the same document {{pe_firm}} and Tkxel see, nothing separate. Thanks for being straight with the guesses; that's what makes this useful."

---

## Standing rules
- Max 2 follow-ups used per question; listed ones only.
- Every G/N/X: "Who would know that?" — once, then move on.
- Never let a respondent compute or research an answer.
- A name recorded as →WHO for two different questions becomes an interview request via the admin.
- Out-of-scope topics (finance, delivery, HR detail) → one-line acknowledgement, handoff note, back on track.
- After CH4, no new channel/market discussions; depth only on used channels.
