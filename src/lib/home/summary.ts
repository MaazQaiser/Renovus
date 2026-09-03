import { formatDate } from "@/lib/format";
import type { Resumable } from "./resumable";

export interface HomeSummaryInput {
  completedCount: number;
  companiesCovered: number;
  portfolioSize: number;
  salesCount: number;
  offshoringCount: number;
  lastCompleted?: { companyName: string; completedAt: string };
  resumables: Resumable[];
}

/**
 * A run of text with the figures marked. Returning parts rather than a string
 * is what lets the greeting emphasise the numbers without the renderer having
 * to parse a finished sentence back apart.
 */
export interface SummaryPart {
  text: string;
  emphasis?: boolean;
}

/**
 * The state of play as two lines: what has been completed, then what is still
 * open and how recently anything landed. Pure — it never reads the clock, so
 * the same records always produce the same sentences.
 */
export function buildHomeSummary(input: HomeSummaryInput): SummaryPart[][] {
  return [completedLine(input), openLine(input)];
}

function completedLine({
  completedCount,
  companiesCovered,
  portfolioSize,
  salesCount,
  offshoringCount,
}: HomeSummaryInput): SummaryPart[] {
  if (completedCount === 0) {
    return [
      { text: "No assessments completed yet — finished baselines will collect here." },
    ];
  }

  const parts: SummaryPart[] = [
    { text: String(completedCount), emphasis: true },
    { text: ` assessment${completedCount === 1 ? "" : "s"} completed across ` },
    { text: `${companiesCovered} of ${portfolioSize}`, emphasis: true },
    { text: " PortCos" },
  ];

  // The split only says something when both agents have actually run.
  if (salesCount > 0 && offshoringCount > 0) {
    parts.push(
      { text: " — " },
      { text: String(salesCount), emphasis: true },
      { text: " sales and " },
      { text: String(offshoringCount), emphasis: true },
      { text: " offshoring." },
    );
  } else {
    parts.push({ text: "." });
  }

  return parts;
}

function openLine({ lastCompleted, resumables }: HomeSummaryInput): SummaryPart[] {
  const [first, ...rest] = resumables;
  const parts: SummaryPart[] = [];

  if (!first) {
    parts.push({ text: "Nothing left part-way." });
  } else {
    const names = resumables.map((item) => item.companyName ?? "an unnamed draft");
    parts.push({ text: String(resumables.length), emphasis: true });

    if (rest.length === 0) {
      parts.push(
        { text: ` left part-way — ${names[0]} at ` },
        { text: `${first.percent}%`, emphasis: true },
        { text: " captured." },
      );
    } else {
      parts.push({ text: ` left part-way — ${joinNames(names)}.` });
    }
  }

  if (lastCompleted) {
    parts.push(
      { text: " Last report filed " },
      { text: formatDate(lastCompleted.completedAt), emphasis: true },
      { text: ` for ${lastCompleted.companyName}.` },
    );
  } else if (!first) {
    parts.push({ text: " Start one when you're ready." });
  }

  return parts;
}

function joinNames(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}
