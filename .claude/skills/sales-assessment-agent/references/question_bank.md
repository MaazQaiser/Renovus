# Sales Assessment Agent — Question Bank v4
**Document 1 of 4** · Change from v3: every question asks exactly ONE thing. Compound questions are split into lettered sub-questions (asked in quick succession). Rule for all future edits: **one question = one answer the respondent can give immediately.**

**How to read each entry**
- **Shown as** — the literal chat message. One ask per message.
- **Why** — what the answer feeds. Shared "why" lines cover a lettered group.
- **Follow-ups** — the only ones permitted, with triggers. Max 2 used per question group.
- **(A/E/G/N/X)** — confidence tag: A Actual · E Estimate ±20% · G Guess · N Not recorded · X Exists, can't extract. Every G/N/X gets *"Who in the company would know that?"* — once, then move on. Standard; not repeated below.

---

## PHASE 1 — CEO Baseline (~15 min)

**Opening:**
> "Thanks for making time. This takes about 15 minutes and maps how {{company}} wins business today. Rough answers are genuinely fine — for numbers I'll ask how solid each one is, and an honest guess is more useful than a researched figure. Everything here goes into one report that you, {{pe_firm}} and Tkxel all see — nothing separate. Ready?"

### Part 1 — The business (~3 min)
*Why:* what they sell, to whom, at what economics. Knowledge-base pre-fill rule applies: confirm, don't ask, where documents already answer.

**B1a** — "In one line: what does {{company}} sell?"
**B1b** — "Who mainly buys it — government, large enterprise, mid-market, or a mix?"
**B1c** — "Your top customers — same type as the typical ones, or different?"
- *Why (group):* offering + customer mix; government-heavy means RFP buying cycles, commercial means relationship cycles.
- Follow-ups: 1. *If B1c "different":* "What makes the top ones different — size, sector, or how you won them?" 2. *If one segment dominates B1b:* "By design, or just where the network reached?"

**B2a** (A/E/G/N/X) — "Average deal size?"
**B2b** (A/E/G/N/X) — "And the smallest and largest you closed last year?"
- Follow-ups: 1. *If "it varies" on B2a:* "The middle of the range, then?"

**B3** (A/E/G/N/X) — "Average closing time — first contact to signed contract, typical not best?"
- Follow-ups: 1. *If mix is split (B1b):* "Different for government versus commercial?"

**B4a** (A/E/G/N/X) — "Revenue over the last 12 months?"
**B4b** (A/E/G/N/X) — "And roughly the year before?"
**B4c** — "Target for the next 12 months?"
- *Why (group):* size, trajectory, and the gap this assessment exists to close.
- Follow-ups: 1. *Always after B4c:* "Gut feel — comfortable, stretch, or hope?" *(the realism quote for the snapshot)*

### Part 2 — The sales engine (~4 min)
*Why:* how clients are actually found. E1–E3 are mechanics; E4–E6 are classification signals.

**E1** — "How do you find clients today? Field sales, inside sales or outbound, RFPs, referrals, inbound, partners — which of these actually bring business?"
- Follow-ups: 1. *If generic:* "The last three new clients — where did each actually come from?"

**E2** — "Who generates leads here — is it someone's job, or do they just arrive?"
- Follow-ups: 1. *If "they arrive":* "If enquiries stopped tomorrow, is there a muscle that could go get leads?"

**E3a** — "For RFPs and formal opportunities: how do you get to know about them — which portals, lists or contacts?"
**E3b** — "Who watches those sources, and how often?"
- *Why (group):* RFP discovery mechanics + labour cost; weak coverage triggers the RFP-discovery AI candidate.
- Follow-ups: 1. *After E3b:* "Roughly how many hours a week, across everyone?" 2. *If "clients tell us":* "How often do you learn about one too late to respond properly?"

**E4a** — "Who personally originates most new business? Roles are enough."
**E4b** — "Is anyone's job primarily selling — not delivery with selling on the side?"
- Follow-ups: 1. *If one person named in E4a:* "Rough share of new business that starts with that one person?"

**E5** — "Is there a CRM anyone actually reads? Honest options: yes / it exists but no / no CRM."
- Follow-ups: 1. *If "exists but no":* "What do people use instead — spreadsheets, inboxes, memory?"

**E6** (A/E/G/N/X) — "Uncomfortable one: if your two strongest relationship people left tomorrow, roughly what share of next year's revenue walks with them?"
- Follow-ups: 1. *If deflected:* "As a thought experiment — what share sits on those two relationships?"

