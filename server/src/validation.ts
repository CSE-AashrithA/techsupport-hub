export const CATEGORIES = ["hardware", "software", "network", "account", "other"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface NewTicket {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

// either the cleaned-up value, or a message for each field that needs fixing
export type Validation<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateNewTicket(body: unknown): Validation<NewTicket> {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const title = cleanText(input.title);
  if (!title) errors.title = "Add a short title";
  else if (title.length > 200) errors.title = "Keep the title under 200 characters";

  const description = cleanText(input.description);
  if (!description) errors.description = "Describe what's going on";
  else if (description.length > 5000) errors.description = "Keep the details under 5000 characters";

  const category = input.category;
  if (!isOneOf(category, CATEGORIES)) errors.category = `Pick one of: ${CATEGORIES.join(", ")}`;

  const priority = input.priority ?? "medium";
  if (!isOneOf(priority, PRIORITIES)) errors.priority = `Pick one of: ${PRIORITIES.join(", ")}`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { title, description, category: category as Category, priority: priority as Priority },
  };
}

export interface TicketFilters {
  status: Status | null;
  priority: Priority | null;
}

// reads ?status= and ?priority= from the url. leaving one out means "any".
export function parseTicketFilters(query: Record<string, unknown>): Validation<TicketFilters> {
  const errors: Record<string, string> = {};
  const status = query.status ?? null;
  const priority = query.priority ?? null;

  if (status !== null && !isOneOf(status, STATUSES)) {
    errors.status = `Pick one of: ${STATUSES.join(", ")}`;
  }
  if (priority !== null && !isOneOf(priority, PRIORITIES)) {
    errors.priority = `Pick one of: ${PRIORITIES.join(", ")}`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { status: status as Status | null, priority: priority as Priority | null } };
}

// ids in urls arrive as text, so check it's a real positive whole number
export function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// an update or reply posted on a ticket
export function validateNewComment(body: unknown): Validation<{ body: string }> {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const text = cleanText(input.body);
  if (!text) return { ok: false, errors: { body: "Write something first" } };
  if (text.length > 5000) return { ok: false, errors: { body: "Keep it under 5000 characters" } };
  return { ok: true, value: { body: text } };
}

// moving a ticket along: open -> in_progress -> resolved -> closed (or back again)
export function validateStatusChange(body: unknown): Validation<{ status: Status }> {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  if (!isOneOf(input.status, STATUSES)) {
    return { ok: false, errors: { status: `Pick one of: ${STATUSES.join(", ")}` } };
  }
  return { ok: true, value: { status: input.status } };
}
