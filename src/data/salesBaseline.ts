import type {
  BaselineIntervention,
  BaselineMotion,
  SalesBaselineData,
} from "@/types/sales-baseline";

/**
 * The sales process pre-assessment fixture.
 *
 * Transcribed from the prepared document, with the company's name interpolated
 * — the figures are the sample's. Everything here is deliberately approximate:
 * see the notice, which is the first thing the report says.
 */

const MOTIONS: BaselineMotion[] = [
  {
    code: "A",
    id: "referral",
    name: "Relationship & Referral",
    revenue: "~$31M",
    fte: "~8",
    winRate: "~35%",
    daysToClose: "~10 wks",
    dealsWon: "~7 / mo",
    intro: `Four partners sell through their networks. This is about half of revenue and the best win rate. Nothing is written down: referrals sit in email, estimates in one partner's workbook, no pipeline report.`,
    heaviestStage: 2,
    stages: [
      {
        name: "Network & referral intake",
        volume: "~35",
        volumeLabel: "referral conversations / mo",
        volumeSource: "est",
        conversion: "~55%",
        cycle: "~1 wk",
        hours: "~60 h",
        system: "Partner inboxes, notes",
        quote:
          "Referrals come to whoever knows the source. A lot never make it into the CRM.",
      },
      {
        name: "Partner intro & discovery",
        volume: "~20",
        volumeLabel: "discovery meetings / mo",
        volumeSource: "crm",
        conversion: "~55%",
        cycle: "~2 wks",
        hours: "~60 h",
        system: "CRM, partly",
        quote:
          "We know if it's a fit in the room. Budget and timeline get confirmed later by email.",
      },
      {
        name: "Scoped SOW & estimate",
        volume: "~10",
        volumeLabel: "SOWs issued / mo",
        volumeSource: "crm",
        conversion: "~65%",
        cycle: "~3 wks",
        hours: "~100 h",
        system: "Estimation workbook",
        quote: "Every SOW starts from the last one. The CFO review adds a week.",
      },
      {
        name: "MSA / SOW signed & kickoff",
        volume: "~7",
        volumeLabel: "signed engagements / mo",
        volumeSource: "crm",
        cycle: "~4 wks",
        hours: "~60 h",
        system: "DocuSign, PSA",
        quote:
          "Legal takes two to four weeks. Then someone re-keys it into the PSA.",
      },
    ],
    target: {
      revenue: "~$34M to ~$37M",
      revenueDelta: "+~$3M to +~$6M",
      daysToClose: "~8 wks",
      dealsWon: "~8 / mo",
      intro:
        "Partners spend more of their week in their networks. Referrals that used to get lost land in the CRM. Proposals take about half the time. Roughly one more signed engagement a month.",
      stages: [
        {
          volume: "~40",
          volumeDelta: "+~5",
          cycle: "~1 wk",
          hours: "~40 h",
          hoursDelta: "−~20 h",
          system: "CRM, auto-captured",
          note: "Referrals from email land in the CRM on their own. Partners get a one-page brief before they call.",
        },
        {
          volume: "~22",
          volumeDelta: "+~2",
          cycle: "~1.5 wks",
          hours: "~35 h",
          hoursDelta: "−~25 h",
          system: "CRM",
          note: "Discovery is unchanged. Notes and budget are captured from the call, not from memory.",
        },
        {
          volume: "~12",
          volumeDelta: "+~2",
          cycle: "~1.5 wks",
          hours: "~60 h",
          hoursDelta: "−~40 h",
          system: "Estimation tool, SOW templates",
          note: "Estimates start from similar past projects. SOWs generate from the estimate. CFO sees exceptions only.",
        },
        {
          volume: "~8",
          volumeDelta: "+~1",
          cycle: "~3 wks",
          hours: "~35 h",
          hoursDelta: "−~25 h",
          system: "DocuSign to PSA, synced",
          note: "Signed SOW creates the PSA project. Every referral source hears what the deal became.",
        },
      ],
    },
  },
  {
    code: "B",
    id: "gov",
    name: "Government Portal RFP",
    revenue: "~$13M",
    fte: "~4 to 5",
    winRate: "~1 in 12",
    daysToClose: "~4 mo",
    dealsWon: "~4 / yr",
    intro:
      "A four-person capture team answering federal, state and local solicitations. Wins about one in twelve. Most of the effort is the technical volume, rebuilt from an old bid each time. Tracked mostly outside the CRM.",
    heaviestStage: 2,
    stages: [
      {
        name: "Portal monitoring & intake",
        volume: "~30",
        volumeLabel: "solicitations screened / mo",
        volumeSource: "est",
        conversion: "~30%",
        cycle: "~1 wk",
        hours: "~20 h",
        system: "Portals, email alerts",
        quote:
          "Someone checks about two dozen portals every morning. We missed a couple last year.",
      },
      {
        name: "Bid / no-bid & compliance check",
        volume: "~10",
        volumeLabel: "go / no-go decisions / mo",
        volumeSource: "est",
        conversion: "~40%",
        cycle: "~1 wk",
        hours: "~30 h",
        system: "Compliance matrix in Excel",
        quote:
          "We read the whole thing cover to cover and build the matrix by hand before Friday.",
      },
      {
        name: "Response assembly & pricing",
        volume: "~4",
        volumeLabel: "responses submitted / mo",
        volumeSource: "est",
        conversion: "~8%",
        cycle: "~3 to 4 wks",
        hours: "~100 h",
        system: "Shared drive",
        quote:
          "A response is well over a hundred hours. Past performance and résumés get re-gathered every time.",
      },
      {
        name: "Award & contract vehicle",
        volume: "~4",
        volumeLabel: "awards / yr",
        volumeSource: "est",
        cycle: "~2 to 3 mo",
        hours: "~30 h",
        system: "Contract-vehicle portals",
        quote:
          "After the award there is a second registration nobody budgets for.",
      },
    ],
    target: {
      revenue: "~$16M to ~$19M",
      revenueDelta: "+~$3M to +~$6M",
      daysToClose: "~3 mo",
      dealsWon: "~5 to 6 / yr",
      intro:
        "Same four people answer noticeably more solicitations. Portal scanning and the compliance matrix become automatic. The technical volume starts from a draft. One or two more awards a year.",
      stages: [
        {
          volume: "~35",
          volumeDelta: "+~5",
          cycle: "days",
          hours: "~5 h",
          hoursDelta: "−~15 h",
          system: "Portal aggregator",
          note: "One tool watches all the portals and matches on capability, not keywords.",
        },
        {
          volume: "~10",
          cycle: "days",
          hours: "~15 h",
          hoursDelta: "−~15 h",
          system: "AI compliance matrix",
          note: "The matrix is extracted, not typed. Go / no-go is still a human call.",
        },
        {
          volume: "~5 to 6",
          volumeDelta: "+~1 to 2",
          cycle: "~2 wks",
          hours: "~50 h",
          hoursDelta: "−~50 h",
          system: "Content library",
          note: "Past performance and résumés come from a library. The technical volume starts from a first draft.",
        },
        {
          volume: "~5 to 6",
          volumeDelta: "+~1 to 2",
          cycle: "~2 to 3 mo",
          hours: "~20 h",
          hoursDelta: "−~10 h",
          system: "Contract-vehicle portals, pre-filled",
          note: "Registration is pre-filled from the bid. The protest window belongs to the buyer and does not change.",
        },
      ],
    },
  },
  {
    code: "C",
    id: "inside",
    name: "Inside Sales",
    revenue: "~$18M",
    fte: "~13",
    winRate: "~20%",
    daysToClose: "~10 wks",
    dealsWon: "~20 / mo",
    intro:
      "Six SDRs, five AEs and two engineers selling to mid-market buyers. About 20 wins a month. The biggest drop is at the top: only a few percent of contacts reach a call. Two systems that never synced.",
    heaviestStage: 0,
    stages: [
      {
        name: "Outbound & inbound triage",
        volume: "~2,000",
        volumeLabel: "outbound touches / mo",
        volumeSource: "est",
        conversion: "~5%",
        cycle: "~2 wks",
        hours: "~220 h",
        system: "Engagement platform, CRM",
        quote: "SDRs log everything twice. The sync never got finished.",
      },
      {
        name: "Discovery & fit scoring",
        volume: "~100",
        volumeLabel: "discovery calls / mo",
        volumeSource: "crm",
        conversion: "~50%",
        cycle: "~1 wk",
        hours: "~140 h",
        system: "CRM",
        quote: "SDR books it, AE runs it, notes get re-typed at the handoff.",
      },
      {
        name: "Demo, pilot scope & quote",
        volume: "~50",
        volumeLabel: "quotes issued / mo",
        volumeSource: "crm",
        conversion: "~40%",
        cycle: "~2 wks",
        hours: "~120 h",
        system: "Demo env, quote spreadsheet",
        quote:
          "Quotes come out of a spreadsheet with three different price lists pasted in.",
      },
      {
        name: "Procurement, security & signature",
        volume: "~20",
        volumeLabel: "closed-won / mo",
        volumeSource: "crm",
        cycle: "~5 wks",
        hours: "~90 h",
        system: "Buyer portals, questionnaires",
        quote:
          "Security questionnaires from scratch every time. A month of waiting.",
      },
    ],
    target: {
      revenue: "~$21M to ~$23M",
      revenueDelta: "+~$3M to +~$5M",
      daysToClose: "~7 wks",
      dealsWon: "~24 / mo",
      intro:
        "SDRs spend their time on calls, not lists and re-typing. Touches rise, discovery follows at the same rate, and closed deals go from about 20 a month to about 24. Closing gets a couple of weeks shorter.",
      stages: [
        {
          volume: "~2,400",
          volumeDelta: "+~400",
          cycle: "~1.5 wks",
          hours: "~100 h",
          hoursDelta: "−~120 h",
          system: "Engagement platform and CRM, synced",
          note: "Enriched lists, AI sequence drafts, and one record instead of two.",
        },
        {
          volume: "~115",
          volumeDelta: "+~15",
          cycle: "~1 wk",
          hours: "~90 h",
          hoursDelta: "−~50 h",
          system: "CRM",
          note: "Buyers book through a link. SDR and AE work from the same record.",
        },
        {
          volume: "~58",
          volumeDelta: "+~8",
          cycle: "~1.5 wks",
          hours: "~60 h",
          hoursDelta: "−~60 h",
          system: "Demo templates, quoting tool",
          note: "One price list in a quoting tool. Demo environments from templates.",
        },
        {
          volume: "~24",
          volumeDelta: "+~4",
          cycle: "~3 to 4 wks",
          hours: "~50 h",
          hoursDelta: "−~40 h",
          system: "Answer library, buyer portals",
          note: "Security questionnaires answered from a library. Registration pre-filled. Negotiation unchanged.",
        },
      ],
    },
  },
];

