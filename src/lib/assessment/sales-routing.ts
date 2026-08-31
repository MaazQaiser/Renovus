import {
  CAP_IDS,
  CEO_CLOSE_IDS,
  MARKETING_IDS,
  MODULE_QUESTION_IDS,
  PHASE1_QUESTION_IDS,
  STAR_IDS,
  SYSTEMS_IDS,
  getChannel,
} from "@/data/sales";
import type {
  ChannelMap,
  Classification,
  SalesAnswer,
  SalesModule,
} from "@/types/sales-assessment";

/**
 * Phase 2 routing, per the spec: the channel map decides which deep-dive
 * modules run, and dominance decides whether a module runs in full or as its
 * ★ minimal set.
 */

export function buildPhase1Queue(): string[] {
  return [...PHASE1_QUESTION_IDS];
}

/** Modules whose channels the company actually uses. */
export function modulesForChannelMap(map: ChannelMap | undefined): SalesModule[] {
  if (!map) return [];
  const modules = new Set<SalesModule>();
  for (const entry of map.entries) {
    if (entry.status !== "using") continue;
    const moduleId = getChannel(entry.channel)?.module;
    if (moduleId) modules.add(moduleId);
  }
  return [...modules];
}

/** True when the module's channels are used but neither is dominant. */
export function isStarOnly(
  module: SalesModule,
  map: ChannelMap | undefined,
  classification: Classification | undefined,
): boolean {
  // The spec is explicit: relationship-driven companies always get M-REL in full.
  if (module === "M-REL" && classification === "relationship-driven") return false;
  if (!map) return true;

  const dominantModules = new Set(
    map.dominant
      .map((channel) => getChannel(channel)?.module)
      .filter((value): value is SalesModule => Boolean(value)),
  );
  return !dominantModules.has(module);
}

/**
 * Classification from the E-block signals. The respondent can override this at
 * the gate, and their override always wins — see `effectiveClassification`.
 */
export function classify(
  answers: Record<string, SalesAnswer>,
  map: ChannelMap | undefined,
): Classification {
  let relationshipPoints = 0;
  let pipelinePoints = 0;

  // E4a — founder-led origination is a relationship signal.
  const e4 = answers["E4a"]?.label.toLowerCase() ?? "";
  if (e4.includes("founder") || e4.includes("owner") || e4.includes("partner")) {
    relationshipPoints += 1;
  }
  if (e4.includes("dedicated") || e4.includes("sales team") || e4.includes("seller")) {
    pipelinePoints += 1;
  }

  // E5 — a CRM anyone reads is a pipeline signal.
  const e5 = answers["E5"]?.value;
  if (e5 === "yes") pipelinePoints += 1;
  if (e5 === "no-crm") relationshipPoints += 1;

  // E6 — high key-person concentration is the strongest relationship signal.
  const e6 = answers["E6"]?.label.toLowerCase() ?? "";
  if (/(50|60|70|80|90|most|half|majority)/.test(e6)) relationshipPoints += 2;
  if (/(under 20|less than 20|10%|little|none)/.test(e6)) pipelinePoints += 1;

  // The channel map: outbound/RFP machinery is pipeline, referrals are not.
  const modules = modulesForChannelMap(map);
  if (modules.includes("M-OUT") || modules.includes("M-RFP")) pipelinePoints += 1;
  if (modules.includes("M-REL")) relationshipPoints += 1;

  if (relationshipPoints >= pipelinePoints + 2) return "relationship-driven";
  if (pipelinePoints >= relationshipPoints + 2) return "pipeline-driven";
  return "mixed";
}

export function classificationLabel(classification: Classification): string {
  switch (classification) {
    case "pipeline-driven":
      return "Pipeline-driven";
    case "relationship-driven":
      return "Relationship-driven";
    default:
      return "Mixed";
  }
}

/**
 * Deep-dive queue: the used modules (full or ★ only), then CAP and the Systems
 * block, which the spec says close every Phase 2 session.
 */
export function buildPhase2Queue(
  map: ChannelMap | undefined,
  classification: Classification | undefined,
): string[] {
  const queue: string[] = [];

  for (const moduleId of modulesForChannelMap(map)) {
    const ids = MODULE_QUESTION_IDS[moduleId] ?? [];
    queue.push(
      ...(isStarOnly(moduleId, map, classification)
        ? ids.filter((id) => STAR_IDS.includes(id))
        : ids),
    );
  }

  queue.push(...CAP_IDS, ...SYSTEMS_IDS);
  return queue;
}

export function buildMarketingQueue(): string[] {
  return [...MARKETING_IDS, ...SYSTEMS_IDS];
}

export function buildCeoCloseQueue(): string[] {
  return [...CEO_CLOSE_IDS];
}

/**
 * Whether the Marketing session runs at all — the spec gates it on Phase 1
 * having found someone who owns marketing.
 */
export function hasMarketingOwner(answers: Record<string, SalesAnswer>): boolean {
  const t3 = answers["T3a"]?.label.toLowerCase() ?? "";
  const t4 = answers["T4"]?.label.toLowerCase() ?? "";
  const combined = `${t3} ${t4}`;
  if (/(no one|nobody|none|no marketing)/.test(combined)) return false;
  return /(marketing|demand gen|content|brand|agency)/.test(combined);
}

/** Expand a loop template into one queue id per key, e.g. `CH2:field`. */
export function expandLoop(templateId: string, keys: string[]): string[] {
  return keys.map((key) => `${templateId}:${key}`);
}
