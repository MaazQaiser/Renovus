"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface TopbarMeta {
  title?: string;
  badges?: string[];
  actions?: ReactNode;
}

interface TopbarMetaContextValue {
  meta: TopbarMeta;
  setMeta: (meta: TopbarMeta) => void;
  clearMeta: () => void;
}

const TopbarMetaContext = createContext<TopbarMetaContextValue | null>(null);

export function TopbarMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMetaState] = useState<TopbarMeta>({});

  const setMeta = useCallback((next: TopbarMeta) => {
    setMetaState(next);
  }, []);

  const clearMeta = useCallback(() => {
    setMetaState({});
  }, []);

  const value = useMemo(
    () => ({ meta, setMeta, clearMeta }),
    [meta, setMeta, clearMeta],
  );

  return (
    <TopbarMetaContext.Provider value={value}>{children}</TopbarMetaContext.Provider>
  );
}

export function useTopbarMeta() {
  const ctx = useContext(TopbarMetaContext);
  if (!ctx) {
    throw new Error("useTopbarMeta must be used within TopbarMetaProvider");
  }
  return ctx;
}

/** Publish topbar title / badges / actions while this screen is mounted. */
export function useSetTopbarMeta(meta: TopbarMeta) {
  const { setMeta, clearMeta } = useTopbarMeta();

  useEffect(() => {
    setMeta(meta);
  }, [meta, setMeta]);

  useEffect(() => () => clearMeta(), [clearMeta]);
}
