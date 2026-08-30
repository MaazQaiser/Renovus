"use client";

import { Button } from "@/components/primitives/Button";
import { ButtonGroup } from "@/components/primitives/ButtonGroup";
import { Card } from "@/components/primitives/Card";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import type { AppHref } from "@/lib/routes";

export interface InProgressRunCardProps {
  title: string;
  companyName?: string;
  departmentName?: string;
  progressLabel: string;
  updatedLabel: string;
  continueHref: AppHref;
  continueLabel: string;
  onStartOver?: () => void;
}

export function InProgressRunCard({
  title,
  companyName,
  departmentName,
  progressLabel,
  updatedLabel,
  continueHref,
  continueLabel,
  onStartOver,
}: InProgressRunCardProps) {
  return (
    <Card tone="subtle" className="flex flex-col gap-4">
      <div>
        <Text size="overline" tone="secondary">
          In progress
        </Text>
        <Heading level={2} size="h3" className="mt-2">
          {title}
        </Heading>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {companyName ? (
          <div>
            <dt>
              <Text size="caption" tone="tertiary">
                Company
              </Text>
            </dt>
            <dd className="mt-1">
              <Text size="body-sm" weight="semibold">
                {companyName}
              </Text>
            </dd>
          </div>
        ) : null}
        {departmentName ? (
          <div>
            <dt>
              <Text size="caption" tone="tertiary">
                Department
              </Text>
            </dt>
            <dd className="mt-1">
              <Text size="body-sm" weight="semibold">
                {departmentName}
              </Text>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>
            <Text size="caption" tone="tertiary">
              Progress
            </Text>
          </dt>
          <dd className="mt-1">
            <Text size="body-sm" weight="semibold">
              {progressLabel}
            </Text>
          </dd>
        </div>
        <div>
          <dt>
            <Text size="caption" tone="tertiary">
              Last updated
            </Text>
          </dt>
          <dd className="mt-1">
            <Text size="body-sm" weight="semibold">
              {updatedLabel}
            </Text>
          </dd>
        </div>
      </dl>
      <ButtonGroup align="start" stackOn="sm" reverseOnStack>
        {onStartOver ? (
          <Button variant="ghost" onClick={onStartOver}>
            Start over
          </Button>
        ) : null}
        <Button href={continueHref}>{continueLabel}</Button>
      </ButtonGroup>
    </Card>
  );
}
