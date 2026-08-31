import Image from "next/image";
import { cn } from "@/lib/cn";

/** One shared mark for every interview agent. */
const AGENT_MARK = "/agents/agent-art-offshoring.png";

export interface AgentAvatarProps {
  className?: string;
}

/**
 * The agent's mark on the interview stage: a halo pulsing outward, with the
 * mark breathing and slowly drifting.
 *
 * The art carries its own alpha, so the disc no longer needs a white fill or
 * ring to hide a backing square. The circular crop stays: the source has a wide
 * empty margin, so the art is still scaled past the edges to fill the disc.
 * `unoptimized` is required — the image optimizer flattens the alpha onto white.
 */
export function AgentAvatar({ className }: AgentAvatarProps) {
  return (
    <div className={cn("relative size-[72px] shrink-0", className)}>
      <span
        className="animate-agent-halo absolute inset-0 rounded-full bg-accent-muted"
        aria-hidden
      />

      <span className="absolute inset-0 overflow-hidden rounded-full" aria-hidden>
        <span className="animate-agent-drift flex size-full items-center justify-center">
          <Image
            src={AGENT_MARK}
            alt=""
            width={144}
            height={144}
            priority
            unoptimized
            className="animate-agent-breathe size-[104px] max-w-none"
          />
        </span>
      </span>
    </div>
  );
}
