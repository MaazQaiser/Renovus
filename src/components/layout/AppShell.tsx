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
import { getUiPrefs, setUiPref, subscribeToUiPrefs } from "@/lib/ui-prefs";
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
  const collapsed = useSyncExternalStore(subscribeToUiPrefs, readCollapsed, () => true);
  const items = breadcrumb ?? breadcrumbForPath(pathname);
  const hideTopbar = pathname === "/agents" || pathname === "/agents/";

  const setCollapsed = useCallback((next: boolean | ((current: boolean) => boolean)) => {
    const resolved = typeof next === "function" ? next(readCollapsed()) : next;
    // Merges rather than replacing — the ui blob holds other preferences too.
    setUiPref("sidebarCollapsed", resolved);
  }, []);

  const sidebarFooter = <UserMenu placement="sidebar" collapsed={collapsed} />;

  return (
    <TopbarMetaProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
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
            <div className="flex h-14 shrink-0 items-center justify-between px-4 lg:hidden">
              <IconButton
                icon={Menu}
                label="Open navigation"
                onClick={() => setMobileOpen(true)}
              />
              <UserMenu placement="topbar" />
            </div>
          ) : (
            <Topbar onMenuClick={() => setMobileOpen(true)} breadcrumb={items} />
          )}
          <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </TopbarMetaProvider>
  );
}