### Part 3 — Channel map (~4 min)
*Why:* the full inventory BEFORE any deep dive. Fixed ordering.

**CH1** — "Quick pass through a list — for each, just say: using, not using, or want to use. Field sales?" *(then one at a time, fast:)* "Inside sales or cold outreach?" · "RFP portals and tenders?" · "Referrals and partnerships?" · "Events and conferences?" · "LinkedIn?" · "Content and SEO?" · "Paid advertising?" · "Marketplaces?" · "Structured expansion of existing clients?"
- *Why:* the channel map — the most load-bearing answer in Phase 1. Asked as ten rapid one-word answers, not one long list to hold in mind.
- Follow-ups: 1. *If E1 mentioned a channel they now skip:* "Earlier you mentioned {{channel}} — using or not?"

**CH2** *(once per "want to use" channel)* — "{{Channel}} — in one line, what's stopped you? Time, skill, money, tried-and-failed, or don't believe it works for you?"
- Follow-ups: 1. *If "tried and failed":* "What did the attempt look like, and how long did you give it?"

**CH3** — "Any customer types or markets you'd like to sell to but don't today — new industries, sizes, geographies?"
- Follow-ups: 1. *Per named segment:* "What's kept you out — fit, credibility, capacity, or nobody's tried?"

**CH4** — "If one of those untried channels or markets magically worked, which would change growth the most?"
- Follow-ups: none. **After CH4, no new channel/market threads; depth only on used channels.**

### Part 4 — Team, tools & time (~2 min)
**T1** (A/E/G/N/X) — "Who works on winning business? Rough headcount by role — including leaders who sell part-time, like yourself."
- Follow-ups: 1. *If leaders omitted:* "How much of your own week goes into selling?"

**T2** (A/E/G/N/X) — "Where does the sales team's time actually go? Rough split: real selling, proposals, admin, supporting delivery."
- Follow-ups: 1. *If "mostly selling":* "Including CRM updates, internal meetings, chasing information?"

**T3a** — "Which tools are in play — CRM, outreach, proposals, marketing?"
**T3b** — "Is anyone already using AI for any of this — even unofficially?"
- Follow-ups: 1. *If yes on T3b:* "What for, and does it actually help?"

**T4** — "What gaps does the team itself feel right now — skills, capacity, know-how, coverage?"

### Part 5 — Limits & pain (~2 min)
**L1** — "Is there any limitation — team or geographic — that stops you from seeing more RFPs, leads and prospects?"
- Follow-ups: 1. *If geographic:* "Which geographies would you cover if you could?"

**L2** — "What ideas for growing sales have you wanted to implement but never got to?"
- Follow-ups: 1. *If several:* "If you could fund only one this quarter, which?"

**L3a** — "If you could fix one thing about how {{company}} wins business, what would it be?"
**L3b** — "And what made this the moment for an assessment — why now?"

**Phase 1 gate — the CEO sees:**
> "Here's the snapshot: {{business, engine type, channel map, team & time}}. Anything wrong in it? ... From your answers, {{company}} reads as mainly {{pipeline-driven / relationship-driven / mixed}}, with {{used channels}} carrying the weight. The deep dive focuses there — about 20 minutes, with {{you / your sales head}}. Continue now, or save and resume later?"

---

## PHASE 2 — Channel Deep Dives (~20–25 min per role)

**Rules:** only modules for CH1 "using" channels run. Two dominant channels (per E1) get full modules; minor used channels get ★ questions only. CAP always runs. Respondent: sales head where one exists, else CEO.

**Opening:**
> "This is the deep dive — about 20 minutes on the channels that actually bring {{company}} business: {{list}}. Same rules: rough is fine, 'nobody tracks that' is a useful answer."

### Module M-RFP — RFPs & proposals *(if RFP/tender channel used)*

**M-RFP.1a ★** (A/E/G/N/X) — "How many RFPs or formal opportunities did you actually see last year?"
**M-RFP.1b ★** (A/E/G/N/X) — "And your own estimate: how many existed in your market that you never saw?"
- *Why (group):* coverage ratio — strongest trigger for the opportunity-discovery candidate.
- Follow-ups: 1. *If "no idea" on 1b:* "If a competitor your size sees 200 a year — high, low, about right?" *(tag G)*

