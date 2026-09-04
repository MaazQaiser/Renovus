import {
  INTAKE_TEMPLATE_FILENAME,
  intakeTemplateCsv,
} from "@/data/sales/intakeTemplate";

/**
 * The opportunity-export template, generated from the same column list the
 * parser matches against — so a template that downloads always parses.
 *
 * Its dates are written relative to the moment of download, which is also why
 * it is a route rather than a static file under /public: a fixed sample would
 * age into a file whose "trailing twelve months" held nothing.
 *
 * The upload screen also fetches this URL for its "use the sample export"
 * shortcut, so the download and the shortcut can never diverge.
 */
export async function GET(): Promise<Response> {
  return new Response(intakeTemplateCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${INTAKE_TEMPLATE_FILENAME}"`,
      "cache-control": "no-store",
    },
  });
}
