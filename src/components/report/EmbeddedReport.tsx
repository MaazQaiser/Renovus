"use client";


export interface EmbeddedReportProps {
  /** Path to the prepared report document. */
  src: string;
  title: string;
}

/**
 * Frames a prepared standalone report inside the app shell.
 *
 * The document brings its own <head>, fonts, tab navigation and script, so it
 * cannot be rendered as part of the React tree — an iframe is what lets it keep
 * working while the app keeps its own navigation around it. It fills the main
 * scroll area and scrolls internally, because the report paginates itself.
 *
 * There is only one of everything: the brand comes from the sidebar and the
 * report's name, company and back-trail from the breadcrumb, so the document's
 * own masthead, a heading and a back button are all redundant here. `title` is
 * the iframe's accessible name, not visible chrome.
 */
export function EmbeddedReport({ src, title }: EmbeddedReportProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <iframe
        src={src}
        title={title}
        className="min-h-0 w-full flex-1 border-0 bg-transparent"
      />
    </div>
  );
}
