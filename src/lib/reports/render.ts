import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves a prepared standalone report with the PortCo's name swapped in, so a
 * report opened from Halden reads as Halden's rather than the sample company's.
 *
 * The name arrives as a query param rather than a company id because PortCos
 * live in localStorage — the server cannot resolve an id it has never seen, and
 * anything added through the UI would otherwise break. Only the name changes:
 * every figure is still the original sample, which makes the demo consistent
 * rather than accurate.
 */
interface ReportSource {
  file: string;
  /** Longest first — replacing the short name first leaves "Halden Education". */
  sampleNames: string[];
}

const REPORTS = {
  offshoring: {
    file: "workforce-sourcing-assessment.html",
    sampleNames: ["Collegis Education", "Collegis"],
  },
  "pre-assessment": {
    file: "sales-process-pre-assessment.html",
    sampleNames: ["Halden Technology Group", "Halden"],
  },
} as const satisfies Record<string, ReportSource>;

export type ReportKey = keyof typeof REPORTS;

/** The name is caller-supplied and lands in HTML, so it has to be escaped. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function renderReport(
  request: Request,
  key: ReportKey,
): Promise<Response> {
  const source = REPORTS[key];
  const requested = new URL(request.url).searchParams.get("portco")?.trim();

  let html: string;
  try {
    html = await readFile(
      path.join(process.cwd(), "public", "reports", source.file),
      "utf8",
    );
  } catch {
    return new Response("Report template is missing.", { status: 404 });
  }

  if (requested) {
    const safe = escapeHtml(requested.slice(0, 80));
    for (const sample of source.sampleNames) {
      html = html.replaceAll(sample, safe);
    }
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
