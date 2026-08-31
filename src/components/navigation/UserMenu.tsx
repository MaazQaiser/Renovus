"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { IconButton } from "@/components/primitives/IconButton";
import { useSession } from "@/providers/SessionProvider";
import { cn } from "@/lib/cn";

export interface UserMenuProps {
  placement?: "topbar" | "sidebar";
  collapsed?: boolean;
}

export function UserMenu({ placement = "topbar", collapsed = false }: UserMenuProps) {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!session) return null;

  const dialog = (
    <ConfirmationDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title="Log out of Renovus?"
      description="You will need to sign in again to access agents. In-progress drafts stay on this device."
      confirmLabel="Log out"
      cancelLabel="Stay signed in"
      tone="default"
      onConfirm={() => {
        signOut();
        setConfirmOpen(false);
        router.replace("/login");
      }}
    />
  );

  if (placement === "sidebar") {
    if (collapsed) {
      return (
        <div className="flex flex-col items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-full bg-white/8 text-[12px] font-semibold text-inverse"
            title={session.name}
            aria-hidden
          >
            {session.initials}
          </span>
          <IconButton
            icon={LogOut}
            label="Log out"
            size="sm"
            className="text-inverse/72 hover:bg-white/8 hover:text-inverse"
            onClick={() => setConfirmOpen(true)}
          />
          {dialog}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-[12px] font-semibold text-inverse"
            aria-hidden
          >
            {session.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-4 text-inverse">
              {session.name}
            </p>
            <p className="mt-1 truncate text-[12px] leading-4 text-inverse/56">{session.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-semibold text-inverse/72 hover:bg-white/8 hover:text-inverse"
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden />
          Log out
        </button>
        {dialog}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-[13px] leading-4 font-semibold text-foreground">
          {session.name}
        </span>
        <span className="text-[12px] leading-4 text-tertiary">{session.email}</span>
      </div>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full",
          "bg-surface-secondary text-[12px] font-semibold text-accent",
        )}
        aria-hidden
      >
        {session.initials}
      </span>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-semibold text-secondary hover:bg-surface-secondary hover:text-foreground"
      >
        <LogOut size={16} strokeWidth={1.75} aria-hidden />
        <span className="hidden md:inline">Log out</span>
      </button>
      {dialog}
    </div>
  );
}
