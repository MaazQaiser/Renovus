"use client";

import { Menu } from "lucide-react";
import { IconButton } from "@/components/primitives/IconButton";
import { UserMenu } from "@/components/navigation/UserMenu";
import { Breadcrumb, type BreadcrumbItem } from "@/components/navigation/Breadcrumb";
import { Badge } from "@/components/primitives/Badge";
import { Text } from "@/components/primitives/Text";
import { useTopbarMeta } from "@/providers/TopbarMetaProvider";

export interface TopbarProps {
  onMenuClick?: () => void;
  breadcrumb?: BreadcrumbItem[];
}

export function Topbar({ onMenuClick, breadcrumb }: TopbarProps) {
  const { meta } = useTopbarMeta();
  const hasActions = Boolean(meta.actions);

  return (
    <header className="flex h-16 shrink-0 items-center px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onMenuClick ? (
            <IconButton
              icon={Menu}
              label="Open navigation"
              className="lg:hidden"
              onClick={onMenuClick}
            />
          ) : null}

          {breadcrumb ? <Breadcrumb items={breadcrumb} className="min-w-0" /> : null}

          {/* The breadcrumb already names the page, so the title only stands in
              where there is no trail at all. Hiding the trail on narrow screens
              left no way back except the browser button. */}
          {meta.title && !breadcrumb ? (
            <Text weight="semibold" className="truncate text-[15px] leading-6">
              {meta.title}
            </Text>
          ) : null}

          {meta.badges?.map((badge, index) => (
            <Badge
              key={badge}
              tone={index === 0 ? "accent" : "info"}
              variant="subtle"
              size="md"
              className="hidden shrink-0 sm:inline-flex"
            >
              {badge}
            </Badge>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasActions ? meta.actions : null}
          <div className="lg:hidden">
            <UserMenu placement="topbar" />
          </div>
        </div>
      </div>
    </header>
  );
}
