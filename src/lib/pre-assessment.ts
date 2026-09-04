import type {
  Intervention,
  Motion,
  MotionStage,
  TaskMode,
  Tier,
} from "@/types/sales-pre-assessment";

/**
 * Everything derived from the pre-assessment fixture.
 *
 * Roll-ups, tier ladders and impact totals are all computed from the motion
 * data rather than authored beside it, so the Overview and the Impact page can
 * never drift from the motion they came from.
 */

export type ModeTotals = Record<TaskMode, number>;

export interface StageStats {
  /** Hours a week today. */
  now: number;
  /** Hours a week left with a person. */
  after: number;
  freed: number;
  /** Today's hours split by what happens to them. */
  mix: ModeTotals;
}

const EMPTY_MIX: ModeTotals = { auto: 0, ai: 0, human: 0, rm: 0 };

export const MODE_LABEL: Record<TaskMode, string> = {
  auto: "Automated",
  ai: "AI-assisted",
  human: "Stays human",
  rm: "Removed",
};

export const TIER_WHEN: Record<Tier, string> = {
  1: "0 to 3 months · buy and switch on",
  2: "3 to 9 months · configure and train",
  3: "9 to 18 months · build and prove",
};

export const TIER_NAME: Record<Tier, string> = {
  1: "Quick wins",
  2: "Next",
  3: "Ambitious",
};

/**
 * One stage's before and after.
 *
 * `mix` attributes *today's* hours to what happens to them, so the bars show
 * where the current load goes rather than what is left — a task cut from 30
 * hours to 2 should read as 30 hours automated, not 2.
 */
export function stageStats(stage: MotionStage): StageStats {
  const mix: ModeTotals = { ...EMPTY_MIX };
  let now = 0;
  let after = 0;

  stage.tasks.forEach((task, index) => {
    const toBe = stage.toBe.tasks[index];
    now += task.hoursPerWeek;
    // A missing to-be task means nothing changes, rather than dropping to zero.
    after += toBe ? toBe.hoursPerWeek : task.hoursPerWeek;
    if (toBe) mix[toBe.mode] += task.hoursPerWeek;
  });

  return { now, after, freed: now - after, mix };
}

function sumStats(stats: StageStats[]): StageStats {
  return stats.reduce<StageStats>(
    (total, item) => ({
      now: total.now + item.now,
      after: total.after + item.after,
      freed: total.freed + item.freed,
      mix: {
        auto: total.mix.auto + item.mix.auto,
        ai: total.mix.ai + item.mix.ai,
        human: total.mix.human + item.mix.human,
        rm: total.mix.rm + item.mix.rm,
      },
    }),
    { now: 0, after: 0, freed: 0, mix: { ...EMPTY_MIX } },
  );
}

export function motionStats(motion: Motion): StageStats {
  return sumStats(motion.stages.map(stageStats));
}

export function allStats(motions: Motion[]): StageStats {
  return sumStats(motions.map(motionStats));
}

export interface StageRollup extends StageStats {
  /** Per-motion before and after, so the roll-up can show its parts. */
  parts: { code: string; stats: StageStats }[];
  hoursPerWeek: number;
  costK: number;
  handoffs: number;
  volumes: { code: string; value: string; label: string }[];
  conversions: { code: string; value: string; label: string }[];
  costSplit: { code: string; value: string }[];
}

/** Stage `index` summed across every motion. */
export function stageRollup(motions: Motion[], index: number): StageRollup {
  const entries = motions
    .map((motion) => ({ code: motion.code, stage: motion.stages[index] }))
    .filter((entry): entry is { code: string; stage: MotionStage } =>
      Boolean(entry.stage),
    );

  const parts = entries.map((entry) => ({
    code: entry.code,
    stats: stageStats(entry.stage),
  }));

  return {
    ...sumStats(parts.map((part) => part.stats)),
    parts,
    hoursPerWeek: entries.reduce((sum, entry) => sum + entry.stage.hoursPerWeek, 0),
    costK: entries.reduce((sum, entry) => sum + entry.stage.costK, 0),
    handoffs: entries.reduce((sum, entry) => sum + entry.stage.handoffs, 0),
    volumes: entries.map((entry) => ({ code: entry.code, ...entry.stage.volume })),
    conversions: entries.map((entry) => ({
      code: entry.code,
      ...entry.stage.conversion,
    })),
    costSplit: entries.map((entry) => ({
      code: entry.code,
      value: formatCostK(entry.stage.costK),
    })),
  };
}

/** $636K below a million, $1.04M above — matching how the figures are quoted. */
export function formatCostK(thousands: number): string {
  if (thousands < 1000) return `$${Math.round(thousands)}K`;
  return `$${(thousands / 1000).toFixed(2)}M`;
}

export interface LadderRung {
  tier: Tier;
  freed: number;
  /** Biggest savers first. */
  items: { task: string; hours: number; motionCode: string }[];
}

/**
 * Freed hours grouped by how soon the change is realistic.
 *
 * Only tasks that actually change earn a tier, so tasks left with people are
 * absent rather than counted as a zero-hour win.
 */
export function tierLadder(motions: Motion[]): LadderRung[] {
  const tiers = new Map<Tier, LadderRung>([
    [1, { tier: 1, freed: 0, items: [] }],
    [2, { tier: 2, freed: 0, items: [] }],
    [3, { tier: 3, freed: 0, items: [] }],
  ]);

  for (const motion of motions) {
    for (const stage of motion.stages) {
      stage.tasks.forEach((task, index) => {
        const toBe = stage.toBe.tasks[index];
        if (!toBe?.tier) return;
        const rung = tiers.get(toBe.tier);
        if (!rung) return;
        const hours = task.hoursPerWeek - toBe.hoursPerWeek;
        rung.freed += hours;
        rung.items.push({ task: task.task, hours, motionCode: motion.code });
      });
    }
  }

  return [...tiers.values()].map((rung) => ({
    ...rung,
    items: [...rung.items].sort((left, right) => right.hours - left.hours),
  }));
}

export interface ImpactTotals {
  revLoM: number;
  revHiM: number;
  winsLo: number;
  winsHi: number;
  hoursFreed: number;
}

export function impactTotals(interventions: Intervention[]): ImpactTotals {
  return interventions.reduce<ImpactTotals>(
    (total, row) => ({
      revLoM: total.revLoM + row.revLoM,
      revHiM: total.revHiM + row.revHiM,
      winsLo: total.winsLo + row.winsLo,
      winsHi: total.winsHi + row.winsHi,
      hoursFreed: total.hoursFreed + row.hoursFreed,
    }),
    { revLoM: 0, revHiM: 0, winsLo: 0, winsHi: 0, hoursFreed: 0 },
  );
}
