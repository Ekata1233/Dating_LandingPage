"use client";

import { cn } from "cn";
import { Plus, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { StepFooter } from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS } from "../stepSchemas";

/* -------------------------------------------------------------------------- */
/*  Step 9 — Prompts.                                                           */
/*                                                                            */
/*  The data object holds only *completed* answers — a prompt the user opened    */
/*  but didn't write in is not kept, so `answers.length` is an honest count and */
/*  the step's own min-1 rule is satisfied only by real text.                   */
/* -------------------------------------------------------------------------- */

const PROMPTS = [
  "A perfect Sunday looks like…",
  "The way to win me over is…",
  "I'm convinced that…",
  "My most controversial opinion is…",
  "Two truths and a lie",
  "I get way too competitive about…",
  "The last trip that changed me",
  "You should NOT go out with me if…",
];

const MAX_ANSWERS = STEP_SCHEMAS.prompts.fields[0].max ?? 3;
const MAX_LENGTH = 250;

interface Answer {
  prompt: string;
  answer: string;
}

export default function PromptsStep() {
  const form = useStepForm("prompts");
  const answers = form.get<Answer[]>("answers") ?? [];
  const [draftPrompt, setDraftPrompt] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");

  const available = PROMPTS.filter((p) => !answers.some((a) => a.prompt === p));
  const full = answers.length >= MAX_ANSWERS;

  const commit = () => {
    const text = draft.trim();
    if (!draftPrompt || !text) return;
    form.set("answers", [...answers, { prompt: draftPrompt, answer: text.slice(0, MAX_LENGTH) }]);
    setDraftPrompt(null);
    setDraft("");
  };

  const remove = (prompt: string) => {
    form.set(
      "answers",
      answers.filter((a) => a.prompt !== prompt)
    );
  };

  return (
    <StepShell
      eyebrow="Prompts"
      title="A few questions."
      subtitle="Answer up to three. Specific beats clever — it's an easy way for someone to start a conversation."
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
        <div key={a.prompt} className="space-y-1.5 rounded-xl border border-border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold leading-snug">{a.prompt}</p>
            <button
              type="button"
              onClick={() => remove(a.prompt)}
              aria-label={`Remove answer for ${a.prompt}`}
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
            {draftPrompt}
          </Label>
          <Textarea
            id="prompt-draft"
            autoFocus
            rows={4}
            value={draft}
            maxLength={MAX_LENGTH}
            placeholder="Type your answer…"
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            }}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {draft.length} / {MAX_LENGTH}
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
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">Pick a prompt</p>
          <div className="space-y-1.5">
            {available.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDraftPrompt(p)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card",
                  "px-3 py-2.5 text-left text-sm transition-colors hover:border-primary"
                )}
              >
                {p}
                <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
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
