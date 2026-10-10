"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  pathForSection,
  sectionFromPathname,
  type ActiveSection,
} from "@/app/app/config/sections";

export type { ActiveSection };

interface ActiveSectionContextType {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

export const ActiveSectionContext =
  createContext<ActiveSectionContextType | undefined>(undefined);

interface ActiveSectionProviderProps {
  children: ReactNode;
}

/**
 * The active section is not state — it is the URL. Reading it off
 * `usePathname()` means a deep link, a refresh and the back button all land on
 * the view the user expects, and `setActiveSection` is just navigation.
 */
export function ActiveSectionProvider({
  children,
}: ActiveSectionProviderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeSection = sectionFromPathname(pathname);

  const setActiveSection = useCallback(
    (section: ActiveSection) => {
      /* Re-pushing the current URL would drop the query string and reset the
         scroll position for no reason. */
      if (section === sectionFromPathname(pathname)) return;

      router.push(pathForSection(section), { scroll: false });
    },
    [pathname, router]
  );

  const value = useMemo(
    () => ({ activeSection, setActiveSection }),
    [activeSection, setActiveSection]
  );

  return (
    <ActiveSectionContext.Provider value={value}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSection() {
  const context = useContext(ActiveSectionContext);

  if (context === undefined) {
    throw new Error(
      "useActiveSection must be used within an ActiveSectionProvider"
    );
  }

  return context;
}
