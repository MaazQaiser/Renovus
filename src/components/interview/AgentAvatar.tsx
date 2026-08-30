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
 * The source art is line work on an opaque white square. Blend modes can't drop
 * that white here — the animated ancestors create their own stacking contexts,
 * which isolates the blend — so the art is masked into a disc instead, and
 * scaled past the edges so its whitespace margin is cropped away.
 */
export function AgentAvatar({ className }: AgentAvatarProps) {
  return (
    <div className={cn("relative size-[72px] shrink-0", className)}>
      <span
        className="animate-agent-halo absolute inset-0 rounded-full bg-accent-muted"
        aria-hidden
      />

      <span
        className="absolute inset-0 overflow-hidden rounded-full bg-surface ring-1 ring-border"
        aria-hidden
      >
        <span className="animate-agent-drift flex size-full items-center justify-center">
          <Image
            src={AGENT_MARK}
            alt=""
            width={144}
            height={144}
            priority
            className="animate-agent-breathe size-[104px] max-w-none"
          />
        </span>
      </span>
    </div>
  );
}
