import type { SalesAssessmentSession } from "@/types/sales-assessment";

/**
 * Part E2's fixed AI candidate menu. Each trigger returns the evidence string
 * when it fires, so a selected candidate always cites the answer that selected
 * it — no candidate is ever ticked without a reason drawn from the session.
 */
export type CandidateTrigger = (session: SalesAssessmentSession) => string | undefined;

export interface AiCandidate {
  id: string;
  label: string;
  triggerText: string;
  triggers: CandidateTrigger[];
}

function answer(session: SalesAssessmentSession, qid: string): string | undefined {
  const label = session.answers[qid]?.label?.trim();
  return label ? label : undefined;
}

/** Fires when an answer exists and its text matches. */
function whenAnswerMatches(qid: string, pattern: RegExp): CandidateTrigger {
  return (session) => {
    const value = answer(session, qid);
    if (!value || !pattern.test(value)) return undefined;
    return `${qid} — ${value}`;
  };
}

/** Fires when an answer was given but is unmeasured (G/N/X). */
function whenUnmeasured(qid: string): CandidateTrigger {
  return (session) => {
    const entry = session.answers[qid];
    if (!entry?.confidence || !["G", "N", "X"].includes(entry.confidence)) return undefined;
    return `${qid} — ${entry.label} (${entry.confidence})`;
  };
}

function whenChannel(channelId: string, status: string): CandidateTrigger {
  return (session) => {
    const entry = session.channelMap?.entries.find((e) => e.channel === channelId);
    if (entry?.status !== status) return undefined;
    return `CH1 — ${channelId} marked "${status}"`;
  };
}

export const AI_CANDIDATES: AiCandidate[] = [
  {
    id: "rfp-discovery",
    label: "RFP / tender discovery agent",
    triggerText: "Portal watching is manual, or opportunities are learned about late",
    triggers: [
      whenAnswerMatches("E3a", /late|manual|client|ad hoc|watch/i),
      whenUnmeasured("M-RFP.1a"),
      whenUnmeasured("M-RFP.1b"),
      whenChannel("rfp", "using"),
    ],
  },
  {
    id: "bid-no-bid",
    label: "Bid / no-bid scoring",
    triggerText: "Low win rate, or no consistent qualification rule",
    triggers: [
      whenUnmeasured("M-RFP.6b"),
      whenAnswerMatches("M-RFP.3", /gut|carry on|already invested/i),
    ],
  },
  {
    id: "proposal-drafting",
    label: "Proposal drafting assistant",
    triggerText: "Significant hours per proposal, or reuse is copy-paste",
    triggers: [whenAnswerMatches("M-RFP.4a", /\d/), whenAnswerMatches("T2", /proposal/i)],
  },
  {
    id: "proposal-library",
    label: "Reusable answer library",
    triggerText: "Content is rewritten each time",
    triggers: [
      whenAnswerMatches("M-RFP.5a", /fresh/i),
      whenAnswerMatches("M-RFP.5b", /nowhere|rebuilt|scattered|ask one/i),
    ],
  },
  {
    id: "lead-research",
    label: "Prospect research agent",
    triggerText: "Outbound lists are built by hand",
    triggers: [whenAnswerMatches("M-OUT.1", /manual|hand|scrape|list/i), whenChannel("inside", "using")],
  },
  {
    id: "outreach-sequencing",
    label: "Outreach sequencing",
    triggerText: "Outbound happens in bursts rather than continuously",
    triggers: [whenAnswerMatches("M-OUT.3", /burst|ad hoc|when we have time/i)],
  },
  {
    id: "conversation-capture",
    label: "Call and meeting capture",
    triggerText: "No CRM anyone reads, or notes live in inboxes",
    triggers: [
      whenAnswerMatches("E5", /exists but no|no crm/i),
      whenAnswerMatches("E5", /spreadsheet|inbox|memory/i),
    ],
  },
  {
    id: "pipeline-hygiene",
    label: "Pipeline hygiene agent",
    triggerText: "Pipeline data is stale or incomplete",
    triggers: [whenUnmeasured("M-OUT.4"), whenUnmeasured("M-REL.4a")],
  },
  {
    id: "referral-prompting",
    label: "Referral prompting",
    triggerText: "Referrals arrive unprompted rather than being asked for",
    triggers: [
      whenAnswerMatches("M-REL.2", /unprompted|happen|luck|organic/i),
      whenChannel("referrals", "using"),
    ],
  },
  {
    id: "account-expansion",
    label: "Account expansion signals",
    triggerText: "Existing-client growth is unstructured",
    triggers: [
      whenChannel("expansion", "want"),
      whenAnswerMatches("M-REL.3a", /informal|no reviews|loose/i),
      whenAnswerMatches("M-REL.3b", /rarely|client asks/i),
    ],
  },
  {
    id: "key-person-transfer",
    label: "Relationship knowledge transfer",
    triggerText: "Revenue concentrates on a small number of relationships",
    triggers: [whenAnswerMatches("E6", /50|60|70|80|90|half|most|majority/i)],
  },
  {
    id: "content-generation",
    label: "Content generation",
    triggerText: "Content or SEO is wanted but not resourced",
    triggers: [whenChannel("content", "want"), whenUnmeasured("MK3a")],
  },
  {
    id: "marketing-attribution",
    label: "Attribution and reporting",
    triggerText: "Marketing spend cannot be tied to pipeline",
    triggers: [
      whenUnmeasured("MK6"),
      whenAnswerMatches("MK2", /nothing|can't trace|no idea|none/i),
    ],
  },
  {
    id: "capacity-modelling",
    label: "Capacity and throughput modelling",
    triggerText: "The stated ceiling has never been tested",
    triggers: [whenUnmeasured("CAP.2"), whenAnswerMatches("CAP.1", /feel|sense|think/i)],
  },
];