const INTERVENTIONS: BaselineIntervention[] = [
  {
    motion: "A",
    tier: 1,
    name: "Capture referrals from email into the CRM",
    base: '~35 referral conversations / mo; "a lot" never logged',
    source: "Conversation",
    assumption: "Logged referrals up 5% to 15%.",
    arithmetic: "~35 × 5–15% × ~20% win × ~$370K avg deal",
    lo: 1.5,
    hi: 4.5,
    why: 'The head of sales said "a lot" get lost. We did not get a number, so the range is wide.',
  },
  {
    motion: "A",
    tier: 2,
    name: "Estimate assistant and SOW generation",
    base: "~10 SOWs / mo; Proposal takes ~3 wks",
    source: "CRM, partial",
    assumption:
      "~40 h/wk of partner time back into the network. One new referral per ~10 partner hours.",
    arithmetic: "~40 h × 50–75% ÷ 10 h × 4.3 wk × ~20% × ~$370K",
    lo: 1.5,
    hi: 3.0,
    why: 'Hours are a guess from "about a third of my week". Treat this row as directional.',
  },
  {
    motion: "B",
    tier: 1,
    name: "Content library, then AI first draft of the technical volume",
    base: "~48 responses / yr; ~4 awards; ~$3M per award",
    source: "Conversation",
    assumption: "Same team submits 20% to 50% more responses. Award rate held.",
    arithmetic: "~48 × 20–50% × ~8% × ~$3M",
    lo: 2.5,
    hi: 6.0,
    why: "One award is about $3M, so this is one or two extra wins a year, not a curve. Bid numbers are not in the CRM at all.",
  },
  {
    motion: "B",
    tier: 1,
    name: "Portal aggregator and AI compliance matrix",
    base: "~30 solicitations screened / mo; a couple missed last year",
    source: "Conversation",
    assumption: "~30 h/wk freed. Counted as capacity, not revenue.",
    arithmetic: "~30 h/wk × 52 = ~1,500 h / yr into capture",
    lo: 0,
    hi: 0,
    capacity: "~1,500 h / yr",
    why: "Finding more bids is worth nothing without the capacity to write them. That is the row above.",
  },
  {
    motion: "C",
    tier: 1,
    name: "Sync the two systems, automate lists, AI sequence drafts",
    base:
      "~2,000 touches / mo; ~5% reach discovery; ~40% of quotes close; ~$70K avg deal",
    source: "CRM, partial",
    assumption: "~120 h/wk freed. Touches up 10% to 30%. Conversion held.",
    arithmetic: "~2,000 × 10–30% × ~5% × ~40% × 12 × ~$70K",
    lo: 1.5,
    hi: 4.5,
    why: "Funnel rates come from the two-thirds of records with stage history. The top-of-funnel rate is the shakiest number on the page.",
  },
  {
    motion: "C",
    tier: 2,
    name: "Quoting tool, answer library, pre-filled registration",
    base: "~50 quotes / mo; Closing takes ~5 wks",
    source: "CRM, partial",
    assumption:
      "~100 h/wk freed. Closing about two weeks shorter. Counted as capacity.",
    arithmetic: "~100 h/wk × 52 = ~5,000 h / yr into demos and quotes",
    lo: 0,
    hi: 0,
    capacity: "~5,000 h / yr",
    why: "Cycle time, not revenue. Same deals, sooner.",
  },
];

