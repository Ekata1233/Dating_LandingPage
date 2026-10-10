"use client";

import { cn } from "cn";
import { ArrowLeft, ChevronRight, Plus, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { StepFooter } from "../OnboardingFields";
import {
  usePromptCategories,
  type PromptCategory,
  type PromptItem,
} from "../../context/OnBoardingDataContext";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS } from "../stepSchemas";

/* -------------------------------------------------------------------------- */
/*  Step 9 — Prompts.                                                         */
/*                                                                            */
/*  Two views live in this one component:                                    */
/*    "list"   — the step as the user normally sees it: any answers already   */
/*                committed, plus a "Choose a prompt" trigger while there's   */
/*                still room for more (matches STEP_SCHEMAS' max).           */
/*    "picker" — a full-screen prompt browser (category pills + question     */
/*                list) fed by usePromptCategories(). Tapping a question      */
/*                drops you back on "list" with that prompt open as a draft, */
/*                exactly like the old inline flow did.                      */
/*                                                                            */
/*  The data object holds only *completed* answers — a prompt the user opened */
/*  but didn't write in is not kept, so `answers.length` is an honest count   */
/*  and the step's own min-1 rule is satisfied only by real text.            */
/* -------------------------------------------------------------------------- */

const MAX_ANSWERS = STEP_SCHEMAS.prompts.fields[0].max ?? 3;
const FALLBACK_MAX_LENGTH = 200;

interface Answer {
  promptId: string;
  question: string;
  answer: string;
}

/** Category name → emoji. The API doesn't ship icons, so these are matched
 *  by name; anything that doesn't match (a new category added later) still
 *  gets a sensible default instead of rendering blank. */
const CATEGORY_EMOJI: Record<string, string> = {
  "About me": "👋",
  "Personality & quirks": "✨",
  "Dating & Love": "💕",
  "Goals & values": "🎯",
  "Lifestyle & interests": "🌿",
  "Just for fun": "🎉",
  "Gen-Z corner": "🔥",
  "Marriage-minded": "💍",
};
const emojiFor = (name: string) => CATEGORY_EMOJI[name] ?? "💬";