**M-RFP.2a** (A/E/G/N/X) — "Of the ones you saw — how many did you decline?"
**M-RFP.2b** (A/E/G/N/X) — "How many did you start and then abandon partway?"
- Follow-ups: 1. *If abandons > 0:* "The last abandoned one — roughly how many hours had gone in?" 2. *If "we rarely decline":* "Because everything fits, or because saying no is hard here?"

**M-RFP.3** — "Who makes the go / no-go call — and before work starts, or once someone's already invested?"
- Follow-ups: 1. *If "gut call":* "Whose gut, and has it ever been overruled?"

**M-RFP.4a ★** (A/E/G/N/X) — "A typical response: how many working hours, across everyone who touches it?"
**M-RFP.4b** (A/E/G/N/X) — "And how many elapsed days, start to submission?"
- *Why (group):* hours × count = annual proposal cost — the number Tkxel puts on the discovery table.
- Follow-ups: 1. *After 4a:* "Whose hours mostly — a proposal writer, or your most senior people?" 2. *If days ≫ hours:* "So a 40-hour job takes 20 days — where does it sit waiting?"

**M-RFP.5a** (A/E/G/N/X) — "What share of a response is written fresh, versus reused from past work?"
**M-RFP.5b** — "Where does past work and pricing history live — and can anyone search it, or is it 'ask {{name}}'?"
- Follow-ups: 1. *If "ask [person]":* *(record for people map)* "And when they're on leave?"

**M-RFP.6a ★** (A/E/G/N/X) — "Wins last year — how many?"
**M-RFP.6b** (A/E/G/N/X) — "So what's your win rate — and what are you dividing by: everything submitted, or only decided deals?"
**M-RFP.6c** — "Are loss reasons recorded anywhere — a structured field, free-text, or nowhere?"
- Follow-ups: 1. *If computing starts on 6b:* "Don't compute — the number people quote internally; I'll mark how solid it is." 2. *If "we usually know why" on 6c:* "The last three losses — could someone look up why?"

**M-RFP.7a** (A/E/G/N/X) — "How much discounting does it take to sign — rough average off first price, including free scope?"
**M-RFP.7b** (A/E/G/N/X) — "And from verbal yes to signed contract — how long, and what slows it?"

### Module M-OUT — Outbound / inside sales *(if outbound, inside sales or LinkedIn used)*

**M-OUT.1 ★** — "Describe the outbound motion in three lines: who reaches out, on which channels, how many attempts a week?"
- Follow-ups: 1. *If "we tried once":* "What was tried, for how long, and why did it stop?"

**M-OUT.2 ★** (A/E/G/N/X) — "Of every 100 attempts, roughly how many become a real conversation?"
- Follow-ups: 1. *If unknown:* "Last month — how many first conversations came from outbound, versus everything else?"

**M-OUT.3** — "A prospect says 'good timing next year, not now.' What happens to them?"
- Follow-ups: 1. *If "the rep keeps a note":* "Did anyone go back to a 'not now' from last year? One example?"

**M-OUT.4 ★** (A/E/G/N/X) — "A new enquiry lands through the website or a referral email. Honestly — how long before a human responds?"
- Follow-ups: 1. *If "same day":* "Including ones landing Friday afternoon?"

**M-OUT.5** — "Between first meeting and proposal, what does a prospect receive from you — case studies, a pilot, or mostly silence until the proposal?"
- Follow-ups: 1. *If materials named:* "Easy for the team to find, or rebuilt each time?"

### Module M-REL — Relationships & referrals *(if referrals/partnerships/expansion used, or relationship-driven)*

