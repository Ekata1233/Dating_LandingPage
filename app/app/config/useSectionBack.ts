"use client";

import { useCallback } from "react";

import { useActiveSection } from "@/app/context/ActiveSectionContext";

import { SECTION_META } from "./sections";

/**
 * Resolves the back chevron of the current section. Returns undefined on the
 * sections that have nothing to go back to, so callers can hand it straight to
 * a button that hides itself when there is no handler.
 */
export function useSectionBack(): (() => void) | undefined {
  const { activeSection, setActiveSection } = useActiveSection();
  const backTo = SECTION_META[activeSection].backTo;

  return useCallback(() => {
    if (backTo) setActiveSection(backTo);
  }, [backTo, setActiveSection]);
}
