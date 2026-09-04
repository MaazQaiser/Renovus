import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves the prepared workforce sourcing report with the PortCo's name swapped
 * in, so opening it from xFact reads as xFact's report rather than Collegis's.
 *
 * The name arrives as a query param rather than a company id because companies
 * live in localStorage — the server has no way to resolve an id it never saw.
 * Everything else in the document (payroll, headcount, functions) is the
 * original sample: this makes the demo consistent, not accurate.
 */
const TEMPLATE = path.join(
  process.cwd(),
  "public",
  "reports",
  "workforce-sourcing-assessment.html",
);

const SAMPLE_FULL_NAME = "Collegis Education";
const SAMPLE_SHORT_NAME = "Collegis";

/** The name is caller-supplied and lands in HTML, so it has to be escaped. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(request: Request): Promise<Response> {
  const requested = new URL(request.url).searchParams.get("portco")?.trim();

  let html: string;
  try {
    html = await readFile(TEMPLATE, "utf8");
  } catch {
    return new Response("Report template is missing.", { status: 404 });
  }

  if (requested) {
    const safe = escapeHtml(requested.slice(0, 80));
    // Longest first: replacing the short name first would leave "xFact Education".
    html = html.replaceAll(SAMPLE_FULL_NAME, safe).replaceAll(SAMPLE_SHORT_NAME, safe);
  }

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
