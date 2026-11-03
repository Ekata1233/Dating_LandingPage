"use client";
//FRONTEND ONLY -> this is a frontend only context used to manage the admirer's tab 
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

/* -------------------------------------------------------------------------- */
/*  Which Admirers tab is active.                                             */
/*                                                                            */
/*  The tabs live in the rail sidebar, but the profile card lives out in the   */
/*  screen slot — siblings under the /app layout, so they cannot share local   */
/*  state. This tiny provider (mounted once in the /app layout, around both)   */
/*  is what lets the screen follow the tab the rail last selected.             */
/* -------------------------------------------------------------------------- */

export type AdmirersTab = "received" | "sent";

interface AdmirersTabContextType {
    tab: AdmirersTab;
    setTab: (tab: AdmirersTab) => void;
    /** User id of the admirer picked in the active tab, or null for "first". */
    selectedId: string | null;
    /** Pick an admirer in the active tab; pass null to fall back to the first. */
    selectAdmirer: (id: string | null) => void;
}

const AdmirersTabContext =
    createContext<AdmirersTabContextType | undefined>(undefined);

export function AdmirersTabProvider({ children }: { children: ReactNode }) {
    const [tab, setTabState] = useState<AdmirersTab>("received");
    /* Selection is kept per tab so switching tabs lands on that tab's first
       admirer until the user picks one there. */
    const [selection, setSelection] = useState<Record<AdmirersTab, string | null>>(
        { received: null, sent: null }
    );

    const setTab = useCallback((next: AdmirersTab) => setTabState(next), []);

    const selectAdmirer = useCallback(
        (id: string | null) => {
            setSelection((prev) =>
                prev[tab] === id ? prev : { ...prev, [tab]: id }
            );
        },
        [tab]
    );

    const selectedId = selection[tab];

    const value = useMemo(
        () => ({ tab, setTab, selectedId, selectAdmirer }),
        [tab, setTab, selectedId, selectAdmirer]
    );

    return (
        <AdmirersTabContext.Provider value={value}>
            {children}
        </AdmirersTabContext.Provider>
    );
}

export function useAdmirersTab() {
    const context = useContext(AdmirersTabContext);

    if (context === undefined) {
        throw new Error(
            "useAdmirersTab must be used within an AdmirersTabProvider"
        );
    }

    return context;
}
