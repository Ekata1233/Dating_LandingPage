import React from 'react'
import PremiumPlusCard from '../PremiumPlusCard'
import VipExclusiveCard from '../VipExclusiveCard'
import VipEliteCard from '../VipEliteCard'
import MyBalances from '../MyBalances'

import { MOCK_BALANCES, MOCK_DATE_PLANS_SUMMARY, MOCK_PLANS } from './shared/mockData'
import type { BalanceItem, DatePlansSummary, Plan } from './shared/types'

export type WalletTab = "wallet" | "plans";

export interface HomeSidebarProps {
    /** Initial / controlled tab. */
    tab?: WalletTab;
    onTabChange?: (tab: WalletTab) => void;
    balances?: BalanceItem[];
    datePlan?: DatePlansSummary;
    plans?: Plan[];
    /** "row" = horizontal carousel (desktop sidebar). "stack" = full-width list. */
    layout?: "row" | "stack";
    onAddBalance?: (label: string) => void;
    onDatePlanClick?: () => void;
    onSelectPlan?: (planId: Plan["id"]) => void;
    className?: string;
}

const PLAN_CARD_WIDTH = "250px";

function HomeSidebar({
    tab,
    onTabChange,
    balances = MOCK_BALANCES,
    datePlan = MOCK_DATE_PLANS_SUMMARY,
    plans = MOCK_PLANS,
    layout = "row",
    onAddBalance,
    onDatePlanClick,
    onSelectPlan,
    className = "",
}: HomeSidebarProps) {
    const [internalTab, setInternalTab] = React.useState<WalletTab>("wallet")
    const activeTab = tab ?? internalTab

    const select = (next: WalletTab) => {
        if (tab === undefined) setInternalTab(next)
        onTabChange?.(next)
    }

    const isStack = layout === "stack"

    const planCards = plans.map((plan) => {
        const props = {
            plan,
            width: isStack ? "100%" : PLAN_CARD_WIDTH,
            onSelect: onSelectPlan,
        }
        if (plan.id === "vip") return <VipExclusiveCard key={plan.id} {...props} />
        if (plan.id === "vip-elite") return <VipEliteCard key={plan.id} {...props} />
        return <PremiumPlusCard key={plan.id} {...props} />
    })

    return (
        <div className={`flex flex-col w-full h-full min-h-0 ${className}`}>
            {/* Tabs */}
            <div className="flex px-3 py-4">
                <button onClick={() => select("wallet")} className={`flex-1 cursor-pointer text-[14px] py-3 text-center border-b-2 font-semibold   ${activeTab === "wallet" ? "border-[#C21559] text-[#C21559]" : "border-slate-50 text-black"}`}>
                    Wallet
                </button>
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
                    {planCards}
                </div> : <div className="flex-1 overflow-y-auto ">
                    <MyBalances
                        items={balances}
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
