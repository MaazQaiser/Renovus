"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { primaryNav } from "@/data/nav";
import { IconButton } from "@/components/primitives/IconButton";
import { UserMenu } from "@/components/navigation/UserMenu";
import { breadcrumbForPath } from "@/lib/breadcrumb";
import { resetLocalData } from "@/lib/reset";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { getUiPrefs, setUiPref, subscribeToUiPrefs } from "@/lib/ui-prefs";
import { getServerRecords, listRecords, subscribeToRecords } from "@/lib/records";
import { TopbarMetaProvider } from "@/providers/TopbarMetaProvider";
import type { BreadcrumbItem } from "@/components/navigation/Breadcrumb";

function readCollapsed(): boolean {
  return getUiPrefs().sidebarCollapsed ?? true;
}

export interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
}

export function AppShell({ children, breadcrumb }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const collapsed = useSyncExternalStore(subscribeToUiPrefs, readCollapsed, () => true);
  /*
   * A saved report's crumbs name its PortCo, which only the record knows. Read
   * through the store rather than calling getRecord directly, so the server and
   * hydration snapshots agree and the trail fills in on the client pass.
   */
  const records = useSyncExternalStore(subscribeToRecords, listRecords, getServerRecords);
  const items = breadcrumb ?? breadcrumbForPath(pathname, records);
  /*
   * A single crumb just repeats the sidebar's active item, so the bar would be
   * 64px of chrome saying nothing. Keep it only where the trail actually
   * locates you — /agents/assessment/results and the like.
   */
  const hideTopbar = items.length <= 1;

  const setCollapsed = useCallback((next: boolean | ((current: boolean) => boolean)) => {
    const resolved = typeof next === "function" ? next(readCollapsed()) : next;
    // Merges rather than replacing — the ui blob holds other preferences too.
    setUiPref("sidebarCollapsed", resolved);
  }, []);

  const sidebarFooter = <UserMenu placement="sidebar" collapsed={collapsed} />;

  return (
    <TopbarMetaProvider>
      <div className="flex h-dvh overflow-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2"
        >
          Skip to main content
        </a>

        <div className="hidden h-full shrink-0 lg:block">
          <Sidebar
            items={primaryNav}
            collapsed={collapsed}
            onCollapsedChange={(next) => setCollapsed(next)}
            footer={sidebarFooter}
            onAction={(action) => {
              if (action === "reset") setResetOpen(true);
            }}
          />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-overlay"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex h-dvh w-[264px] flex-col bg-surface-inverse">
              <Sidebar
                items={primaryNav}
                footer={<UserMenu placement="sidebar" />}
                className="w-full"
                onAction={(action) => {
                  if (action === "reset") setResetOpen(true);
                }}
              />
              <IconButton
                icon={X}
                label="Close navigation"
                className="absolute right-2 top-3 text-inverse hover:bg-white/8"
                onClick={() => setMobileOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {hideTopbar ? (
            <>
              <div className="flex h-16 shrink-0 items-center justify-between px-8 lg:hidden">
                <IconButton
                  icon={Menu}
                  label="Open navigation"
                  onClick={() => setMobileOpen(true)}
                />
                <UserMenu placement="topbar" />
              </div>
              {/* No bar to show, but page content still has to start level with
                  the pages that do show one. */}
              <div className="hidden h-16 shrink-0 lg:block" aria-hidden />
            </>
          ) : (
            <Topbar onMenuClick={() => setMobileOpen(true)} breadcrumb={items} />
          )}
          <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      <ConfirmationDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset everything on this device?"
        description="Deletes every saved report, assessment in progress, PortCo edit and share on this device, then reloads to a clean start. You stay signed in. This cannot be undone."
        confirmLabel="Reset and start over"
        cancelLabel="Keep my data"
        tone="danger"
        onConfirm={() => {
          resetLocalData();
          /*
           * A hard navigation is required, not router.push. The session stores
           * hold the live session in a module-level `clientSession` that
           * outlives a client-side transition, so a soft navigation would
           * resurrect the assessment we just deleted from storage.
           */
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/agents";
        }}
      />
    </TopbarMetaProvider>
  );
}
