import { cn } from "@/lib/cn";
import type { ReportBand, SourcingModel } from "@/data/offshoringReport";

/** Small uppercase eyebrow above a panel heading. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-doc-amber">
      {children}
    </p>
  );
}

/** Panel headline. `highlight` is set in the gold marker treatment. */
export function DocTitle({
  highlight,
  children,
}: {
  highlight?: string;
  children: React.ReactNode;
}) {
  return (
    <h1 className="mt-3 max-w-[60ch] font-serif text-[30px] font-semibold leading-[1.22] tracking-[-0.01em] text-doc-ink md:text-[37px]">
      {highlight ? (
        <span className="mr-1 rounded-[4px] bg-doc-gold px-2.5 py-0.5 text-doc-ink [box-decoration-break:clone]">
          {highlight}
        </span>
      ) : null}
      {children}
    </h1>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 max-w-[80ch] text-[15px] leading-[1.55] text-doc-muted">{children}</p>
  );
}

export function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-doc-muted">
      {children}
    </p>
  );
}

export function Rollup({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[11.5px] text-doc-faint">{children}</p>;
}

const BAND_TAG: Record<ReportBand, string> = {
  High: "bg-doc-gold text-doc-ink",
  Medium: "bg-doc-gold-4 text-doc-amber",
  Low: "bg-doc-hair text-doc-muted",
};

export function Tag({
  variant = "band",
  band,
  children,
}: {
  variant?: "band" | "model" | "owner";
  band?: ReportBand;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold tracking-[0.02em]",
        variant === "band" && band && BAND_TAG[band],
        variant === "model" && "border border-doc-sep bg-doc-warm font-medium text-doc-body",
        variant === "owner" && "bg-doc-hair font-medium text-doc-body",
      )}
    >
      {children}
    </span>
  );
}

export function ModelTag({ model }: { model: SourcingModel }) {
  return <Tag variant="model">{model}</Tag>;
}

/** Table shell — hairline rows, ink header rule, uppercase headers. */
export function DocTable({
  head,
  children,
  minWidth = 0,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-[13.5px]"
        style={minWidth ? { minWidth } : undefined}
      >
        <thead>{head}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Th({
  right,
  width,
  children,
}: {
  right?: boolean;
  width?: string;
  children?: React.ReactNode;
}) {
  return (
    <th
      style={width ? { width } : undefined}
      className={cn(
        "border-b border-doc-ink pb-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-doc-faint",
        right ? "pl-3 pr-0 text-right" : "pr-2.5 text-left",
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  right,
  muted,
  className,
  children,
}: {
  right?: boolean;
  muted?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <td
      className={cn(
        "border-b border-doc-hair py-2.5 align-top text-doc-body",
        right ? "pl-3 pr-0 text-right tabular-nums" : "pr-3",
        muted && "text-[12px] text-doc-muted",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** The document footer rule carried by the first and last panels. */
export function FootLine({
  confidentiality,
  preparedBy,
}: {
  confidentiality: string;
  preparedBy: string;
}) {
  return (
    <div className="mt-7 flex flex-wrap justify-between gap-2 border-t border-doc-hair pt-3 text-[11.5px] text-doc-faint">
      <span>{confidentiality}</span>
      <span>Prepared by {preparedBy}</span>
    </div>
  );
}
