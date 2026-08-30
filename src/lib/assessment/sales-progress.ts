import { getSalesQuestion } from "@/data/sales";
import {
  statusFor,
  summarize,
  type CaptureItem,
  type CaptureProgress,
  type CaptureSection,
} from "@/lib/interview/capture";
import type { SalesAssessmentSession, SalesSection } from "@/types/sales-assessment";
import {
  buildCeoCloseQueue,
  buildMarketingQueue,
  buildPhase1Queue,
  buildPhase2Queue,
  hasMarketingOwner,
} from "./sales-routing";
import { effectiveClassification } from "./sales-engine";

const SECTION_LABELS: Record<SalesSection, string> = {
  business: "The business",
  engine: "The sales engine",
  channels: "Channel map",
  team: "Team, tools & time",
  limits: "Limits & pain",
  "m-rfp": "RFPs & tenders",
  "m-out": "Outbound",
  "m-rel": "Referrals & expansion",
  "m-fld": "Field & events",
  cap: "Capacity",
  marketing: "Marketing",
  systems: "Systems & AI",
  "ceo-close": "CEO close",
};

/**
 * Derives the "What I'm capturing" rail from a sales session.
 *
 * Pure and SSR-safe. Phase 2 sections only get a real denominator once the gate
 * has run — before that they show as a lookahead placeholder rather than a
 * guessed total, because the channel map decides which modules exist at all.
 */
export function getSalesCaptureProgress(
  session: SalesAssessmentSession,
): CaptureProgress {
  const sections: CaptureSection[] = [];

  const companyCaptured = session.companyName ? 1 : 0;
  sections.push({
    id: "company",
    label: "Company",
    captured: companyCaptured,
    total: 1,
    status: statusFor(companyCaptured, 1, session.phase === "company"),
    items: session.companyName
      ? [{ id: "company", label: "Portfolio company", value: session.companyName }]
      : [],
  });

  const currentSection = session.currentQuestionId
    ? getSalesQuestion(session.currentQuestionId)?.section
    : undefined;

  // One bucket per section across every queue, in first-seen order. The Systems
  // block closes both the deep dive and the marketing session, so the same
  // section can arrive twice — collecting first keeps it a single rail row.
  const bySection = new Map<SalesSection, string[]>();
  const collect = (ids: string[]) => {
    for (const id of ids) {
      const section = getSalesQuestion(id)?.section;
      if (!section) continue;
      const bucket = bySection.get(section) ?? [];
      if (!bucket.includes(id)) bucket.push(id);
      bySection.set(section, bucket);
    }
  };

  collect(buildPhase1Queue());

  const gateAccepted = session.gate?.status === "accepted";

  if (gateAccepted) {
    collect(buildPhase2Queue(session.channelMap, effectiveClassification(session)));
    if (hasMarketingOwner(session.answers)) collect(buildMarketingQueue());
    collect(buildCeoCloseQueue());
  }

  for (const [section, sectionIds] of bySection) {
    sections.push(buildSection(section, sectionIds, session, currentSection === section));
  }

  if (!gateAccepted) {
    sections.push({
      id: "phase2",
      label: "Deep dive",
      captured: 0,
      total: 0,
      status: "waiting",
      items: [],
      placeholder: "Unlocks at the Phase 1 gate, once the channel map is set.",
    });
  }

  return summarize(sections);
}

/** The bank keeps `{{company}}` verbatim; the rail shows it resolved. */
function interpolate(text: string, session: SalesAssessmentSession): string {
  return text
    .replaceAll("{{company}}", session.companyName ?? "the company")
    .replaceAll("{{pe_firm}}", "Renovus");
}

function buildSection(
  section: SalesSection,
  questionIds: string[],
  session: SalesAssessmentSession,
  isCurrent: boolean,
): CaptureSection {
  const items: CaptureItem[] = [];

  for (const questionId of questionIds) {
    const answer = session.answers[questionId];
    if (!answer) continue;
    items.push({
      id: questionId,
      label: interpolate(getSalesQuestion(questionId)?.question ?? questionId, session),
      value: answer.label || String(answer.value),
    });
  }

  return {
    id: section,
    label: SECTION_LABELS[section] ?? section,
    captured: items.length,
    total: questionIds.length,
    status: statusFor(items.length, questionIds.length, isCurrent),
    items,
  };
}