export default function PromptsStep() {
  const form = useStepForm("prompts");
  const { categories, loading, error, refetch } = usePromptCategories();

  const answers = form.get<Answer[]>("answers") ?? [];
  const [view, setView] = React.useState<"list" | "picker">("list");
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = React.useState<PromptItem | null>(null);
  const [draft, setDraft] = React.useState("");

  const full = answers.length >= MAX_ANSWERS;
  const takenIds = React.useMemo(() => new Set(answers.map((a) => a.promptId)), [answers]);

  // Default to the first category once the list has loaded.
  React.useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0] ?? null;

  const commit = () => {
    const text = draft.trim();
    if (!draftPrompt || !text) return;
    const max = draftPrompt.maxLength || FALLBACK_MAX_LENGTH;
    form.set("answers", [
      ...answers,
      { promptId: draftPrompt.id, question: draftPrompt.question, answer: text.slice(0, max) },
    ]);
    setDraftPrompt(null);
    setDraft("");
  };

  const remove = (promptId: string) => {
    form.set(
      "answers",
      answers.filter((a) => a.promptId !== promptId)
    );
  };

  const openPicker = () => setView("picker");

  const choosePrompt = (prompt: PromptItem) => {
    setDraftPrompt(prompt);
    setDraft("");
    setView("list");
  };

  if (view === "picker") {
    return (
      <PromptPicker
        categories={categories}
        loading={loading}
        error={error}
        onRetry={refetch}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategoryId}
        takenIds={takenIds}
        onBack={() => setView("list")}
        onChoose={choosePrompt}
      />
    );
  }

  return (
    <StepShell
      eyebrow="Optional"
      title="Add a prompt or two."
      subtitle="A little personality goes a long way. Pick a prompt you like and answer it your way."
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={form.isComplete}
          skippable
          onSkip={() => form.skip()}
        />
      }
    >
      {answers.map((a) => (
        <div key={a.promptId} className="space-y-1.5 rounded-xl border border-border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold leading-snug">{a.question}</p>
            <button
              type="button"
              onClick={() => remove(a.promptId)}
              aria-label={`Remove answer for ${a.question}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{a.answer}</p>
        </div>
      ))}

      {draftPrompt && (
        <div className="space-y-1.5 rounded-xl border border-primary bg-primary-muted p-3">
          <Label htmlFor="prompt-draft" className="text-xs font-semibold">
            {draftPrompt.question}
          </Label>
          <Textarea
            id="prompt-draft"
            autoFocus
            rows={4}
            value={draft}
            maxLength={draftPrompt.maxLength || FALLBACK_MAX_LENGTH}
            placeholder="Type your answer…"
            onChange={(e) =>
              setDraft(e.target.value.slice(0, draftPrompt.maxLength || FALLBACK_MAX_LENGTH))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            }}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {draft.length} / {draftPrompt.maxLength || FALLBACK_MAX_LENGTH}
            </span>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraftPrompt(null);
                  setDraft("");
                }}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={commit} disabled={draft.trim() === ""}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {!full && !draftPrompt && (
        <button
          type="button"
          onClick={openPicker}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card",
            "px-4 py-4 text-left transition-colors hover:border-primary"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plus className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold">Choose a prompt</span>
        </button>
      )}

      {full && (
        <p className="text-[11px] text-muted-foreground">
          That&rsquo;s all three. Remove one to swap it out.
        </p>
      )}

      {form.errors.answers && (
        <p role="alert" className="text-[11px] font-medium text-destructive">
          {form.errors.answers}
        </p>
      )}
    </StepShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Full-screen prompt picker.                                                */
/* -------------------------------------------------------------------------- */

interface PromptPickerProps {
  categories: PromptCategory[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  activeCategory: PromptCategory | null;
  onCategoryChange: (id: string) => void;
  takenIds: Set<string>;
  onBack: () => void;
  onChoose: (prompt: PromptItem) => void;
}

function PromptPicker({
  categories,
  loading,
  error,
  onRetry,
  activeCategory,
  onCategoryChange,
  takenIds,
  onBack,
  onChoose,
}: PromptPickerProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* header */}
      <div className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <h2 className="flex-1 text-center text-lg font-semibold">Choose a prompt</h2>
        <span className="size-10 shrink-0" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {/* illustration */}
        {/* <div className="overflow-hidden rounded-3xl bg-primary-muted p-6">
          <PromptsIllustration className="mx-auto h-auto w-full max-w-[220px]" />
        </div> */}

        {/* category pills */}
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="Prompt categories"
        >
          {categories.map((c) => {
            const isActive = c.id === activeCategory?.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onCategoryChange(c.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground hover:border-primary"
                )}
              >
                <span aria-hidden="true">{emojiFor(c.name)}</span>
                {c.name}
              </button>
            );
          })}
        </div>

        {/* question list */}
        <div className="mt-4 space-y-2.5">
          {loading && (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading prompts…</p>
          )}

          {!loading && error && (
            <div className="space-y-2 py-6 text-center">
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="text-sm font-semibold text-primary underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && activeCategory && (
            <>
              {activeCategory.prompts.map((p) => {
                const taken = takenIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={taken}
                    onClick={() => onChoose(p)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-card",
                      "px-4 py-4 text-left text-sm font-medium transition-colors",
                      taken ? "cursor-not-allowed opacity-50" : "hover:border-primary"
                    )}
                  >
                    {p.question}
                    {taken ? (
                      <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                        Added
                      </span>
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    )}
                  </button>
                );
              })}

              {activeCategory.prompts.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No prompts in this category yet.
                </p>
              )}
            </>
          )}

          {!loading && !error && !activeCategory && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No prompt categories available right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* Small decorative illustration — kept as an inline SVG so this view has no
   extra image asset to ship or fetch. Swap for a real illustration asset
   whenever you have one. */
function PromptsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden="true">
      <circle cx="110" cy="112" r="78" fill="currentColor" className="text-primary/10" />
      <rect x="118" y="38" width="66" height="104" rx="12" fill="currentColor" className="text-primary" />
      <rect x="126" y="50" width="50" height="8" rx="4" fill="#fff" opacity="0.9" />
      <rect x="126" y="66" width="50" height="8" rx="4" fill="#fff" opacity="0.7" />
      <rect x="126" y="82" width="34" height="8" rx="4" fill="#fff" opacity="0.7" />
      <path
        d="M70 190c0-28 20-46 40-46s40 18 40 46"
        fill="currentColor"
        className="text-primary"
      />
      <circle cx="110" cy="118" r="18" fill="#f2c9a0" />
      <path d="M86 150c6-10 16-16 24-16s18 6 24 16" fill="currentColor" className="text-primary" />
      <rect x="40" y="150" width="14" height="40" rx="7" fill="currentColor" className="text-primary/70" />
      <ellipse cx="47" cy="150" rx="16" ry="10" fill="currentColor" className="text-primary/40" />
    </svg>
  );
}
