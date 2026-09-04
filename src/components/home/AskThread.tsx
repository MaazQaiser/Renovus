"use client";

import { ArrowRight } from "lucide-react";
import { CompanyAvatar } from "@/components/companies/CompanyAvatar";
import { CoverageMeter } from "@/components/companies/CoverageIndicators";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { formatDate } from "@/lib/format";
import type { AskReply } from "@/lib/home/ask";
import type { Company } from "@/types/company";

export interface AskTurn {
  id: string;
  question: string;
  reply: AskReply;
}

export interface AskThreadProps {
  turns: AskTurn[];
  /** Picking a company chip asks the follow-up for you. */
  onPickCompany: (company: Company) => void;
  onStart: (reply: AskReply) => void;
}

function AnswerCard({
  reply,
  onPickCompany,
  onStart,
}: {
  reply: AskReply;
  onPickCompany: (company: Company) => void;
  onStart: (reply: AskReply) => void;
}) {
  return (
    <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-glass-border bg-glass-strong px-4 py-3.5 shadow-[var(--shadow-glass)] backdrop-blur-2xl">
      {reply.company ? (
        <div className="flex items-center gap-2.5">
          <CompanyAvatar company={reply.company} size="sm" />
          <span className="text-[15px] font-semibold text-foreground">
            {reply.company.name}
          </span>
        </div>
      ) : null}

      <Text size="body-sm" className={reply.company ? "mt-2.5" : undefined}>
        {reply.text}
      </Text>

      {reply.coverage ? (
        <div className="mt-3">
          <CoverageMeter coverage={reply.coverage} />
        </div>
      ) : null}

      {reply.progress?.lastAssessedAt ? (
        <Text size="caption" tone="tertiary" className="mt-2">
          Last assessed {formatDate(reply.progress.lastAssessedAt)}
        </Text>
      ) : null}

      {reply.options && reply.options.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {reply.options.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                onClick={() => onPickCompany(company)}
                className="inline-flex items-center gap-1.5 rounded-control border border-glass-border bg-glass px-2.5 py-1 text-[13px] leading-5 text-secondary transition-colors duration-[140ms] hover:bg-glass-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <CompanyAvatar company={company} size="sm" className="size-4 rounded" />
                {company.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {reply.next && reply.company ? (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-glass-hairline pt-3">
          <Button
            variant="primary"
            size="sm"
            trailingIcon={ArrowRight}
            onClick={() => onStart(reply)}
          >
            Start assessment
          </Button>
          <Text size="caption" tone="tertiary">
            {reply.next.agentLabel}
          </Text>
        </div>
      ) : null}
    </div>
  );
}

export function AskThread({ turns, onPickCompany, onStart }: AskThreadProps) {
  return (
    <ol className="flex flex-col gap-4">
      {turns.map((turn) => (
        <li key={turn.id} className="flex flex-col gap-2">
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-[14px] leading-6 text-inverse">
              {turn.question}
            </p>
          </div>

          <AnswerCard
            reply={turn.reply}
            onPickCompany={onPickCompany}
            onStart={onStart}
          />
        </li>
      ))}
    </ol>
  );
}
