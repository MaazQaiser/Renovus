import { renderReport } from "@/lib/reports/render";

export async function GET(request: Request): Promise<Response> {
  return renderReport(request, "pre-assessment");
}
