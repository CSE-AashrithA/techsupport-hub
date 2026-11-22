export const CATEGORIES = ["hardware", "software", "network", "account", "other"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];

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
