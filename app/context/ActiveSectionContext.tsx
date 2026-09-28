"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type ActiveSection =
  | "home"
  | "date-now"
  | "admirer"
  | "plans"
  | "profile"
  | "edit-profile"
  | "help"
  | "logout"
  | "chat"
  | "refer-earn";

interface ActiveSectionContextType {
  activeSection: ActiveSection;
  setActiveSection: Dispatch<SetStateAction<ActiveSection>>;
}

export const ActiveSectionContext =
  createContext<ActiveSectionContextType | undefined>(undefined);

interface ActiveSectionProviderProps {
  children: ReactNode;
}

export function ActiveSectionProvider({
  children,
}: ActiveSectionProviderProps) {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("home");

  return (
    <ActiveSectionContext.Provider
      value={{ activeSection, setActiveSection }}
    >
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