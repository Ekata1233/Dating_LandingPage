"use client";

import Link from "next/link";
import React from "react";
import { useLegalData} from "@/app/context/legalContext";
import  BlockRenderer  from "@/app/lib/htmlRenderHelpers";
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  label: "#9C948C",
  border: "#EDE4DC",
  tableHeadBg: "#F5EEE7",
  noteBg: "#FCEDF2",
  noteBorder: "#F5D9E3",
};


/* ------------------------------------------------------------------ */
/*  Loading / Error states                                             */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <main style={{ backgroundColor: C.bg }} className="w-full pt-15">
      <div className="w-full border-b" style={{ borderColor: C.border }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 my-5">
          <div className="h-4 w-48 animate-pulse rounded" style={{ backgroundColor: C.border }} />
          <div className="mt-4 h-6 w-32 animate-pulse rounded-full" style={{ backgroundColor: C.border }} />
          <div className="mt-5 h-10 w-72 animate-pulse rounded" style={{ backgroundColor: C.border }} />
          <div className="mt-3 h-4 w-96 animate-pulse rounded" style={{ backgroundColor: C.border }} />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-4">
        {["70%", "85%", "60%", "90%", "75%", "80%"].map((w, i) => (
          <div key={i} className="h-4 animate-pulse rounded" style={{ backgroundColor: C.border, width: w }} />
        ))}
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main style={{ backgroundColor: C.bg }} className="w-full mt-5 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-[14px]" style={{ color: C.body }}>{message}</p>
        <Link href="/" className="mt-4 inline-block text-[13px] font-medium" style={{ color: C.pink }}>
          ← Back to Welvors
        </Link>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function GrievanceRedressalPage() {
  const { grievanceRedressal, loading, error } = useLegalData();

  if (loading) return <LoadingSkeleton />;
  if (error || !grievanceRedressal) return <ErrorState message={error || "Grievance Redressal policy not available."} />;

  const { content, effectiveFrom, publishedAt } = grievanceRedressal;
  const lastUpdated = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const effective = effectiveFrom
    ? new Date(effectiveFrom).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <main style={{ backgroundColor: C.bg }} className="w-full pt-15">
      {/* ==================== Hero ==================== */}
      <div className="w-full border-b" style={{ borderColor: C.border }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-8 lg:px-8 my-3">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11.5px]" style={{ color: C.label }}>
              <Link href="/" className="hover:opacity-70">
                Welvors
              </Link>{" "}
              › <span>Legal</span> › <span>Grievance Redressal</span>
            </p>

            <Link
              href="/"
              className="text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: C.pink }}
            >
              ← Back to Welvors
            </Link>
          </div>

          {/* Badge */}
          <div
            className="mt-4 inline-flex items-center rounded-full border px-3 py-1"
            style={{ borderColor: "#F0CFDC", backgroundColor: "#FCEDF2" }}
          >
            <span
              className="text-[10.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: C.pink }}
            >
              Legal · Grievance Redressal
            </span>
          </div>

          {/* Heading */}
          <h1
            className="mt-6 text-3xl leading-tight sm:mt-4 sm:text-4xl lg:text-[2.6rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            {grievanceRedressal.title}
          </h1>

        </div>
      </div>

      {/* ==================== Body ==================== */}
      <div className="mx-auto max-w-7xl px-4 pt-0 py-6 mt-0 sm:pt-0 sm:px-6 sm:py-8 lg:px-8">
        {content.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </main>
  );
}