export function getSalesBaselineReport(companyName: string): SalesBaselineData {
  return {
    companyName,
    date: "Sales Process Pre-Assessment",

    notice: `This version rests on one 30 minute conversation with the head of sales and a partial CRM export. Every number is an estimate or a ballpark and is tagged accordingly. It is enough to see the shape of the opportunity, not enough to size it precisely.`,

    dataCards: [
      {
        kind: "interview",
        title: "30 minutes with the head of sales",
        what: `The three ways ${companyName} wins work, the rough steps in each, roughly who does what, and the parts that annoy them most.`,
        gaveUs:
          "Motions, stage names, approximate headcount per motion, a rough sense of where time goes, and the friction stories. No task-level time, no cost.",
        collectedPct: 72,
      },
      {
        kind: "export",
        title: "CRM dump, incomplete",
        what: "Opportunities from the last 12 months with stage, amount and close date. Stage history is missing for about a third of records; the bid motion is mostly tracked outside the CRM.",
        gaveUs:
          "Deal counts and revenue by motion, a rough funnel for referral and inside sales, and approximate days in stage where history exists. Bid desk numbers come from the conversation.",
        collectedPct: 65,
      },
      {
        kind: "todo",
        title: "What we would still need",
        what: "To turn every estimate below into a measurement.",
        items: [
          "Complete CRM export with stage history, plus the bid tracker",
          "Finance close list, 12 months, tagged by motion",
          "Headcount and loaded cost for everyone who sells",
          "15 minutes per seller on how their week splits across stages and tasks",
          "One hour per motion watching a deal move through the tools",
        ],
        footnote:
          "About one day of the company's time. It adds task-level flows, cost per stage and handoff counts.",
        collectedPct: 0,
      },
    ],

    overview: {
      revenue: "~$62M",
      dealsWon: "~28 / mo",
      daysToClose: "~10 wks to ~4 mo",
      fte: "~26",
      intro: `${companyName} won about $62M last year, roughly 28 deals a month, three ways. Referrals win most and most often. Inside sales brings the volume. The bid desk wins rarely and slowly. In all three the Proposal stage is where deals slow down and where the most hand work is.`,
      stageNotes: [
        "Every motion finds its next deal somewhere different and none of it lands in one place.",
        "Qualification is a conversation everywhere, and the outcome mostly lives in people's heads.",
        "The heaviest stage in every motion. Everything starts from the last one.",
        "Legal, security paperwork and re-keying make Closing a waiting game.",
      ],
    },

    overviewTarget: {
      revenue: "~$70M to ~$78M",
      revenueDelta: "+~$8M to +~$16M",
      dealsWon: "~32 to ~34 / mo",
      daysToClose: "~7 wks to ~3 mo",
      fte: "~26",
      intro:
        "Roughly 400 selling hours a week come back into calls, meetings and bids. Deals won go from about 28 a month to the low thirties with conversion held flat. Proposal is still the heaviest stage, at about half the effort.",
      stageNotes: [
        "Every lead lands in a system on its own.",
        "Still a conversation. Now written down automatically.",
        "Everything starts from something instead of nothing.",
        "Paperwork gone. Negotiation and kickoff stay with people.",
      ],
    },

    motions: MOTIONS,

    calculationLede:
      "Ballpark ranges built on ballpark inputs, so they are wide on purpose. Conversion rates are held flat. Freed time goes into more selling, not fewer people. Where the base figure is an estimate, the range is wider.",

    interventions: INTERVENTIONS,
  };
}
