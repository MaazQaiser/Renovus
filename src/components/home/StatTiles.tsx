import Link from "next/link";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";

export interface StatTile {
  id: string;
  label: string;
  value: string;
  hint?: string;
  href?: AppHref;
}

const TILE =
  "flex flex-col rounded-xl border border-glass-border bg-glass p-5 shadow-[var(--shadow-glass)] backdrop-blur-3xl";

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => {
        const body = (
          <>
            <span className="text-[28px] leading-9 font-semibold tabular-nums text-foreground">
              {tile.value}
            </span>
            <span className="mt-1 text-[11px] uppercase leading-4 tracking-[0.08em] text-tertiary">
              {tile.label}
            </span>
            {tile.hint ? (
              <span className="mt-2 text-[13px] leading-5 text-secondary">{tile.hint}</span>
            ) : null}
          </>
        );

        return (
          <li key={tile.id}>
            {tile.href ? (
              <Link
                href={tile.href}
                className={cn(
                  TILE,
                  "transition-[box-shadow,background-color] duration-[140ms] hover:bg-glass-strong hover:shadow-[var(--shadow-raised)]",
                )}
              >
                {body}
              </Link>
            ) : (
              <div className={TILE}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
