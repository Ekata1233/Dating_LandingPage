"use client";

import React, { useMemo } from 'react'
import PremiumPlusCard from '../cards/PremiumPlusCard'
import VipExclusiveCard from '../cards/VipExclusiveCard'
import VipEliteCard from '../cards/VipEliteCard'
import MyBalances from '../cards/MyBalances'

import { MOCK_DATE_PLANS_SUMMARY } from '../shared/mockData'
import type { BalanceItem, DatePlansSummary } from '../shared/types'

import { useUserProfileData, type UserBalances } from '@/app/context/UserProfileDataContext'
import { useAccountSettings, type Plan } from '@/app/context/AccountSettingsContext'
import { useActiveSection } from '@/app/context/ActiveSectionContext';

export type WalletTab = "wallet" | "plans";

export interface HomeSidebarProps {
    /** Initial / controlled tab. */
    tab?: WalletTab;
    onTabChange?: (tab: WalletTab) => void;
    /** Optional overrides. When omitted, data comes from the API contexts. */
    balances?: BalanceItem[];
    datePlan?: DatePlansSummary;
    /** API-shaped plans — the cards render them directly, so no UI mapping. */
    plans?: Plan[];
    /** "row" = horizontal carousel (desktop sidebar). "stack" = full-width list. */
    layout?: "row" | "stack";
    onAddBalance?: (label: string) => void;
    onDatePlanClick?: () => void;
    onSelectPlan?: (planSlug: Plan["slug"]) => void;
    className?: string;
}

const PLAN_CARD_WIDTH = "250px";

/* ------------------------------ mappers ------------------------------ */

/** API balances object -> the card list MyBalances renders. */
const toBalanceCards = (b: UserBalances | null): BalanceItem[] => [
    { label: "Roses", value: String(b?.roses.balance ?? 0), bg: "#fdeecb", emoji: "⭐" },
    { label: "Compliments", value: String(b?.compliments.balance ?? 0), bg: "#fbe1e6", emoji: "💌" },
    { label: "My Boosts", value: String(b?.boosts.balance ?? 0), bg: "#dcebfa", emoji: "🚀" },
    { label: "My Wallet", value: b?.wallet.formattedBalance ?? "₹0", bg: "#fbdce8", emoji: "👛" },
];

/* ----------------------------- component ----------------------------- */

function HomeSidebar({
    tab,
    onTabChange,
    balances,
    datePlan = MOCK_DATE_PLANS_SUMMARY,
    plans,
    layout = "row",
    onAddBalance,
    onDatePlanClick,
    onSelectPlan,
    className = "",
}: HomeSidebarProps) {
    const { activeSection } = useActiveSection()
    const [internalTab, setInternalTab] = React.useState<WalletTab>("wallet")
    /* On /app/home/plans/[id]/* the panel is plans-only: no Wallet tab, and the
       tab follows the route rather than local state. */
    const plansOnly = activeSection === "plans"
    const activeTab = tab ?? (plansOnly ? "plans" : internalTab)

    /* API data */
    const { balances: apiBalances } = useUserProfileData()
    const { plans: apiPlans, plansLoading, plansError, refetchPlans } = useAccountSettings()
    const balanceItems = useMemo(
        () => balances ?? toBalanceCards(apiBalances),
        [balances, apiBalances]
    )

    /* Cards take the API plan as-is — slug picks the card, planUtils formats
       the price and picks each card's first five features. */
    const planItems = useMemo(
        () => plans ?? apiPlans,
        [plans, apiPlans]
    )

    const select = (next: WalletTab) => {
        if (tab === undefined) setInternalTab(next)
        onTabChange?.(next)
    }

    const isStack = layout === "stack"

    const planCards = planItems.map((plan) => {
        const props = {
            plan,
            width: isStack ? "100%" : PLAN_CARD_WIDTH,
            onSelect: onSelectPlan,
        }

        /* The slug picks the card; anything the API adds later falls back to
           the Premium+ treatment rather than rendering nothing. */
        if (plan.slug === "vip") return <VipExclusiveCard key={plan.id} {...props} />;
        if (plan.slug === "vip-elite") return <VipEliteCard key={plan.id} {...props} />;
        return <PremiumPlusCard key={plan.id} {...props} />;
    })

    return (
        <div className={`flex flex-col w-full h-full min-h-0 ${className}`}>
            {/* Tabs */}
            <div className="flex px-3 py-4">
                {!plansOnly && (
                    <button onClick={() => select("wallet")} className={`flex-1 cursor-pointer text-[14px] py-3 text-center border-b-2 font-semibold   ${activeTab === "wallet" ? "border-[#C21559] text-[#C21559]" : "border-slate-50 text-black"}`}>
                        Wallet
                    </button>
                )}
                <button onClick={() => select("plans")} className={`cursor-pointer flex-1 text-[14px] py-3  text-center font-semibold border-b-2 ${activeTab === "plans" ? "border-[#C21559] text-[#C21559]" : "border-slate-50 text-black"}`}>
                    Plans
                </button>
            </div>

            {/* Matches Section */}
            {activeTab === "plans" ?
                <div
                    className={
                        isStack
                            ? "flex flex-col gap-3 py-5 px-3"
                            : "flex flex-col items-center gap-3 py-5 overflow-x-auto"
                    }
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {plansLoading && planItems.length === 0 ? (
                        <p className="text-[13px] text-slate-500">Loading plans…</p>
                    ) : plansError && planItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[13px] text-slate-500">{plansError}</p>
                            <button
                                onClick={() => void refetchPlans()}
                                className="cursor-pointer text-[13px] font-semibold text-[#C21559]"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        planCards
                    )}
                </div> : <div className="flex-1 overflow-y-auto ">
                    <MyBalances
                        items={balanceItems}
                        datePlan={datePlan}
                        onAdd={onAddBalance}
                        onDatePlanClick={onDatePlanClick}
                    />
                </div>
            }

        </div>
    )
}

export default HomeSidebar