**M-REL.1 ★** — "The new clients of the last three years — deal by deal if you can: how did each actually arrive, and who originated it? Roles or names; I'm looking for concentration, not credit."
- Follow-ups: 1. *If generalised:* "Just the last three new clients — the specific story of each?"
- *(Kept as one question deliberately: it's one story told once, not two asks.)*

**M-REL.2 ★** — "Where does relationship history live — CRM, individual inboxes, people's heads, a mix? Be blunt."
- Follow-ups: 1. *If "CRM":* "If I opened it, would your top ten relationships have a note from the last quarter?"

**M-REL.3a** — "Do accounts get reviewed on any cadence — who, how often?"
**M-REL.3b** — "How does expansion work usually surface — the client asks, a partner spots it, a scheduled review finds it?"
- Follow-ups: 1. *If "informally, constantly" on 3a:* "The last sit-down about an account with no problem — just growth — when was it?"

**M-REL.4a ★** — "An account's relationship owner is suddenly unavailable — leave, illness, departure. What actually happens to that account?"
**M-REL.4b** — "And when a relationship goes quiet for months — does anyone notice? How?"
- Follow-ups: 1. *If "the team steps in":* "Has that actually happened? How did it go?"

**M-REL.5** — "Do you ask happy clients for introductions — with any structure, or when it happens it happens?"
- Follow-ups: 1. *If unstructured:* "Which three clients would say yes tomorrow if someone simply asked?"

### Module M-FLD — Field sales & events *(if field sales or events used)*

**M-FLD.1 ★** (A/E/G/N/X) — "Over a year — how many events or visit cycles, covering which territories, at what rough cost each?"
**M-FLD.2 ★** (A/E/G/N/X) — "What does a season actually produce — contacts, real conversations, traceable deals?"
- Follow-ups: 1. *If untracked:* "The best client you got this way — which event, how long ago?"

**M-FLD.3 ★** — "After an event or visit — what happens to the contacts collected, in the first week?"

### CAP — Capacity check *(always, end of sales deep dive)*

**CAP.1** — "Outside the sales team, who spends real time on pursuits — delivery leads writing sections, executives in pitches — and how much of their week?"
- Follow-ups: 1. *If executives named:* "Best use of their hours, or just how it's always been?"

**CAP.2** (A/E/G/N/X) — "If sales suddenly worked: how much more delivery could you absorb without hiring? And who should verify that?"
- Follow-ups: none — the verification handoff is the follow-up.

---

## COMMON SESSIONS & CLOSERS

### Marketing session (~15 min — only if Phase 1 found a marketing owner)
**Opening:** > "Short session — about 15 minutes on what marketing runs and how it connects, or doesn't, to closed business. 'It doesn't connect directly' is a common and useful answer."

**MK1** — "What actually runs every month — content, SEO, paid, events, email, PR?" *(FU if aspirational: "Which shipped last month, versus planned?")*
**MK2** — "Which of those can you trace to a closed deal in the last year, even loosely?" *(FU if one traced: "Walk me through that one.")*
**MK3a** (A/E/G/N/X) — "Inbound leads per month, roughly?"
**MK3b** — "What happens to one in its first 24 hours?" *(FU: "Who exactly gets the notification, and what's their day job?")*
**MK4** — "What is marketing measured on here — formally or informally?"
**MK5a** — "Does sales actually use what marketing produces?" *(Cross-checked against M-OUT.5 — disagreement is a finding.)*
**MK5b** — "What do they keep asking for that doesn't exist?"
**MK6** (A/E/G/N/X) — "Rough monthly marketing spend, and the biggest single line?"

### Systems & AI (last ~3 min of every Phase 2 session)
**S1** — "Of the tools we listed — which do people open every day, and which are paid for and ignored?" *(FU: "What killed it — setup, habit, or it doesn't help?")*
**S2** — "Where does sales information live that is NOT in any system — spreadsheets, inboxes, WhatsApp, heads?"
**S3** — "Is anyone already using AI for sales or marketing tasks — officially or quietly?" *(FU if yes: "Would leadership be comfortable knowing exactly how it's used today?")*
**S4** — "If a machine could take one repetitive task off your team's plate tomorrow, which task?"

### CEO strategic close (last 5 min of the CEO's involvement)
**X1** — "Suppose sales doubled next year. What breaks first — delivery, cash, hiring, quality?" *(Cross-checked with CAP.2.)*
**X2** — "What would need to be true for you to be comfortable with AI drafting messages to your customers — with a human approving them?" *(FU if flat no: "And for internal work — research, drafts, summaries no customer sees?")*
**X3** — "When how-you-sell changes, who champions it — and who resists? Roles are fine."
**X4** — "Last question. If we came back in 90 days with exactly one thing fixed — what should it be?" *(Placed against L3a; movement between the two is a finding.)*

**Session close:**
> "That's everything. Your report is being prepared — you'll see the same document {{pe_firm}} and Tkxel see, nothing separate. Thanks for being straight with the guesses; that's what makes this useful."

---

## Standing rules
- **One question = one answer.** Never stack two asks in one message; lettered sub-questions go out as separate rapid messages.
- Max 2 follow-ups used per question group; listed ones only.
- Every G/N/X: "Who would know that?" — once, then move on.
- Never let a respondent compute or research an answer.
- A name recorded as →WHO for two different questions becomes an interview request via the admin.
- Out-of-scope topics → one-line acknowledgement, handoff note, back on track.
- After CH4, no new channel/market threads; depth only on used channels.
