// shapes of the data the api sends back (matches server/src/routes/tickets.ts)

export const CATEGORIES = ["hardware", "software", "network", "account", "other"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  requesterName: string;
  assigneeName: string | null;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  authorName: string;
  authorRole: "employee" | "admin";
}

export interface TicketWithComments extends Ticket {
  comments: Comment[];
}

// "in_progress" -> "In progress"
export function label(value: string) {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
