import type { BlockerCategory, ChannelId, SalesModule } from "@/types/sales-assessment";

/**
 * Channel inventory for Phase 1 Part 3 (CH1) and the CH2 blocker probe of
 * the question bank (v4). Order matches the CH1 checklist exactly.
 * The module mapping decides which Phase 2 deep-dive modules run.
 */

export const CHANNELS: { id: ChannelId; label: string; module?: SalesModule }[] = [
  { id: "field", label: "Field sales", module: "M-FLD" },
  { id: "inside", label: "Inside sales / cold outreach", module: "M-OUT" },
  { id: "rfp", label: "RFP portals and tenders", module: "M-RFP" },
  { id: "referrals", label: "Referrals and partnerships", module: "M-REL" },
  { id: "events", label: "Events and conferences", module: "M-FLD" },
  { id: "linkedin", label: "LinkedIn", module: "M-OUT" },
  { id: "content", label: "Content and SEO" },
  { id: "paid", label: "Paid advertising" },
  { id: "marketplaces", label: "Marketplaces or platforms" },
  { id: "expansion", label: "Structured expansion of existing clients", module: "M-REL" },
];

/** CH2 — the spec's five blocker categories, verbatim. */
export const BLOCKER_OPTIONS: { id: BlockerCategory; label: string }[] = [
  { id: "time", label: "Time" },
  { id: "skill", label: "Skill" },
  { id: "money", label: "Money" },
  { id: "tried-failed", label: "Tried and failed" },
  { id: "dont-believe", label: "Don't believe it works for a business like ours" },
];

export function getChannel(id: string) {
  return CHANNELS.find((channel) => channel.id === id);
}
