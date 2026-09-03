import { cn } from "@/lib/cn";

/**
 * The overline used to head each band of the home page. A real `<h2>` so the
 * page has an outline; Text only renders p/span/div.
 */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-[11px] leading-4 font-semibold uppercase tracking-[0.08em] text-tertiary",
        className,
      )}
    >
      {children}
    </h2>
  );
}
