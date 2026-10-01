"use client";

/* -------------------------------------------------------------------------- */
/*  The form controls every step is built from.                                 */
/*                                                                            */
/*  Each one reads its value out of the step's own data object and writes back */
/*  on change — no local state, no lifted values, nothing to sync. The error   */
/*  line only appears once a field has actually been touched and failed, so    */
/*  nobody is shouted at before they have typed anything.                       */
/* -------------------------------------------------------------------------- */

import { cn } from "cn";
import { Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { FieldDef, FieldOption } from "./stepSchemas";

/* --------------------------------- shell ---------------------------------- */

export function FieldShell({
  field,
  error,
  htmlFor,
  hideLabel,
  children,
  className,
}: {
  field: FieldDef;
  error?: string;
  htmlFor?: string;
  /** For steps whose heading already comes from elsewhere, e.g. the API. */
  hideLabel?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        {!hideLabel && (
          <Label htmlFor={htmlFor} className="text-xs font-semibold tracking-wide text-foreground">
            {field.label}
          </Label>
        )}
        {(field.required === false && field.skippable === false) && (
          <span className="text-[9px] bg-pink-100 text-pink-400 px-1 py-0.5 rounded-sm font-medium uppercase tracking-wider text-muted-foreground">
            Optional
          </span>
        )}
      </div>

      {children}

      {field.hint && !error && (
        <p className="text-[11px] leading-snug text-muted-foreground">{field.hint}</p>
      )}
      {error && (
        <p role="alert" className="text-[11px] font-medium leading-snug text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- text ----------------------------------- */

export function TextField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  return (
    <FieldShell field={field} error={error} htmlFor={id}>
      <Input
        id={id}
        value={value}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function DateField({
  field,
  value,
  error,
  onChange,
  yearOnly = false,
  adultOnly = false,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  yearOnly?: boolean;
  adultOnly?: boolean;
}) {
  const id = React.useId();

  if (yearOnly) {
    const currentYear = new Date().getFullYear();

    const yearValue = value || String(currentYear);

    return (
      <FieldShell field={field} error={error} htmlFor={id}>
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          placeholder="YYYY"
          value={yearValue}
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            const year = e.target.value;

            if (!/^\d{0,4}$/.test(year)) return;

            onChange(year);
          }}
        />
      </FieldShell>
    );
  }

  const today = new Date();

  let maxDate: string | undefined;

  if (adultOnly) {
    const adultDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    maxDate = adultDate.toISOString().split("T")[0];
  }

  return (
    <FieldShell field={field} error={error} htmlFor={id}>
      <Input
        id={id}
        type="date"
        value={value}
        max={maxDate}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function TextareaField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  const count = value.length;
  const max = field.maxLength ?? 300;

  return (
    <FieldShell field={field} error={error} htmlFor={id}>
      <Textarea
        id={id}
        value={value}
        placeholder={field.placeholder}
        maxLength={max}
        rows={6}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        className=" resize-none"
      />
      <div className="flex justify-end">
        <span
          className={cn(
            "text-[10px] tabular-nums",
            count >= max ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {count} / {max}
        </span>
      </div>
    </FieldShell>
  );
}

/* -------------------------------- select ---------------------------------- */

export function SelectField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  /* Base UI renders the raw value in the trigger unless it is given `items`,
     which is how it knows the label to show for the current value. */
  const items = Object.fromEntries((field.options ?? []).map((o) => [o.value, o.label]));

  return (
    <FieldShell field={field} error={error} htmlFor={id}>
      <Select
        items={items}
        value={value || null}
        onValueChange={(v) => onChange((v as string) ?? "")}
      >
        <SelectTrigger
          id={id}
          className="h-11 w-full"
          aria-invalid={Boolean(error)}
          data-placeholder={field.placeholder}
        >
          <SelectValue placeholder={field.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              className="flex items-center"
            >
              <span>{o.label}</span>

              <span className="text-xs text-muted-foreground max-w-[150px]">
                {o.description}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

/* ---------------------------- choice: single ------------------------------ */

export function RadioField({
  field,
  // Defaulted because form state has no entry for an unanswered field, and a
  // RadioGroup that starts `undefined` then receives a string is uncontrolled
  // -> controlled, which Base UI rejects.
  value = "",
  error,
  onChange,
  options,
  disabled,
  hideLabel,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  /** Overrides the static list. Used by API-driven steps. */
  options?: readonly FieldOption[];
  disabled?: boolean;
  hideLabel?: boolean;
}) {
  const items = options ?? field.options ?? [];

  return (
    <FieldShell field={field} error={error} hideLabel={hideLabel}>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as string)}
        className="gap-2"
        aria-invalid={Boolean(error)}
        disabled={disabled}
      >
        {items.map((o) => {
          const id = `${field.name}-${o.value}`;
          return (
            <div
              key={o.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                value === o.value
                  ? "border-primary bg-primary-muted"
                  : "border-border bg-card hover:bg-muted"
              )}
            >
              <RadioGroupItem id={id} value={o.value} />
              <Label htmlFor={id} className="flex-1 cursor-pointer leading-tight">
                <span className="block text-sm font-medium">{o.label}</span>
                {o.description && (
                  <span className="block text-xs text-muted-foreground">{o.description}</span>
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </FieldShell>
  );
}

/* ---------------------------- choice: multiple ---------------------------- */

export function MultiField({
  field,
  values = [],
  error,
  onChange,
  max,
  hideCount = false,
}: {
  field: FieldDef;
  values: string[];
  error?: string;
  onChange: (v: string[]) => void;
  /**
   * Overrides the schema's `field.max` for this render. Needed where one budget
   * spans several fields — the caller works out what is left and passes it in,
   * because no single field knows the others' totals.
   */
  max?: number;
  /** Hides the "x / y selected" line, for steps that show one total instead. */
  hideCount?: boolean;
}) {
  const limit = max ?? field.max;
  const atMax = limit ? values.length >= limit : false;

  const toggle = (v: string) => {
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v));
      return;
    }
    /* Silently refuse the extra pick rather than letting the user select a
       thirteenth chip and then blocking them on Continue. */
    if (atMax) return;
    onChange([...values, v]);
  };

  return (
    <FieldShell field={field} error={error}>
      {!hideCount && limit && (
        <p className="pb-1 text-[10px] text-muted-foreground">
          {values.length} / {limit} selected
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {(field.options ?? []).map((o) => {
          const selected = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              disabled={!selected && atMax}
              onClick={() => toggle(o.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-40",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              )}
            >
              {selected && <Check className="size-3" aria-hidden="true" />}
              {o.label}
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

/* --------------------------- choice: checkbox list ------------------------ */

export function CheckboxListField({
  field,
  values = [],
  error,
  onChange,
}: {
  field: FieldDef;
  values: string[];
  error?: string;
  onChange: (v: string[]) => void;
}) {
  return (
    <FieldShell field={field} error={error}>
      <div className="space-y-2">
        {(field.options ?? []).map((o) => {
          const id = `${field.name}-${o.value}`;
          const checked = values.includes(o.value);
          return (
            <div
              key={o.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() =>
                  onChange(
                    checked ? values.filter((x) => x !== o.value) : [...values, o.value]
                  )
                }
              />
              <Label htmlFor={id} className="flex-1 cursor-pointer leading-tight">
                <span className="block text-sm font-medium">{o.label}</span>
                {o.description && (
                  <span className="block text-xs text-muted-foreground">{o.description}</span>
                )}
              </Label>
            </div>
          );
        })}
      </div>
    </FieldShell>
  );
}

/* --------------------------------- footer -------------------------------- */

export function StepFooter({
  onSubmit,
  submitting,
  submitError,
  isValid,
  skippable,
  onSkip,
  continueLabel = "Continue",
}: {
  onSubmit: () => void;
  submitting?: boolean;
  submitError?: string | null;
  isValid: boolean;
  skippable?: boolean;
  onSkip?: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="space-y-2 px-5 pb-5 pt-3">
      {submitError && (
        <p role="alert" className="text-center text-[11px] font-medium text-destructive">
          {submitError}
        </p>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={!isValid || submitting}
        className="h-12 w-full rounded-xl bg-primary text-sm font-semibold"
      >
        {submitting ? "Saving…" : continueLabel}
      </Button>

      {skippable && (
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={submitting}
          className="h-9 w-full text-xs font-medium text-muted-foreground"
        >
          Skip for now
        </Button>
      )}
    </div>
  );
}
