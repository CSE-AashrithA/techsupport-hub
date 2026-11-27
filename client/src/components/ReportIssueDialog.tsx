import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { api, ApiError } from "../api";
import { CATEGORIES, PRIORITIES, label, type NewTicket, type Ticket } from "../types";

interface ReportIssueDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
}

const emptyForm: NewTicket = { title: "", description: "", category: "hardware", priority: "medium" };
const DESCRIPTION_LIMIT = 5000;

const inputClass =
  "mt-2 block w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 text-cream placeholder:text-mist/50 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30 aria-[invalid=true]:border-urgent";

// uses the browser's built-in <dialog>, which handles Esc, focus and the dark backdrop for us
export default function ReportIssueDialog({ open, onClose, onCreated }: ReportIssueDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<NewTicket>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function update<K extends keyof NewTicket>(key: K, value: NewTicket[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    // clear that field's error as soon as the person edits it
    setErrors(({ [key]: _removed, ...rest }) => rest);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // quick checks before bothering the server
    const missing: Record<string, string> = {};
    if (!form.title.trim()) missing.title = "Add a short title";
    if (!form.description.trim()) missing.description = "Describe what's going on";
    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const ticket = await api.createTicket(form);
      setForm(emptyForm);
      setErrors({});
      onCreated(ticket);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) setErrors(err.fields);
      else setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="report-issue-title"
      onClose={onClose}
      // clicking the dark area around the box closes it
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className="m-auto w-[min(640px,calc(100%-2rem))] rounded-2xl border border-white/10 bg-ink-800 p-0 text-cream shadow-[0_40px_120px_-30px] shadow-signal/40 backdrop:bg-ink-950/75 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-signal">New ticket</p>
            <h2 id="report-issue-title" className="mt-2 font-display text-3xl font-bold tracking-tight">
              Report an issue
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full border border-white/10 text-mist transition hover:border-white/30 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
          >
            ✕
          </button>
        </div>

        {formError && (
          <p role="alert" className="mt-5 rounded-xl border border-urgent/40 bg-urgent/10 px-4 py-3 text-sm">
            {formError}
          </p>
        )}

        <div className="mt-6 space-y-6">
          <Field id="title" label="What's wrong?" error={errors.title}>
            <input
              id="title"
              // the cursor starts here when the dialog opens, so you can type right away
              autoFocus
              value={form.title}
              maxLength={200}
              onChange={(e) => update("title", e.target.value)}
              placeholder="My laptop won't connect to Wi-Fi"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={inputClass}
            />
          </Field>

          <ChipGroup
            name="category"
            legend="Category"
            options={CATEGORIES}
            value={form.category}
            onChange={(value) => update("category", value)}
            error={errors.category}
          />

          <ChipGroup
            name="priority"
            legend="How urgent is it?"
            options={PRIORITIES}
            value={form.priority}
            onChange={(value) => update("priority", value)}
            error={errors.priority}
          />

          <Field id="description" label="Details" error={errors.description}>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              maxLength={DESCRIPTION_LIMIT}
              onChange={(e) => update("description", e.target.value)}
              placeholder="When did it start, what have you tried, anything that might help."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-error" : undefined}
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1.5 text-right text-xs text-mist/60 tabular-nums">
              {form.description.length} / {DESCRIPTION_LIMIT}
            </p>
          </Field>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-mist transition hover:border-white/30 hover:text-cream"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-signal-strong px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-6px] shadow-signal transition hover:bg-signal disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Submit ticket"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function Field({
  id,
  label: text,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow text-mist">
        {text}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-urgent">
          {error}
        </p>
      )}
    </div>
  );
}

// a row of pill buttons that act like radio buttons (keyboard and screen reader friendly)
function ChipGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-mist">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span
              className={`block rounded-full border border-white/10 px-4 py-2 text-sm text-mist transition hover:border-white/30 hover:text-cream peer-checked:border-signal peer-checked:bg-signal/15 peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-signal/50 ${
                option === "urgent" ? "peer-checked:border-urgent peer-checked:bg-urgent/15 peer-checked:shadow-[0_0_18px_-4px] peer-checked:shadow-urgent" : ""
              }`}
            >
              {label(option)}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-urgent">{error}</p>}
    </fieldset>
  );
}
