import type { AnswerValue } from "./question";

/** Confidence tags from the spec: A Actual · E Estimate ±20% · G Guess · N Not recorded · X Exists, can't extract. */
export type ConfidenceLevel = "A" | "E" | "G" | "N" | "X";

export const CONFIDENCE_OPTIONS: { id: ConfidenceLevel; label: string; hint: string }[] = [
  { id: "A", label: "Actual", hint: "From a system or a record." },
  { id: "E", label: "Estimate", hint: "Confident within about 20%." },
  { id: "G", label: "Guess", hint: "Directional only." },
  { id: "N", label: "Not recorded", hint: "Nobody tracks this." },
  { id: "X", label: "Exists, cannot extract", hint: "Recorded, but not available this week." },
];

/** A G/N/X answer is unmeasured; the spec requires a →WHO probe for each. */
export const UNMEASURED_CONFIDENCE: ConfidenceLevel[] = ["G", "N", "X"];

/** The spec's five sittings; a session may span more than one respondent. */
export type SalesSessionKey =
  | "phase1"
  | "deepdive"
  | "marketing"
  | "ceo-close";

export type SalesPhase =
  | "company"
  | "respondent"
  | "phase1"
  | "gate"
  | "phase2"
  | "marketing"
  | "ceo-close"
  | "complete";

export type SalesSection =
  | "business"
  | "engine"
  | "channels"
  | "team"
  | "limits"
  | "m-rfp"
  | "m-out"
  | "m-rel"
  | "m-fld"
  | "cap"
  | "marketing"
  | "systems"
  | "ceo-close";

export type SalesModule = "M-RFP" | "M-OUT" | "M-REL" | "M-FLD";

export type SalesQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "text"
  | "textarea"
  | "channel-matrix";

// ── Channel map ────────────────────────────────────────────────────────────

export type ChannelId =
  | "field"
  | "inside"
  | "rfp"
  | "referrals"
  | "events"
  | "linkedin"
  | "content"
  | "paid"
  | "marketplaces"
  | "expansion";

export type ChannelStatus = "using" | "not-using" | "want";

export type BlockerCategory =
  | "time"
  | "skill"
  | "money"
  | "tried-failed"
  | "dont-believe";

export interface ChannelEntry {
  channel: ChannelId;
  status: ChannelStatus;
  blocker?: BlockerCategory;
  blockerNote?: string;
}

export interface ChannelMap {
  entries: ChannelEntry[];
  /** At most two, from CH1b — decides which modules run in full vs ★ only. */
  dominant: ChannelId[];
}

export interface WantedSegment {
  id: string;
  label: string;
  blocker?: string;
}

// ── People ─────────────────────────────────────────────────────────────────

export interface Respondent {
  id: string;
  name: string;
  role: string;
  sessionKey: SalesSessionKey;
}

export type InterviewRequestStatus = "requested" | "scheduled" | "declined" | "pending";

export interface InterviewRequest {
  id: string;
  personOrRole: string;
  /** The QIDs this person was named against. Two is the spec's trigger. */
  questionIds: string[];
  reason: string;
  status: InterviewRequestStatus;
}

export interface HandoffNote {
  id: string;
  topic: string;
  quote: string;
  suggestedAgent: string;
  sourceQuestionId?: string;
}

// ── Questions ──────────────────────────────────────────────────────────────

export interface SalesQuestionOption {
  id: string;
  label: string;
}

export type FollowUpTrigger =
  | { kind: "always" }
  | { kind: "optionIds"; ids: string[] }
  | { kind: "includes"; tokens: string[] }
  | { kind: "multiValue"; min: number };

export interface SalesFollowUpRule {
  id: string;
  prompt: string;
  when: FollowUpTrigger;
  options?: SalesQuestionOption[];
}

export interface SalesQuestion {
  id: string;
  section: SalesSection;
  sessionKey: SalesSessionKey;
  module?: SalesModule;
  /** The literal chat line. `{{company}}` is interpolated at render time. */
  question: string;
  /** The spec's "Why" line — shown as framing above the question. */
  why?: string;
  type: SalesQuestionType;
  options?: SalesQuestionOption[];
  required: boolean;
  supportsText: boolean;
  supportsSpeech: boolean;
  asksConfidence: boolean;
  /** ★ in the spec: kept when a channel is used but not dominant. */
  star?: boolean;
  order: number;
  followUps?: SalesFollowUpRule[];
  /** Templates expanded into one queue entry per channel / segment. */
  loop?: "channel-want" | "segment";
}

// ── Session ────────────────────────────────────────────────────────────────

export type Classification = "pipeline-driven" | "relationship-driven" | "mixed";

export type GateStatus = "not-reached" | "open" | "accepted";

export interface GateState {
  status: GateStatus;
  corrections: string[];
  acceptedAt?: string;
}

export interface SalesAnswer {
  value: AnswerValue;
  label: string;
  confidence?: ConfidenceLevel;
  whoWouldKnow?: string;
  respondentId?: string;
}

export type SalesMessageKind =
  | "intro"
  | "company-prompt"
  | "company-answer"
  | "respondent-prompt"
  | "session-intro"
  | "question"
  | "answer"
  | "followup"
  | "who-probe"
  | "gate"
  | "complete"
  | "system";

export interface ChatMessage {
  id: string;
  role: "agent" | "user";
  kind: SalesMessageKind;
  content: string;
  timestamp: string;
  questionId?: string;
}

export interface SessionTiming {
  sessionKey: SalesSessionKey;
  startedAt: string;
  endedAt?: string;
}

export interface SalesAssessmentSession {
  id: string;
  companyId?: string;
  companyName?: string;
  departmentId: "sales";
  phase: SalesPhase;
  activeSession: SalesSessionKey;
  respondents: Respondent[];
  channelMap?: ChannelMap;
  wantedSegments: WantedSegment[];
  classification?: Classification;
  /** Set by the respondent at the gate; always beats the derived value. */
  classificationOverride?: Classification;
  gate: GateState;
  answers: Record<string, SalesAnswer>;
  /** parentQuestionId → follow-ups already asked. The spec caps this at 2. */
  followUpsUsed: Record<string, number>;
  /** personOrRole → the QIDs they were named against. */
  whoRegistry: Record<string, string[]>;
  interviewRequests: InterviewRequest[];
  handoffNotes: HandoffNote[];
  timings: SessionTiming[];
  messages: ChatMessage[];
  queue: string[];
  currentQuestionId?: string;
  /** Set while the mandatory →WHO probe is outstanding. */
  pendingWhoFor?: string;
  status: "in-progress" | "complete" | "processing";
  startedAt: string;
  updatedAt: string;
  qbankVersion: string;
}
